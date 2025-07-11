export interface User {
  id: number;
  username: string;
  password?: string;
  nombre: string;
  email: string;
  role?: 'ADMIN' | 'USER';
}

export interface Membership {
  id: number;
  tipo: string;
  descripcion: string;
  precio: number;
}

export interface MembershipRegistration {
  id: number;
  usuario: User;
  membresia: Membership;
  fechaInicio: string;
  fechaFin: string;
}

export interface Payment {
  id: number;
  registroMembresia: MembershipRegistration;
  monto: number;
  fechaPago: string;
  metodoPago: string;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
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
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}