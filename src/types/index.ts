// Tipos basados en la estructura del backend
export interface User {
  id: number;
  username: string;
  password?: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
  estado: boolean;
}

export interface Membership {
  id: number;
  tipo: 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  descripcion: string;
  precio: number;
  duracionDias: number;
  estado: boolean;
}

export interface MembershipRegistration {
  id: number;
  usuarioId: number;
  membresiaId: number;
  fechaInicio: string;
  fechaFin: string;
  estado: 'ACTIVA' | 'VENCIDA' | 'CANCELADA';
  // Datos relacionados para mostrar
  usuario?: User;
  membresia?: Membership;
}

export interface Payment {
  id: number;
  registroMembresiaId: number;
  monto: number;
  fechaPago: string;
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  estado: 'COMPLETADO' | 'PENDIENTE' | 'CANCELADO';
  // Datos relacionados para mostrar
  registroMembresia?: MembershipRegistration;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  username?: string;
  rol?: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user?: User;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isClient: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Tipos para formularios
export interface CreateUserRequest {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
  estado?: boolean;
}

export interface CreateMembershipRequest {
  tipo: 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  descripcion: string;
  precio: number;
  duracionDias: number;
}

export interface CreateMembershipRegistrationRequest {
  usuarioId: number;
  membresiaId: number;
  fechaInicio: string;
}

export interface CreatePaymentRequest {
  registroMembresiaId: number;
  monto: number;
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
}

export interface CreateProductRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}