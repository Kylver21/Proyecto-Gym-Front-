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
  CreateProductRequest,
  CreateProductSaleRequest
} from '../types';

// Configuración exacta según el backend
axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true
});

// Interceptor para añadir información de autenticación a las requests
api.interceptors.request.use(
  config => {
    // Solo log para debugging crítico
    if (config.url?.includes('/auth/')) {
      console.log('🔐 AUTH REQUEST:', config.method?.toUpperCase(), config.url);
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
        
        // Para errores 401, limpiar datos de autenticación excepto en login/register/check
        if (!error.config?.url?.includes('/auth/login') &&
            !error.config?.url?.includes('/auth/register') &&
            !error.config?.url?.includes('/auth/check')) {
          console.log('🧹 Limpiando datos de autenticación');
          
          // Solo redirigir si no estamos ya en login
          if (!window.location.pathname.includes('/login')) {
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
      // Intentar hacer una llamada simple que requiera autenticación
      // Si funciona, significa que estamos autenticados
      const response = await api.get('/auth/check', {
        withCredentials: true
      });
      
      // Verificar si la respuesta tiene el formato esperado
      if (response.data && typeof response.data === 'object') {
        // Usar type assertion para tratar response.data como AuthCheckResponse
        const authData = response.data as AuthCheckResponse;
        return { 
          authenticated: true, 
          user: authData.user || undefined 
        };
      }
      
      // Si no tiene el formato esperado, asumir que solo está autenticado
      return { 
        authenticated: true, 
        user: undefined 
      };
    } catch (error: any) {
      // Si hay error 401, significa que no está autenticado
      if (error.response?.status === 401) {
        return { authenticated: false };
      }
      // Para otros errores, también asumir que no está autenticado
      return { authenticated: false };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      // Usar el endpoint de check que ya existe y devuelve los datos del usuario
      const response = await api.get('/auth/check', {
        withCredentials: true
      });
      
      // Verificar si la respuesta tiene datos de usuario
      if (response.data && typeof response.data === 'object') {
        // Usar type assertion para tratar response.data como AuthCheckResponse
        const authData = response.data as AuthCheckResponse;
        
        if (authData.user) {
          // Normalizar el rol del usuario actual
          const user = authData.user;
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
      }
      
      return null;
    } catch (error: any) {
      console.error('Error al obtener usuario actual:', error);
      return null;
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

  static async getCurrentUserMembershipRegistrations(): Promise<MembershipRegistration[]> {
    try {
      console.log('🔍 Obteniendo membresías del usuario actual...');
      
      // Primero verificar autenticación y obtener el usuario
      const authCheck = await this.checkAuth();
      console.log('✅ Auth check result:', authCheck);
      
      if (!authCheck.authenticated) {
        throw new Error('Usuario no autenticado');
      }
      
      // Si tenemos datos de usuario desde auth/check, usar el ID
      if (authCheck.user?.id) {
        console.log('🔍 Buscando membresías para usuario ID:', authCheck.user.id);
        
        const response = await api.get<MembershipRegistration[]>(`/registro-membresias/usuario/${authCheck.user.id}`, {
          withCredentials: true
        });
        
        console.log('✅ Respuesta del backend:', response.data);
        return response.data || [];
      }
      
      // Si no tenemos ID de usuario, intentar obtenerlo de otra manera
      console.log('🔍 No se obtuvo ID de usuario desde auth/check, obteniendo usuario actual...');
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser?.id) {
        throw new Error('No se pudo obtener el ID del usuario actual');
      }
      
      console.log('🔍 Buscando membresías para usuario ID:', currentUser.id);
      
      // Usar el método existente con el ID del usuario
      const response = await api.get<MembershipRegistration[]>(`/registro-membresias/usuario/${currentUser.id}`, {
        withCredentials: true
      });
      
      console.log('✅ Respuesta del backend:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener registros de membresía del usuario actual:', error);
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

  // Método para procesar venta de producto (simular hasta que tengamos el endpoint)
  static async processProductSale(saleData: CreateProductSaleRequest): Promise<boolean> {
    try {
      // Por ahora, solo actualizamos el stock del producto
      const currentProducts = await this.getProducts();
      const product = currentProducts.find(p => p.id === saleData.producto_id);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      if (product.stock < saleData.cantidad) {
        throw new Error('Stock insuficiente');
      }

      // Actualizar el stock
      const newStock = product.stock - saleData.cantidad;
      await this.updateProduct(saleData.producto_id, { stock: newStock });
      
      return true;
    } catch (error: any) {
      console.error('Error al procesar venta de producto:', error);
      throw error;
    }
  }
}