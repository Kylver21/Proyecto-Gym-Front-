import axios from 'axios';
import type {
  User,
  Membership,
  MembershipRegistration,
  Payment,
  Product,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  AuthCheckResponse,
  LoginResult,
  CreateUserRequest,
  UpdateUserRequest,
  CreateMembershipRequest,
  CreateMembershipRegistrationRequest,
  CreatePaymentRequest,
  CreateProductRequest
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';
// Configuración de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Evitar popup de autenticación del navegador
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Para cookies de sesión
});

// Interceptor para añadir información de autenticación a las requests
api.interceptors.request.use(
  config => {
    // Solo log para debugging crítico
    if (config.url?.includes('/auth/')) {
      console.log('🔐 AUTH REQUEST:', config.method?.toUpperCase(), config.url);
    }
    
    // Obtener datos de usuario del localStorage
    const userData = localStorage.getItem('userData');
    
    // Si hay datos de usuario, añadir headers de autenticación si el backend los necesita
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Solo log si hay problema con el parsing
        // console.log('👤 Usuario en localStorage:', user.username, user.rol);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => {
    // Solo log para debugging crítico
    if (response.config.url?.includes('/auth/')) {
      console.log('✅ AUTH RESPONSE:', response.status, response.config.url);
    }
    return response;
  },
  error => {
    console.log('❌ ERROR RESPONSE:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response) {
      // Manejar errores de autenticación (401) o sesión expirada (419)
      if (error.response.status === 401 || error.response.status === 419) {
        console.warn('🚨 Error de autenticación:', {
          status: error.response.status,
          url: error.config?.url,
          method: error.config?.method
        });
        
        // Para errores 401, limpiar datos de autenticación excepto en login/register
        if (!error.config?.url?.includes('/auth/login') &&
            !error.config?.url?.includes('/auth/register')) {
          console.log('🧹 Limpiando datos de autenticación');
          localStorage.removeItem('userData');
          
          // Solo redirigir si no estamos ya en login y no es una petición de check auth
          if (!window.location.pathname.includes('/login') && 
              !error.config?.url?.includes('/auth/check')) {
            console.log('🔀 Redirigiendo a login...');
            window.location.href = '/login';
          }
        }
      }
      
      // Mejorar el mensaje de error para el usuario
      if (error.response.status === 403) {
        error.message = 'No tienes permiso para realizar esta acción';
      } else if (error.response.status === 500) {
        error.message = 'Error interno del servidor';
      } else if (error.response.status === 404) {
        error.message = 'Recurso no encontrado';
      }
    } else if (error.request) {
      // Error de red
      error.message = 'Error de conexión con el servidor';
    }
    
    return Promise.reject(error);
  }
);

export class GymApiService {
  // --- Autenticación ---
  static async login(username: string, password: string): Promise<LoginResult> {
    try {
      // Crear el objeto de login simple
      const loginData: LoginRequest = { 
        username, 
        password
      };
      
      // Hacer la petición al endpoint de login
      const response = await api.post<LoginResponse>('/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        // Si el login es exitoso y viene el usuario en la respuesta
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
          
          return { 
            success: true,
            message: response.data.message || 'Inicio de sesión exitoso',
            user: response.data.user
          };
        }
      }
      
      return { 
        success: false, 
        message: response.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      };
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Mostrar detalles específicos del error del backend
      if (error.response) {
        console.error('Error del servidor:', {
          status: error.response.status,
          data: error.response.data
        });
        
        // Devolver el mensaje específico del backend si está disponible
        const backendMessage = error.response.data?.message || error.response.data?.error;
        return { 
          success: false, 
          message: backendMessage || `Error del servidor (${error.response.status}): ${error.response.statusText}`
        };
      }
      
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al iniciar sesión'
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      console.log('Ejecutando logout en API...');
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión en servidor:', error);
      // No importa si falla, continuamos
    }
    // No remover localStorage aquí, lo maneja el contexto
  }

  static async checkAuth(): Promise<AuthCheckResponse> {
    try {
      console.log('Verificando autenticación con el backend...');
      // Intentar hacer una llamada simple que requiera autenticación
      // Si funciona, significa que estamos autenticados
      await api.get('/usuarios', {
        withCredentials: true
      });
      return { authenticated: true };
    } catch (error: any) {
      // Si hay error 401, significa que no está autenticado
      if (error.response?.status === 401) {
        return { authenticated: false };
      }
      // Para otros errores, también asumir que no está autenticado
      return { authenticated: false };
    }
  }

  static async register(userData: RegisterRequest): Promise<LoginResult> {
    try {
      // Hacer la petición al endpoint de registro
      const response = await api.post<LoginResponse>('/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        return { 
          success: true,
          message: response.data.message || 'Usuario registrado exitosamente',
          user: response.data.user
        };
      }
      
      return { 
        success: false, 
        message: response.data?.message || 'Error al registrar el usuario'
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al registrar el usuario'
      };
    }
  }

  // --- Usuarios ---
  static async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/usuarios');
      const users = response.data || [];
      
      const transformedUsers = users.map(user => {
        // Normalizar el rol - remover prefijo ROLE_ si existe
        const rolOriginal = user.rol || 'CLIENTE';
        const normalizedRol = rolOriginal.replace('ROLE_', '').toUpperCase();
        const validRol = ['ADMIN', 'EMPLEADO', 'CLIENTE'].includes(normalizedRol) 
          ? normalizedRol as 'ADMIN' | 'EMPLEADO' | 'CLIENTE'
          : 'CLIENTE' as 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
        
        const estado = Boolean(user.estado);
        
        const transformedUser = {
          ...user,
          // Asegurar que los campos estén disponibles
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          rol: validRol,
          username: user.username || '',
          estado: estado
        };
        
        return transformedUser;
      });
      
      return transformedUsers;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  static async getUser(id: number): Promise<User | null> {
    try {
      const response = await api.get<User>(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Error al obtener usuario ${id}:`, error);
      return null;
    }
  }

  static async createUser(userData: CreateUserRequest): Promise<User | null> {
    try {
      const response = await api.post<User>('/usuarios', userData);
      const user = response.data;
      
      // Transformar el rol del usuario creado
      if (user) {
        const normalizedRol = (user.rol || 'CLIENTE').replace('ROLE_', '').toUpperCase();
        const validRol = ['ADMIN', 'EMPLEADO', 'CLIENTE'].includes(normalizedRol) 
          ? normalizedRol as 'ADMIN' | 'EMPLEADO' | 'CLIENTE'
          : 'CLIENTE' as 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
        
        return {
          ...user,
          rol: validRol,
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          username: user.username || '',
          estado: Boolean(user.estado)
        };
      }
      
      return user;
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      // Lanzar el error para que el componente pueda manejarlo
      throw new Error(error.response?.data?.message || 'Error al crear el usuario');
    }
  }

  static async updateUser(id: number, userData: UpdateUserRequest): Promise<User | null> {
    try {
      const response = await api.put<User>(`/usuarios/${id}`, userData);
      const user = response.data;
      
      // Transformar el rol del usuario actualizado
      if (user) {
        const normalizedRol = (user.rol || 'CLIENTE').replace('ROLE_', '').toUpperCase();
        const validRol = ['ADMIN', 'EMPLEADO', 'CLIENTE'].includes(normalizedRol) 
          ? normalizedRol as 'ADMIN' | 'EMPLEADO' | 'CLIENTE'
          : 'CLIENTE' as 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
        
        return {
          ...user,
          rol: validRol,
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          username: user.username || '',
          estado: Boolean(user.estado)
        };
      }
      
      return user;
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el usuario');
    }
  }

  static async deleteUser(id: number): Promise<boolean> {
    try {
      await api.delete(`/usuarios/${id}`);
      return true;
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar el usuario');
    }
  }

  // --- Membresías ---
  static async getMemberships(): Promise<Membership[]> {
    try {
      const response = await api.get<Membership[]>('/membresias');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener membresías:', error);
      throw error;
    }
  }

  static async getMembership(id: number): Promise<Membership | null> {
    try {
      const response = await api.get<Membership>(`/membresias/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Error al obtener membresía ${id}:`, error);
      return null;
    }
  }

  static async getUserMemberships(usuarioId: number): Promise<Membership[]> {
    try {
      const response = await api.get<Membership[]>(`/membresias/usuario/${usuarioId}`);
      return response.data || [];
    } catch (error) {
      console.warn(`Error al obtener membresías del usuario ${usuarioId}:`, error);
      return [];
    }
  }

  static async createMembership(membershipData: CreateMembershipRequest): Promise<Membership | null> {
    try {
      const response = await api.post<Membership>('/membresias', membershipData);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear membresía:', error);
      throw new Error(error.response?.data?.message || 'Error al crear la membresía');
    }
  }

  static async updateMembership(id: number, membershipData: Partial<CreateMembershipRequest>): Promise<Membership | null> {
    try {
      const response = await api.put<Membership>(`/membresias/${id}`, membershipData);
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar membresía:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la membresía');
    }
  }

  static async deleteMembership(id: number): Promise<boolean> {
    try {
      await api.delete(`/membresias/${id}`);
      return true;
    } catch (error: any) {
      console.error('Error al eliminar membresía:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar la membresía');
    }
  }

  // --- Registro de Membresías ---
  static async createMembershipRegistration(registrationData: CreateMembershipRegistrationRequest): Promise<MembershipRegistration | null> {
    try {
      const response = await api.post<MembershipRegistration>('/registro-membresias', registrationData);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear registro de membresía:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar la membresía');
    }
  }

  static async getUserMembershipRegistrations(usuarioId: number): Promise<MembershipRegistration[]> {
    try {
      const response = await api.get<MembershipRegistration[]>(`/registro-membresias/usuario/${usuarioId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error al obtener registros de membresía del usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  // --- Pagos ---
  static async createPayment(paymentData: CreatePaymentRequest): Promise<Payment | null> {
    try {
      const response = await api.post<Payment>('/pagos', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear pago:', error);
      throw new Error(error.response?.data?.message || 'Error al procesar el pago');
    }
  }

  static async getUserPayments(usuarioId: number): Promise<Payment[]> {
    try {
      const response = await api.get<Payment[]>(`/pagos/usuario/${usuarioId}`);
      return response.data || [];
    } catch (error) {
      console.warn(`Error al obtener pagos del usuario ${usuarioId}:`, error);
      return [];
    }
  }

  // --- Productos ---
  static async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/productos');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  static async getProduct(id: number): Promise<Product | null> {
    try {
      const response = await api.get<Product>(`/productos/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Error al obtener producto ${id}:`, error);
      return null;
    }
  }

  static async createProduct(productData: CreateProductRequest): Promise<Product | null> {
    try {
      const response = await api.post<Product>('/productos', productData);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el producto');
    }
  }

  static async updateProduct(id: number, productData: Partial<CreateProductRequest>): Promise<Product | null> {
    try {
      const response = await api.put<Product>(`/productos/${id}`, productData);
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar producto:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el producto');
    }
  }

  static async deleteProduct(id: number): Promise<boolean> {
    try {
      await api.delete(`/productos/${id}`);
      return true;
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar el producto');
    }
  }
}