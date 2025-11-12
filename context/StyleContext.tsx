
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Style, Collection, Comment } from '../types';
import { MOCK_STYLES } from '../data/styles';
import { MOCK_COLLECTIONS } from '../data/collections';
import { MOCK_COMMENTS } from '../data/comments';
import { useAuth } from './AuthContext';
import { validateTitle, validateSref, validateDescription, validateComment } from '../utils/validation';
import { ValidationError, AuthenticationError, logError } from '../utils/errorHandling';

interface StyleContextType {
  styles: Style[];
  addStyle: (style: Omit<Style, 'id' | 'slug' | 'views' | 'likes' | 'likedBy' | 'creatorId' | 'createdAt' | 'updatedAt'>) => void;
  getStyleBySlug: (slug: string) => Style | undefined;
  incrementViewCount: (slug: string) => void;
  toggleLike: (styleId: string) => void;

  collections: Collection[];
  getCollectionById: (id: string) => Collection | undefined;
  getUserCollections: (userId: string) => Collection[];
  addCollection: (name: string, description: string) => void;
  updateCollection: (id: string, name: string, description: string) => void;
  deleteCollection: (id: string) => void;
  isStyleInCollection: (styleId: string, collectionId: string) => boolean;
  toggleStyleInCollection: (styleId: string, collectionId: string) => void;

  getCommentsForStyle: (styleId: string) => Comment[];
  addComment: (styleId: string, text: string) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

const STYLES_STORAGE_KEY = 'midjourney_style_library_styles';
const COLLECTIONS_STORAGE_KEY = 'midjourney_style_library_collections';
const COMMENTS_STORAGE_KEY = 'midjourney_style_library_comments';

export const StyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [styles, setStyles] = useState<Style[]>(() => {
    try {
      const localData = window.localStorage.getItem(STYLES_STORAGE_KEY);
      if (localData) return JSON.parse(localData);
    } catch (error) {
      logError(error as Error, { context: 'styles load from localStorage' });
    }
    window.localStorage.setItem(STYLES_STORAGE_KEY, JSON.stringify(MOCK_STYLES));
    return MOCK_STYLES;
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const localData = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        // Migrate old collections without userId
        const migrated = parsed.map((col: Collection) => ({
          ...col,
          userId: col.userId || 'user-1' // Default to first mock user for old data
        }));
        return migrated;
      }
    } catch (error) {
      logError(error as Error, { context: 'collections load from localStorage' });
    }
    // Add userId to mock collections
    const migratedMockCollections = MOCK_COLLECTIONS.map(col => ({
      ...col,
      userId: 'user-1' // Assign to first mock user
    }));
    window.localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(migratedMockCollections));
    return migratedMockCollections;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const localData = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (localData) return JSON.parse(localData);
    } catch (error) {
      logError(error as Error, { context: 'comments load from localStorage' });
    }
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(MOCK_COMMENTS));
    return MOCK_COMMENTS;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STYLES_STORAGE_KEY, JSON.stringify(styles));
    } catch (error) {
      logError(error as Error, { context: 'styles save to localStorage' });
    }
  }, [styles]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    } catch (error) {
      logError(error as Error, { context: 'collections save to localStorage' });
    }
  }, [collections]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
      logError(error as Error, { context: 'comments save to localStorage' });
    }
  }, [comments]);

  const addStyle = useCallback((newStyleData: Omit<Style, 'id' | 'slug' | 'views' | 'likes' | 'likedBy' | 'creatorId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to create a style.");
    }

    // Validate title
    const titleValidation = validateTitle(newStyleData.title);
    if (!titleValidation.valid) {
      throw new ValidationError(titleValidation.error || 'Invalid title');
    }

    // Validate sref
    const srefValidation = validateSref(newStyleData.sref);
    if (!srefValidation.valid) {
      throw new ValidationError(srefValidation.error || 'Invalid sref');
    }

    // Validate description if provided
    if (newStyleData.description) {
      const descValidation = validateDescription(newStyleData.description);
      if (!descValidation.valid) {
        throw new ValidationError(descValidation.error || 'Invalid description');
      }
    }

    // Validate images
    if (!newStyleData.images || newStyleData.images.length === 0) {
      throw new ValidationError('At least one image is required');
    }

    if (newStyleData.images.length > 4) {
      throw new ValidationError('Maximum 4 images allowed');
    }

    // FIXED: Generate unique slug with timestamp and random string (not just 1000 possibilities)
    const baseSlug = titleValidation.sanitized.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 6);
    const uniqueSlug = `${baseSlug}-${timestamp}-${randomStr}`;

    const newStyle: Style = {
      ...newStyleData,
      title: titleValidation.sanitized,
      description: newStyleData.description ? validateDescription(newStyleData.description).sanitized : undefined,
      id: `style-${timestamp}-${randomStr}`,
      slug: uniqueSlug,
      views: 0,
      likes: 0,
      likedBy: [],
      creatorId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStyles(prevStyles => [newStyle, ...prevStyles]);
  }, [currentUser]);

  const getStyleBySlug = useCallback((slug: string): Style | undefined => {
    return styles.find(style => style.slug === slug);
  }, [styles]);

  const incrementViewCount = useCallback((slug: string) => {
    setStyles(prevStyles => prevStyles.map(s => s.slug === slug ? { ...s, views: s.views + 1 } : s));
  }, []);

  const toggleLike = useCallback((styleId: string) => {
    if (!currentUser) return;
    setStyles(prevStyles => prevStyles.map(s => {
      if (s.id === styleId) {
        const isLiked = s.likedBy.includes(currentUser.id);
        return {
          ...s,
          likes: isLiked ? s.likes - 1 : s.likes + 1,
          likedBy: isLiked ? s.likedBy.filter(id => id !== currentUser.id) : [...s.likedBy, currentUser.id]
        };
      }
      return s;
    }));
  }, [currentUser]);

  const addCollection = useCallback((name: string, description: string) => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to create a collection.");
    }

    // Validate collection name
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ValidationError('Collection name is required');
    }

    if (trimmedName.length > 100) {
      throw new ValidationError('Collection name must be less than 100 characters');
    }

    // Validate description
    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      throw new ValidationError(descValidation.error || 'Invalid description');
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 6);
    const newCollection: Collection = {
      id: `coll-${timestamp}-${randomStr}`,
      name: trimmedName,
      description: descValidation.sanitized,
      styleIds: [],
      userId: currentUser.id, // FIXED: Add userId for ownership
      createdAt: new Date().toISOString()
    };
    setCollections(prev => [newCollection, ...prev]);
  }, [currentUser]);

  const getCollectionById = useCallback((id: string) => {
    return collections.find(c => c.id === id);
  }, [collections]);

  const getUserCollections = useCallback((userId: string) => {
    return collections.filter(c => c.userId === userId);
  }, [collections]);

  const updateCollection = useCallback((id: string, name: string, description: string) => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to update a collection.");
    }

    // Validate collection name
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ValidationError('Collection name is required');
    }

    if (trimmedName.length > 100) {
      throw new ValidationError('Collection name must be less than 100 characters');
    }

    // Validate description
    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      throw new ValidationError(descValidation.error || 'Invalid description');
    }

    setCollections(prev => prev.map(c => {
      if (c.id === id) {
        // Check ownership
        if (c.userId !== currentUser.id) {
          throw new AuthenticationError("You don't have permission to update this collection.");
        }
        return { ...c, name: trimmedName, description: descValidation.sanitized };
      }
      return c;
    }));
  }, [currentUser]);

  const deleteCollection = useCallback((id: string) => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to delete a collection.");
    }

    setCollections(prev => {
      const collection = prev.find(c => c.id === id);
      if (collection && collection.userId !== currentUser.id) {
        throw new AuthenticationError("You don't have permission to delete this collection.");
      }
      return prev.filter(c => c.id !== id);
    });
  }, [currentUser]);

  const isStyleInCollection = useCallback((styleId: string, collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.styleIds.includes(styleId) : false;
  }, [collections]);

  const toggleStyleInCollection = useCallback((styleId: string, collectionId: string) => {
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId) {
        const styleExists = collection.styleIds.includes(styleId);
        const newStyleIds = styleExists ? collection.styleIds.filter(id => id !== styleId) : [...collection.styleIds, styleId];
        return { ...collection, styleIds: newStyleIds };
      }
      return collection;
    }));
  }, []);

  const getCommentsForStyle = useCallback((styleId: string) => {
    return comments.filter(c => c.styleId === styleId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [comments]);

  const addComment = useCallback((styleId: string, text: string) => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to comment.");
    }

    // Validate comment
    const commentValidation = validateComment(text);
    if (!commentValidation.valid) {
      throw new ValidationError(commentValidation.error || 'Invalid comment');
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 6);
    const newComment: Comment = {
      id: `comment-${timestamp}-${randomStr}`,
      styleId,
      text: commentValidation.sanitized,
      authorId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  }, [currentUser]);

  return (
    <StyleContext.Provider value={{ styles, addStyle, getStyleBySlug, incrementViewCount, toggleLike, collections, getCollectionById, getUserCollections, addCollection, updateCollection, deleteCollection, isStyleInCollection, toggleStyleInCollection, getCommentsForStyle, addComment }}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyleContext = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyleContext must be used within a StyleProvider');
  }
  return context;
};
