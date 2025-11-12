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
 * Authentication API
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
 * Styles API
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
    return request<{ styles: any[] }>(`/styles?${queryParams}`);
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

  toggleLike: async (styleId: string) => {
    return request<{ isLiked: boolean }>(`/styles/${styleId}/like`, {
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
 * Collections API
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
    return request<void>(`/collections/${collectionId}/styles/${styleId}`, {
      method: 'POST',
    });
  },

  removeStyle: async (collectionId: string, styleId: string) => {
    return request<void>(`/collections/${collectionId}/styles/${styleId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Users API
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
 * Gemini AI API
 */
export const geminiApi = {
  parsePrompt: async (prompt: string) => {
    return request<{ params: any; method: string }>('/gemini/parse-prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },
};

/**
 * Export token utilities for use in contexts
 */
export const tokenUtils = {
  getToken,
  setToken,
  removeToken,
};
