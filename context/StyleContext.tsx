
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Style, Collection, Comment } from '../types';
import { useAuth } from './AuthContext';
import * as api from '../services/api';
import { validateTitle, validateSref, validateDescription, validateComment } from '../utils/validation';
import { ValidationError, AuthenticationError, logError } from '../utils/errorHandling';

interface StyleContextType {
  styles: Style[];
  addStyle: (style: Omit<Style, 'id' | 'slug' | 'views' | 'likes' | 'likedBy' | 'creatorId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getStyleBySlug: (slug: string) => Style | undefined;
  incrementViewCount: (slug: string) => void;
  toggleLike: (styleId: string) => Promise<void>;
  refreshStyles: () => Promise<void>;

  collections: Collection[];
  getCollectionById: (id: string) => Collection | undefined;
  getUserCollections: (userId: string) => Collection[];
  addCollection: (name: string, description: string) => Promise<void>;
  updateCollection: (id: string, name: string, description: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  isStyleInCollection: (styleId: string, collectionId: string) => boolean;
  toggleStyleInCollection: (styleId: string, collectionId: string) => Promise<void>;
  refreshCollections: () => Promise<void>;

  getCommentsForStyle: (styleId: string) => Comment[];
  addComment: (styleId: string, text: string) => Promise<void>;

  isLoading: boolean;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [styles, setStyles] = useState<Style[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [comments, setComments] = useState<{ [styleId: string]: Comment[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load styles on mount
  useEffect(() => {
    const loadStyles = async () => {
      try {
        const fetchedStyles = await api.getStyles();
        setStyles(fetchedStyles);
      } catch (error) {
        logError(error as Error, { context: 'loadStyles' });
      } finally {
        setIsLoading(false);
      }
    };

    loadStyles();
  }, []);

  // Load collections when user changes
  useEffect(() => {
    const loadCollections = async () => {
      if (!currentUser) {
        setCollections([]);
        return;
      }

      try {
        const fetchedCollections = await api.getCollections();
        setCollections(fetchedCollections);
      } catch (error) {
        logError(error as Error, { context: 'loadCollections' });
      }
    };

    loadCollections();
  }, [currentUser]);

  const refreshStyles = useCallback(async () => {
    try {
      const fetchedStyles = await api.getStyles();
      setStyles(fetchedStyles);
    } catch (error) {
      logError(error as Error, { context: 'refreshStyles' });
      throw error;
    }
  }, []);

  const refreshCollections = useCallback(async () => {
    try {
      const fetchedCollections = await api.getCollections();
      setCollections(fetchedCollections);
    } catch (error) {
      logError(error as Error, { context: 'refreshCollections' });
      throw error;
    }
  }, []);

  const addStyle = useCallback(async (newStyleData: Omit<Style, 'id' | 'slug' | 'views' | 'likes' | 'likedBy' | 'creatorId' | 'createdAt' | 'updatedAt'>): Promise<void> => {
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

    try {
      const createdStyle = await api.createStyle({
        title: titleValidation.sanitized,
        description: newStyleData.description || '',
        sref: newStyleData.sref,
        images: newStyleData.images,
        tags: newStyleData.tags || [],
        category: newStyleData.category
      });

      // Add to local state
      setStyles(prevStyles => [createdStyle, ...prevStyles]);
    } catch (error) {
      logError(error as Error, { context: 'addStyle' });
      throw error;
    }
  }, [currentUser]);

  const getStyleBySlug = useCallback((slug: string): Style | undefined => {
    return styles.find(style => style.slug === slug);
  }, [styles]);

  const incrementViewCount = useCallback((slug: string) => {
    // Optimistic update
    setStyles(prevStyles => prevStyles.map(s => s.slug === slug ? { ...s, views: s.views + 1 } : s));

    // Backend will increment on fetch, no need for separate API call
  }, []);

  const toggleLike = useCallback(async (styleId: string) => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to like.");
    }

    try {
      const updatedStyle = await api.toggleLike(styleId);

      // Update local state
      setStyles(prevStyles => prevStyles.map(s => s.id === styleId ? updatedStyle : s));
    } catch (error) {
      logError(error as Error, { context: 'toggleLike' });
      throw error;
    }
  }, [currentUser]);

  const addCollection = useCallback(async (name: string, description: string): Promise<void> => {
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

    try {
      const createdCollection = await api.createCollection({
        name: trimmedName,
        description: descValidation.sanitized
      });

      // Add to local state
      setCollections(prev => [createdCollection, ...prev]);
    } catch (error) {
      logError(error as Error, { context: 'addCollection' });
      throw error;
    }
  }, [currentUser]);

  const getCollectionById = useCallback((id: string) => {
    return collections.find(c => c.id === id);
  }, [collections]);

  const getUserCollections = useCallback((userId: string) => {
    return collections.filter(c => c.userId === userId);
  }, [collections]);

  const updateCollection = useCallback(async (id: string, name: string, description: string): Promise<void> => {
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

    try {
      const updatedCollection = await api.updateCollection(id, {
        name: trimmedName,
        description: descValidation.sanitized
      });

      // Update local state
      setCollections(prev => prev.map(c => c.id === id ? updatedCollection : c));
    } catch (error) {
      logError(error as Error, { context: 'updateCollection' });
      throw error;
    }
  }, [currentUser]);

  const deleteCollection = useCallback(async (id: string): Promise<void> => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to delete a collection.");
    }

    try {
      await api.deleteCollection(id);

      // Remove from local state
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      logError(error as Error, { context: 'deleteCollection' });
      throw error;
    }
  }, [currentUser]);

  const isStyleInCollection = useCallback((styleId: string, collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.styleIds.includes(styleId) : false;
  }, [collections]);

  const toggleStyleInCollection = useCallback(async (styleId: string, collectionId: string): Promise<void> => {
    try {
      const updatedCollection = await api.toggleStyleInCollection(collectionId, styleId);

      // Update local state
      setCollections(prev => prev.map(c => c.id === collectionId ? updatedCollection : c));
    } catch (error) {
      logError(error as Error, { context: 'toggleStyleInCollection' });
      throw error;
    }
  }, []);

  const getCommentsForStyle = useCallback((styleId: string) => {
    return comments[styleId] || [];
  }, [comments]);

  const addComment = useCallback(async (styleId: string, text: string): Promise<void> => {
    if (!currentUser) {
      throw new AuthenticationError("User must be logged in to comment.");
    }

    // Validate comment
    const commentValidation = validateComment(text);
    if (!commentValidation.valid) {
      throw new ValidationError(commentValidation.error || 'Invalid comment');
    }

    try {
      const newComment = await api.addComment(styleId, commentValidation.sanitized);

      // Add to local state
      setComments(prev => ({
        ...prev,
        [styleId]: [...(prev[styleId] || []), newComment]
      }));
    } catch (error) {
      logError(error as Error, { context: 'addComment' });
      throw error;
    }
  }, [currentUser]);

  return (
    <StyleContext.Provider value={{
      styles,
      addStyle,
      getStyleBySlug,
      incrementViewCount,
      toggleLike,
      refreshStyles,
      collections,
      getCollectionById,
      getUserCollections,
      addCollection,
      updateCollection,
      deleteCollection,
      isStyleInCollection,
      toggleStyleInCollection,
      refreshCollections,
      getCommentsForStyle,
      addComment,
      isLoading
    }}>
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
