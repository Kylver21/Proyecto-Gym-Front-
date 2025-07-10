import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type {
  User,
  Membership,
  MembershipRegistration,
  Payment,
  Product,
  ApiResponse,
  LoginResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// Configuración de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
type ApiError = {
  message: string;
  status: number;
  data?: any;
};

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = 
      axiosError.response?.data?.message || 
      axiosError.message || 
      'Error de conexión con el servidor';
    
    // Si el token expiró, limpiar y redirigir
    if (axiosError.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    throw new Error(errorMessage);
  }
  throw new Error('Error desconocido al realizar la petición');
};

export class GymApiService {
  // --- Auth ---
  static async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { username, password });
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static logout() {
    localStorage.removeItem('authToken');
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