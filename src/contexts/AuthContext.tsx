import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthContextType } from '../types';
import { GymApiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la aplicación
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Función para iniciar sesión
  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await GymApiService.login(username, password);
      
      if (response.token && response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message || 'Error al iniciar sesión. Por favor, intente nuevamente.' 
      };
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      return { 
        success: false, 
        message: error.message || 'Error de conexión. Por favor, intente nuevamente.' 
      };
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setUser(null);
    GymApiService.logout();
  };

  const value: AuthContextType = {
    user,
    login,
    logout: handleLogout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};