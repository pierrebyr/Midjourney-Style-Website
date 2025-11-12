
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Style, Collection, Comment } from '../types';
import { MOCK_STYLES } from '../data/styles';
import { MOCK_COLLECTIONS } from '../data/collections';
import { MOCK_COMMENTS } from '../data/comments';
import { useAuth } from './AuthContext';

interface StyleContextType {
  styles: Style[];
  addStyle: (style: Omit<Style, 'id' | 'slug' | 'views' | 'likes' | 'likedBy' | 'creatorId' | 'createdAt' | 'updatedAt'>) => void;
  getStyleBySlug: (slug: string) => Style | undefined;
  incrementViewCount: (slug: string) => void;
  toggleLike: (styleId: string) => void;

  collections: Collection[];
  getCollectionById: (id: string) => Collection | undefined;
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
    } catch (error) { console.error("Failed to load styles from localStorage:", error); }
    window.localStorage.setItem(STYLES_STORAGE_KEY, JSON.stringify(MOCK_STYLES));
    return MOCK_STYLES;
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const localData = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (localData) return JSON.parse(localData);
    } catch (error) { console.error("Failed to load collections from localStorage:", error); }
    window.localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(MOCK_COLLECTIONS));
    return MOCK_COLLECTIONS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const localData = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (localData) return JSON.parse(localData);
    } catch (error) { console.error("Failed to load comments from localStorage:", error); }
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(MOCK_COMMENTS));
    return MOCK_COMMENTS;
  });

  useEffect(() => {
    try { window.localStorage.setItem(STYLES_STORAGE_KEY, JSON.stringify(styles)); }
    catch (error) { console.error("Failed to save styles to localStorage:", error); }
  }, [styles]);

  useEffect(() => {
    try { window.localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections)); }
    catch (error) { console.error("Failed to save collections to localStorage:", error); }
  }, [collections]);

  useEffect(() => {
    try { window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments)); }
    catch (error) { console.error("Failed to save comments to localStorage:", error); }
  }, [comments]);


  const addStyle = useCallback((newStyleData: Omit<Style, 'id' | 'slug' | 'views' | 'likes' | 'likedBy' | 'creatorId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error("User must be logged in to create a style.");
    
    const slug = newStyleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const newStyle: Style = {
      ...newStyleData,
      id: `style-${Date.now()}`,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
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
      setStyles(prevStyles => prevStyles.map(s => s.slug === slug ? {...s, views: s.views + 1} : s));
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
    const newCollection: Collection = {
      id: `coll-${Date.now()}`, name, description, styleIds: [], createdAt: new Date().toISOString() };
    setCollections(prev => [newCollection, ...prev]);
  }, []);

  const getCollectionById = useCallback((id: string) => {
    return collections.find(c => c.id === id);
  }, [collections]);

  const updateCollection = useCallback((id: string, name: string, description: string) => {
    setCollections(prev => prev.map(c => c.id === id ? {...c, name, description} : c));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  }, []);

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
    return comments.filter(c => c.styleId === styleId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [comments]);

  const addComment = useCallback((styleId: string, text: string) => {
    if(!currentUser) throw new Error("User must be logged in to comment.");
    const newComment: Comment = {
        id: `comment-${Date.now()}`,
        styleId,
        text,
        authorId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  }, [currentUser]);

  return (
    <StyleContext.Provider value={{ styles, addStyle, getStyleBySlug, incrementViewCount, toggleLike, collections, getCollectionById, addCollection, updateCollection, deleteCollection, isStyleInCollection, toggleStyleInCollection, getCommentsForStyle, addComment }}>
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
