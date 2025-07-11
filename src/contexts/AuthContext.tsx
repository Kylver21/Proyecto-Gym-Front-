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

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Primero verificar si hay datos en localStorage
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData) as User;
          
          // Verificar con el servidor si la sesión sigue activa
          const authCheck = await GymApiService.checkAuth();
          
          if (authCheck.authenticated && authCheck.user) {
            setUser(authCheck.user);
            // Actualizar localStorage con datos frescos
            localStorage.setItem('userData', JSON.stringify(authCheck.user));
          } else {
            // Sesión expirada, limpiar datos
            handleLogout();
          }
        } catch (error) {
          console.error('Error al verificar datos del usuario:', error);
          handleLogout();
        }
      } else {
        // No hay datos en localStorage, verificar con el servidor
        const authCheck = await GymApiService.checkAuth();
        
        if (authCheck.authenticated && authCheck.user) {
          setUser(authCheck.user);
          localStorage.setItem('userData', JSON.stringify(authCheck.user));
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    await checkAuthStatus();
  };

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const result = await GymApiService.login(username, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log('Usuario autenticado:', result.user);
        return result;
      }
      
      return result;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al iniciar sesión'
      };
    }
  };

  const handleLogout = async () => {
    try {
      await GymApiService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userData');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout: handleLogout,
    checkAuth,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'ADMIN',
    isEmployee: user?.rol === 'EMPLEADO',
    isClient: user?.rol === 'CLIENTE',
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