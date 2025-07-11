import axios from 'axios';
import type {
  User,
  Membership,
  MembershipRegistration,
  Payment,
  Product,
  ApiResponse,
  LoginResponse,
  LoginResult
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
      // Redirigir a login si no está autenticado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función simple para manejar errores
const handleApiError = (error: any): never => {
  console.error('Error en la petición:', error);
  
  let errorMessage = 'Error de conexión con el servidor';
  
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    const { status, data } = error.response;
    errorMessage = data?.message || `Error del servidor: ${status}`;
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    errorMessage = 'No se pudo conectar con el servidor';
  }
  
  throw new Error(errorMessage);
};

export class GymApiService {
  // --- Auth ---
  static async login(username: string, password: string): Promise<LoginResult> {
    try {
      console.log('Intentando iniciar sesión con:', { username });
      
      // Crear FormData para enviar los datos como formulario URL-encoded
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post<LoginResponse>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // Verificar si la respuesta es un HTML (lo que indicaría un error)
      const responseData = response.data as any;
      if (typeof responseData === 'string' && responseData.includes('<!DOCTYPE html>')) {
        throw new Error('El servidor devolvió un formulario HTML en lugar de datos JSON');
      }
      
      // Guardar datos del usuario en localStorage
      if (response.data && response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        return { 
          success: true,
          message: 'Inicio de sesión exitoso',
          user: response.data.user
        };
      } else {
        throw new Error('La respuesta del servidor no contiene datos de usuario');
      }
    } catch (error) {
      console.error('Error en la petición de login:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al iniciar sesión'
      };
    }
  }

  static logout(): void {
    localStorage.removeItem('userData');
  }

  // --- Users ---
  static async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<ApiResponse<User[]>>('/usuarios');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getUser(id: number): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/usuarios/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createUser(user: Partial<User>): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>('/usuarios', user);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/usuarios/${id}`, user);
    return response.data.data;
  }

  static async deleteUser(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }

  // --- Memberships ---
  static async getMemberships(): Promise<Membership[]> {
    const response = await api.get<ApiResponse<Membership[]>>('/membresias');
    return response.data.data;
  }

  static async getMembership(id: number): Promise<Membership> {
    const response = await api.get<ApiResponse<Membership>>(`/membresias/${id}`);
    return response.data.data;
  }

  static async createMembership(membership: Partial<Membership>): Promise<Membership> {
    const response = await api.post<ApiResponse<Membership>>('/membresias', membership);
    return response.data.data;
  }

  static async updateMembership(id: number, membership: Partial<Membership>): Promise<Membership> {
    const response = await api.put<ApiResponse<Membership>>(`/membresias/${id}`, membership);
    return response.data.data;
  }

  static async deleteMembership(id: number): Promise<void> {
    await api.delete(`/membresias/${id}`);
  }

  // --- Membership Registrations ---
  static async getMembershipRegistrations(): Promise<MembershipRegistration[]> {
    const response = await api.get<ApiResponse<MembershipRegistration[]>>('/registro-membresias');
    return response.data.data;
  }

  static async getMembershipRegistration(id: number): Promise<MembershipRegistration> {
    const response = await api.get<ApiResponse<MembershipRegistration>>(`/registro-membresias/${id}`);
    return response.data.data;
  }

  static async createMembershipRegistration(reg: Partial<MembershipRegistration>): Promise<MembershipRegistration> {
    const response = await api.post<ApiResponse<MembershipRegistration>>('/registro-membresias', reg);
    return response.data.data;
  }

  static async updateMembershipRegistration(id: number, reg: Partial<MembershipRegistration>): Promise<MembershipRegistration> {
    const response = await api.put<ApiResponse<MembershipRegistration>>(`/registro-membresias/${id}`, reg);
    return response.data.data;
  }

  static async deleteMembershipRegistration(id: number): Promise<void> {
    await api.delete(`/registro-membresias/${id}`);
  }

  // --- Payments ---
  static async getPayments(): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>('/pagos');
    return response.data.data;
  }

  static async getPayment(id: number): Promise<Payment> {
    const response = await api.get<ApiResponse<Payment>>(`/pagos/${id}`);
    return response.data.data;
  }

  static async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>('/pagos', payment);
    return response.data.data;
  }

  static async updatePayment(id: number, payment: Partial<Payment>): Promise<Payment> {
    const response = await api.put<ApiResponse<Payment>>(`/pagos/${id}`, payment);
    return response.data.data;
  }

  static async deletePayment(id: number): Promise<void> {
    await api.delete(`/pagos/${id}`);
  }

  // --- Products ---
  static async getProducts(): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>('/productos');
    return response.data.data;
  }

  static async getProduct(id: number): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`/productos/${id}`);
    return response.data.data;
  }

  static async createProduct(product: Partial<Product>): Promise<Product> {
    const response = await api.post<ApiResponse<Product>>('/productos', product);
    return response.data.data;
  }

  static async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const response = await api.put<ApiResponse<Product>>(`/productos/${id}`, product);
    return response.data.data;
  }

  static async deleteProduct(id: number): Promise<void> {
    await api.delete(`/productos/${id}`);
  }
}