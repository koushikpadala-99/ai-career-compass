// API Client with JWT token handling

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class APIClient {
  private getTokens() {
    try {
      const tokens = localStorage.getItem('tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens?.refresh) return null;

    try {
      const response = await fetch(`${API_URL}/users/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: tokens.refresh,
        }),
      });

      if (!response.ok) {
        // Refresh token is invalid, logout user
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return null;
      }

      const data = await response.json();
      const newTokens = {
        access: data.access,
        refresh: tokens.refresh,
      };

      localStorage.setItem('tokens', JSON.stringify(newTokens));
      return data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, headers = {}, ...restOptions } = options;

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const tokens = this.getTokens();
      if (tokens?.access) {
        requestHeaders['Authorization'] = `Bearer ${tokens.access}`;
      }
    }

    try {
      let response = await fetch(`${API_URL}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
      });

      // If unauthorized and requires auth, try to refresh token
      if (response.status === 401 && requiresAuth) {
        const newAccessToken = await this.refreshToken();
        
        if (newAccessToken) {
          // Retry request with new token
          requestHeaders['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(`${API_URL}${endpoint}`, {
            ...restOptions,
            headers: requestHeaders,
          });
        } else {
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Convenience methods
  get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  post<T>(endpoint: string, data: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  put<T>(endpoint: string, data: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  patch<T>(endpoint: string, data: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  delete<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export const apiClient = new APIClient();
