import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  isSalesManager: boolean;
  isSalesRepresentative: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.data) {
        const uDto: UserDto = {
          id: res.data.id,
          email: res.data.email,
          fullName: res.data.fullName,
          phone: res.data.phone,
          isActive: res.data.isActive,
          roles: res.data.roles,
          permissions: [],
          createdAtUtc: res.data.createdAtUtc
        };
        setUser(uDto);
        localStorage.setItem('user', JSON.stringify(uDto));
      } else {
        logout();
      }
    } catch {
      // keep cached user if network temporarily failed
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    const res = await api.login({ email, password: pass });
    setIsLoading(false);

    if (res.success && res.data) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true, message: res.message };
    }

    return {
      success: false,
      message: res.message || (res.errors && res.errors[0]) || 'Login failed'
    };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.roles.includes('SuperAdmin')) return true;
    return user.permissions.includes(perm);
  };

  const isSuperAdmin = hasRole('SuperAdmin');
  const isSalesManager = hasRole('SalesManager');
  const isSalesRepresentative = hasRole('SalesRepresentative');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
        isSuperAdmin,
        isSalesManager,
        isSalesRepresentative,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
