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
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Verificando estado de autenticación...');
      
      // Verificar si hay datos en localStorage
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData) as User;
          console.log('Usuario encontrado en localStorage:', parsedUser.nombre, parsedUser.rol);
          
          // Verificar con el backend si la sesión sigue activa
          try {
            const authCheck = await GymApiService.checkAuth();
            
            if (authCheck.authenticated) {
              console.log('Sesión verificada con el backend');
              // Establecer el usuario
              setUser(parsedUser);
            } else {
              console.log('Sesión no válida en el backend, limpiando localStorage');
              localStorage.removeItem('userData');
              setUser(null);
            }
          } catch (authError) {
            console.error('Error al verificar con backend, pero manteniendo sesión local:', authError);
            // Si falla la verificación pero tenemos datos válidos, mantener la sesión
            // Esto permite trabajar offline o con problemas de conectividad
            setUser(parsedUser);
          }
        } catch (err) {
          console.error('Error al parsear datos de usuario:', err);
          localStorage.removeItem('userData');
          setUser(null);
        }
      } else {
        console.log('No hay datos de usuario en localStorage');
        setUser(null);
      }
    } catch (error) {
      console.error('Error inesperado al verificar autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      // Verificar con el backend si la sesión sigue activa
      const authCheck = await GymApiService.checkAuth();
      
      if (authCheck.authenticated) {
        // Si hay sesión activa, verificar si tenemos datos en localStorage
        const userData = localStorage.getItem('userData');
        if (userData && !user) {
          try {
            const parsedUser = JSON.parse(userData) as User;
            setUser(parsedUser);
          } catch (error) {
            console.error('Error al parsear datos de usuario:', error);
            localStorage.removeItem('userData');
          }
        }
      } else {
        // No hay sesión activa, limpiar datos
        if (user || localStorage.getItem('userData')) {
          console.log('Sesión no válida, limpiando datos');
          setUser(null);
          localStorage.removeItem('userData');
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
        
        // Guardar en localStorage
        localStorage.setItem('userData', JSON.stringify(result.user));
        
        // Establecer en el estado
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