import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'USER';
  storeSlug?: string | null;
}

interface AuthContextType {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  apiFetch: (endpoint: string, options?: RequestInit, storeSlugOverride?: string) => Promise<any>;
  setSessionExpired: (expired: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpired: false,
  login: async () => {},
  logout: async () => {},
  apiFetch: async () => ({}),
  setSessionExpired: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    // Check initial auth state from localStorage
    const storedToken = localStorage.getItem('admin_access_token');
    const storedUser = localStorage.getItem('admin_user');
    const storedRefresh = localStorage.getItem('admin_refresh_token');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setAccessToken(storedToken);
      } catch (e) {
        localStorage.removeItem('admin_user');
      }
    } else if (storedRefresh) {
      // Attempt silent refresh on startup
      refreshAccessToken(storedRefresh);
    }
    setIsLoading(false);
  }, []);

  const refreshAccessToken = async (rToken?: string): Promise<string | null> => {
    const tokenToUse = rToken || localStorage.getItem('admin_refresh_token');
    if (!tokenToUse) {
      handleSessionExpiry();
      return null;
    }

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokenToUse })
      });

      if (!res.ok) {
        handleSessionExpiry();
        return null;
      }

      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        localStorage.setItem('admin_access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('admin_refresh_token', data.refreshToken);
        }
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }
        setSessionExpired(false);
        return data.accessToken;
      }
    } catch (e) {
      handleSessionExpiry();
    }
    return null;
  };

  const handleSessionExpiry = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    setSessionExpired(true);
  };

  const login = async (email: string, password: string) => {
    setSessionExpired(false);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Identifiants invalides');
    }

    // Role check: Only SUPER_ADMIN and STORE_ADMIN can access backoffice
    if (data.user?.role !== 'SUPER_ADMIN' && data.user?.role !== 'STORE_ADMIN' && data.user?.role !== 'ADMIN') {
      throw new Error('Accès réservé aux administrateurs. Votre compte utilisateur standard ne possède pas les droits requis.');
    }

    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem('admin_access_token', data.accessToken);
    localStorage.setItem('admin_refresh_token', data.refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(data.user));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
    handleSessionExpiry();
    setSessionExpired(false);
  };

  // Secure API fetch with automatic token injection and refresh retry
  const apiFetch = async (endpoint: string, options: RequestInit = {}, storeSlugOverride?: string) => {
    const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    let currentToken = accessToken || localStorage.getItem('admin_access_token');

    const executeReq = async (token: string | null) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (storeSlugOverride && storeSlugOverride !== 'all') {
        headers['x-store-slug'] = storeSlugOverride;
      }

      return await fetch(url, { ...options, headers });
    };

    let res = await executeReq(currentToken);

    // If 401 Unauthorized, attempt refresh
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await executeReq(newToken);
      } else {
        throw new Error('Session expirée, veuillez vous reconnecter.');
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Erreur lors de la requête API');
    }

    return res.json();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        sessionExpired,
        login,
        logout,
        apiFetch,
        setSessionExpired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
