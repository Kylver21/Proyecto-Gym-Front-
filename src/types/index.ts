// Estructura de usuario actualizada según la base de datos
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
  tipo: 'DIARIO' | 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'ESTUDIANTE' | 'PREMIUM';
  descripcion: string;
  precio: number;
  duracion_dias: number;
  estado: number; // 1 = activo, 0 = inactivo (según tu BD)
  fecha_creacion?: string;
}

export interface MembershipRegistration {
  id: number;
  usuario_id: number;
  membresia_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'ACTIVA' | 'VENCIDA' | 'CANCELADA';
  fecha_creacion?: string;
  // Datos relacionados para mostrar
  usuario?: User;
  membresia?: Membership;
}

export interface Payment {
  id: number;
  registro_membresia_id: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  estado: 'COMPLETADO' | 'PENDIENTE' | 'CANCELADO';
  comprobante_url?: string;
  fecha_creacion?: string;
  // Datos relacionados para mostrar
  registroMembresia?: MembershipRegistration;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  estado?: boolean;
  fecha_creacion?: string;
}

// Formulario de login simplificado
export interface LoginRequest {
  username: string;
  password: string;
}

// Formulario de registro según la base de datos
export interface RegisterRequest {
  username: string;
  password: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
}

// Respuesta del backend para login/registro
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
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

// Tipos para formularios (usando RegisterRequest para createUser)
export interface CreateUserRequest {
  username: string;
  password: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  nombre?: string;
  email?: string;
  rol?: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
  estado?: boolean;
}

export interface CreateMembershipRequest {
  tipo: 'DIARIO' | 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'ESTUDIANTE' | 'PREMIUM';
  descripcion: string;
  precio: number;
  duracion_dias: number;
}

export interface CreateMembershipRegistrationRequest {
  usuario_id: number;
  membresia_id: number;
  fecha_inicio: string;
}

export interface CreatePaymentRequest {
  registroMembresiaId: number;
  monto: number;
  fechaPago: string;
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  estado: 'COMPLETADO' | 'PENDIENTE' | 'CANCELADO';
}

export interface CreateProductRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string;
}

export interface ProductSale {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  fecha_venta: string;
  // Datos relacionados
  usuario?: User;
  producto?: Product;
}

export interface CreateProductSaleRequest {
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
}