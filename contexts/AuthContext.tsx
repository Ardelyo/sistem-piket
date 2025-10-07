import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole, identifier: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('piket-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
      sessionStorage.removeItem('piket-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (role: UserRole, identifier: string, password?: string): Promise<boolean> => {
    setLoading(true);
    const result = await api.login(role, identifier, password);
    if (result.success && result.data) {
      const data: any = result.data;
      const userData: User = {
        id: data.id,
        namaLengkap: data.nama,
        foto: data.foto,
        role: role === 'Siswa' ? 'Siswa' : data.role,
        username: role !== 'Siswa' ? data.username : undefined,
      };
      setUser(userData);
      sessionStorage.setItem('piket-user', JSON.stringify(userData));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('piket-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};