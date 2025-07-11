import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, LoginResult } from '../types';
import { GymApiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
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

  // Función para iniciar sesión
  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const result = await GymApiService.login(username, password);
      
      if (result.success && result.user) {
        const userData = result.user;
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('Usuario autenticado:', userData);
        return { 
          success: true, 
          message: 'Inicio de sesión exitoso',
          user: userData
        };
      }
      
      return { 
        success: false, 
        message: result.message || 'Error al iniciar sesión. Por favor, intente nuevamente.'
      };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al iniciar sesión'
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