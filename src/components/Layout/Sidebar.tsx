import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  CreditCard,
  Calendar,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Settings,
  UserPlus,
  Receipt,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { isAdmin, isEmployee, isClient } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Usuarios', path: '/users' },
    { icon: Calendar, label: 'Membresías', path: '/memberships' },
    { icon: UserPlus, label: 'Registros', path: '/registros' },
    { icon: DollarSign, label: 'Pagos', path: '/pagos' },
    { icon: ShoppingCart, label: 'Productos', path: '/products' },
    { icon: BarChart3, label: 'Reportes', path: '/reportes' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  const employeeMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/users' },
    { icon: Calendar, label: 'Membresías', path: '/memberships' },
    { icon: UserPlus, label: 'Registros', path: '/registros' },
    { icon: DollarSign, label: 'Pagos', path: '/pagos' },
    { icon: ShoppingCart, label: 'Productos', path: '/products' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  const clientMenuItems = [
    { icon: Home, label: 'Mi Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Mi Membresía', path: '/memberships' },
    { icon: Receipt, label: 'Mis Pagos', path: '/pagos' },
    { icon: ShoppingCart, label: 'Tienda', path: '/products' },
    { icon: Settings, label: 'Mi Perfil', path: '/configuracion' },
  ];

  let menuItems = clientMenuItems;
  let panelTitle = 'Panel de Cliente';

  if (isAdmin) {
    menuItems = adminMenuItems;
    panelTitle = 'Panel de Administración';
  } else if (isEmployee) {
    menuItems = employeeMenuItems;
    panelTitle = 'Panel de Empleado';
  } else if (isClient) {
    menuItems = clientMenuItems;
    panelTitle = 'Panel de Cliente';
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white shadow-lg h-full border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {panelTitle}
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
