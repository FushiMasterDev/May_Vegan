import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '@/services/authApi';
import { setTokens, clearTokens, getAccessToken } from '@/services/apiClient';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: authApi.RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password });
    setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
    return result.user;
  }

  async function register(payload: authApi.RegisterPayload) {
    const result = await authApi.register(payload);
    setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  async function refreshUser() {
    const u = await authApi.me();
    setUser(u);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
