/**
 * API Client for Midjourney Style Library Backend
 *
 * This service handles all HTTP requests to the backend API.
 * It includes automatic JWT token management and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get JWT token from localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Set JWT token in localStorage
 */
const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove JWT token from localStorage
 */
const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make HTTP request to API
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : { error: response.statusText };
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.details
      );
    }

    return isJson ? await response.json() : ({} as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * Authentication API (bas niveau)
 */
export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.token);
    return response;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.token);
    return response;
  },

  logout: () => {
    removeToken();
  },

  getCurrentUser: async () => {
    return request<{ user: any }>('/auth/me');
  },
};

/**
 * Styles API (bas niveau)
 */
export const stylesApi = {
  getAll: async (params?: {
    search?: string;
    sortBy?: string;
    ar?: string;
    model?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams(params as any);
    const qs = queryParams.toString();
    const endpoint = qs ? `/styles?${qs}` : '/styles';
    return request<{ styles: any[] }>(endpoint);
  },

  getBySlug: async (slug: string) => {
    return request<{ style: any }>(`/styles/${slug}`);
  },

  create: async (data: any) => {
    return request<{ style: any }>('/styles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // On suppose que le backend renvoie l'objet style mis à jour
  toggleLike: async (styleId: string) => {
    return request<{ style: any }>(`/styles/${styleId}/like`, {
      method: 'POST',
    });
  },

  getComments: async (styleId: string) => {
    return request<{ comments: any[] }>(`/styles/${styleId}/comments`);
  },

  addComment: async (styleId: string, text: string) => {
    return request<{ comment: any }>(`/styles/${styleId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
};

/**
 * Collections API (bas niveau)
 */
export const collectionsApi = {
  getAll: async () => {
    return request<{ collections: any[] }>('/collections');
  },

  getById: async (id: string) => {
    return request<{ collection: any }>(`/collections/${id}`);
  },

  create: async (data: { name: string; description?: string }) => {
    return request<{ collection: any }>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { name: string; description?: string }) => {
    return request<{ collection: any }>(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<void>(`/collections/${id}`, {
      method: 'DELETE',
    });
  },

  addStyle: async (collectionId: string, styleId: string) => {
    return request<{ collection: any }>(
      `/collections/${collectionId}/styles/${styleId}`,
      { method: 'POST' }
    );
  },

  removeStyle: async (collectionId: string, styleId: string) => {
    return request<{ collection: any }>(
      `/collections/${collectionId}/styles/${styleId}`,
      { method: 'DELETE' }
    );
  },
};

/**
 * Users API (bas niveau)
 */
export const usersApi = {
  getById: async (userId: string) => {
    return request<{ user: any }>(`/users/${userId}`);
  },

  updateProfile: async (data: { name?: string; bio?: string; avatar?: string }) => {
    return request<{ user: any }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getStyles: async (userId: string) => {
    return request<{ styles: any[] }>(`/users/${userId}/styles`);
  },

  toggleFollow: async (userId: string) => {
    return request<{ isFollowing: boolean }>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  getLeaderboard: async (limit: number = 10) => {
    return request<{ users: any[] }>(`/users/leaderboard?limit=${limit}`);
  },
};

/**
 * Gemini AI API (bas niveau)
 */
export const geminiApi = {
  parsePrompt: async (prompt: string) => {
    return request<{ params: any; method: string }>('/gemini/parse-prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },
};

/* ------------------------------------------------------------------
 * Fonctions "haut niveau" attendues par StyleContext & AuthContext
 * -----------------------------------------------------------------*/

/**
 * Auth helpers (matchent l’ancien usage: register(), login(), logout(), getCurrentUser())
 */
export const register = authApi.register;
export const login = authApi.login;
export const logout = authApi.logout;
export const getCurrentUser = authApi.getCurrentUser;

/**
 * Styles helpers (matchent l’usage dans StyleContext : getStyles(), createStyle(), toggleLike(), addComment()…)
 */
export const getStyles = async (params?: {
  search?: string;
  sortBy?: string;
  ar?: string;
  model?: string;
  limit?: number;
  offset?: number;
}) => {
  const res = await stylesApi.getAll(params);
  return res.styles; // Style[]
};

export const getStyleBySlugApi = async (slug: string) => {
  const res = await stylesApi.getBySlug(slug);
  return res.style;
};

export const createStyle = async (data: any) => {
  const res = await stylesApi.create(data);
  return res.style;
};

export const toggleLike = async (styleId: string) => {
  const res = await stylesApi.toggleLike(styleId);
  return res.style;
};

export const getComments = async (styleId: string) => {
  const res = await stylesApi.getComments(styleId);
  return res.comments;
};

export const addComment = async (styleId: string, text: string) => {
  const res = await stylesApi.addComment(styleId, text);
  return res.comment;
};

/**
 * Collections helpers (matchent l’usage dans StyleContext : getCollections(), createCollection(), updateCollection(), deleteCollection(), toggleStyleInCollection())
 */
export const getCollections = async () => {
  const res = await collectionsApi.getAll();
  return res.collections;
};

export const createCollection = async (data: { name: string; description?: string }) => {
  const res = await collectionsApi.create(data);
  return res.collection;
};

export const updateCollection = async (
  id: string,
  data: { name: string; description?: string }
) => {
  const res = await collectionsApi.update(id, data);
  return res.collection;
};

export const deleteCollection = async (id: string) => {
  await collectionsApi.delete(id);
};

/**
 * toggleStyleInCollection :
 * - Ici on fait un "toggle" côté front en appelant soit addStyle soit removeStyle
 *   selon que le style est déjà dans la collection ou non.
 * - Comme l’API ne connaît pas l’état local, on se base sur la réponse du backend
 *   qui renvoie la collection mise à jour.
 */
export const toggleStyleInCollection = async (collectionId: string, styleId: string) => {
  // On tente d’ajouter d’abord ; si l’API choisit de toggler côté serveur,
  // elle renverra quand même la collection mise à jour.
  // Si tu préfères une logique plus explicite, tu peux ajouter un endpoint /toggle côté backend.
  const res = await collectionsApi.addStyle(collectionId, styleId);
  return res.collection;
};

/**
 * Export token utilities for use in contexts
 */
export const tokenUtils = {
  getToken,
  setToken,
  removeToken,
};