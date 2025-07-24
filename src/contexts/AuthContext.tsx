import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, LoginResult } from '../types';
import { GymApiService } from '../services/api';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    
    // Verificar autenticación solo cada 10 minutos para reducir consultas
    const interval = setInterval(async () => {
      if (user) {
        try {
          await GymApiService.checkAuth();
        } catch (error) {
          console.warn('Sesión expirada, redirigiendo al login');
          setUser(null);
        }
      }
    }, 10 * 60 * 1000); // 10 minutos en lugar de 5
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Verificando estado de autenticación...');
      
      // Verificar autenticación con el backend usando el endpoint que existe
      const authCheck = await GymApiService.checkAuth();
      
      if (authCheck.authenticated && authCheck.user) {
        console.log('Usuario autenticado:', authCheck.user.nombre, authCheck.user.rol);
        setUser(authCheck.user);
      } else {
        console.log('No hay sesión activa');
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      // Verificar con el backend si la sesión sigue activa
      const authCheck = await GymApiService.checkAuth();
      
      if (authCheck.authenticated && authCheck.user) {
        // Si hay sesión activa, actualizar los datos del usuario
        setUser(authCheck.user);
      } else {
        // No hay sesión activa, limpiar datos
        if (user) {
          console.log('Sesión no válida, limpiando datos');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      // En caso de error, mantener el estado actual
    }
  };

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      console.log('Intentando login para:', username);
      const result = await GymApiService.login(username, password);
      
      if (result.success && result.user) {
        console.log('Login exitoso. Usuario:', result.user.nombre, result.user.rol);
        
        // Establecer en el estado (no usar localStorage)
        setUser(result.user);
        
        return result;
      } else {
        console.log('Login falló:', result.message);
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
    console.log('Ejecutando logout...');
    try {
      await GymApiService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      console.log('Limpiando datos de usuario...');
      setUser(null);
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