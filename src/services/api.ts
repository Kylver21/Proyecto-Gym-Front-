import axios from 'axios';
import type {
  User,
  Membership,
  MembershipRegistration,
  Payment,
  Product,
  LoginRequest,
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
  },
  withCredentials: true // Importante para manejar sesiones
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Limpiar datos de autenticación y redirigir
      localStorage.removeItem('userData');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Función para manejar errores de API
const handleApiError = (error: any): never => {
  console.error('Error en la petición:', error);
  
  let errorMessage = 'Error de conexión con el servidor';
  
  if (error.response) {
    const { status, data } = error.response;
    errorMessage = data?.message || `Error del servidor: ${status}`;
  } else if (error.request) {
    errorMessage = 'No se pudo conectar con el servidor';
  }
  
  throw new Error(errorMessage);
};

export class GymApiService {
  // --- Autenticación ---
  static async login(username: string, password: string): Promise<LoginResult> {
    try {
      console.log('Intentando iniciar sesión con:', { username });
      
      const loginData: LoginRequest = { username, password };
      const response = await api.post<LoginResponse>('/auth/login', loginData);
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        // Verificar el estado de autenticación para obtener datos completos del usuario
        const authCheck = await this.checkAuth();
        
        if (authCheck.authenticated && authCheck.user) {
          localStorage.setItem('userData', JSON.stringify(authCheck.user));
          
          return { 
            success: true,
            message: response.data.message,
            user: authCheck.user
          };
        }
      }
      
      return { 
        success: false, 
        message: response.data.message || 'Error al iniciar sesión'
      };
    } catch (error) {
      console.error('Error en la petición de login:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al iniciar sesión'
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('userData');
    }
  }

  static async checkAuth(): Promise<AuthCheckResponse> {
    try {
      const response = await api.get<AuthCheckResponse>('/auth/check');
      return response.data;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return { authenticated: false };
    }
  }

  // --- Usuarios ---
  static async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/usuarios');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getUser(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await api.post<User>('/usuarios', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await api.put<User>(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Membresías ---
  static async getMemberships(): Promise<Membership[]> {
    try {
      const response = await api.get<Membership[]>('/membresias');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getMembership(id: number): Promise<Membership> {
    try {
      const response = await api.get<Membership>(`/membresias/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getUserMemberships(usuarioId: number): Promise<Membership[]> {
    try {
      const response = await api.get<Membership[]>(`/membresias/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createMembership(membershipData: CreateMembershipRequest): Promise<Membership> {
    try {
      const response = await api.post<Membership>('/membresias', membershipData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateMembership(id: number, membershipData: Partial<CreateMembershipRequest>): Promise<Membership> {
    try {
      const response = await api.put<Membership>(`/membresias/${id}`, membershipData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteMembership(id: number): Promise<void> {
    try {
      await api.delete(`/membresias/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Registro de Membresías ---
  static async createMembershipRegistration(registrationData: CreateMembershipRegistrationRequest): Promise<MembershipRegistration> {
    try {
      const response = await api.post<MembershipRegistration>('/registro-membresias', registrationData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getUserMembershipRegistrations(usuarioId: number): Promise<MembershipRegistration[]> {
    try {
      const response = await api.get<MembershipRegistration[]>(`/registro-membresias/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Pagos ---
  static async createPayment(paymentData: CreatePaymentRequest): Promise<Payment> {
    try {
      const response = await api.post<Payment>('/pagos', paymentData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getUserPayments(usuarioId: number): Promise<Payment[]> {
    try {
      const response = await api.get<Payment[]>(`/pagos/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Productos ---
  static async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/productos');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getProduct(id: number): Promise<Product> {
    try {
      const response = await api.get<Product>(`/productos/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const response = await api.post<Product>('/productos', productData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateProduct(id: number, productData: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await api.put<Product>(`/productos/${id}`, productData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/productos/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  }
}