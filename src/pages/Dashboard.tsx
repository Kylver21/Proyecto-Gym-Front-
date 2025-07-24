import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, CreditCard, DollarSign, ShoppingCart, TrendingUp, Calendar, Package } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { GymApiService } from '../services/api';
import { MembershipRegistration } from '../types';

interface DashboardStats {
  totalUsers: number;
  activeMemberships: number;
  totalRevenue: number;
  totalProducts: number;
  recentPayments: number;
  pendingPayments: number;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeMemberships: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentPayments: 0,
    pendingPayments: 0,
  });
  const [userMemberships, setUserMemberships] = useState<MembershipRegistration[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for dashboard stats
    const fetchStats = async () => {
      try {
        // Mock data - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalUsers: 145,
          activeMemberships: 89,
          totalRevenue: 15420,
          totalProducts: 23,
          recentPayments: 12,
          pendingPayments: 3,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Cargar membresías del usuario si no es admin
    const fetchUserMemberships = async () => {
      if (!isAdmin && user) {
        try {
          setMembershipLoading(true);
          const memberships = await GymApiService.getCurrentUserMembershipRegistrations();
          setUserMemberships(memberships);
        } catch (error) {
          console.error('Error fetching user memberships:', error);
        } finally {
          setMembershipLoading(false);
        }
      }
    };

    fetchStats();
    fetchUserMemberships();
  }, [isAdmin, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const adminStats = [
    {
      name: 'Total Usuarios',
      value: stats.totalUsers,
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Membresías Activas',
      value: stats.activeMemberships,
      change: '+8%',
      changeType: 'increase',
      icon: CreditCard,
      color: 'bg-green-500',
    },
    {
      name: 'Ingresos Totales',
      value: `S/ ${stats.totalRevenue.toLocaleString()}`,
      change: '+15%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      name: 'Productos',
      value: stats.totalProducts,
      change: '+3%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
  ];

  const userStats = [
    {
      name: 'Mi Membresía',
      value: 'Premium Anual',
      change: 'Activa',
      changeType: 'active',
      icon: CreditCard,
      color: 'bg-green-500',
    },
    {
      name: 'Días Restantes',
      value: '245',
      change: 'días',
      changeType: 'info',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Último Pago',
      value: 'S/ 75',
      change: 'Enero 2025',
      changeType: 'info',
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      name: 'Productos Comprados',
      value: '3',
      change: 'Este mes',
      changeType: 'info',
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
  ];

  const statsToShow = isAdmin ? adminStats : userStats;

  return (
    <div className="space-y-6">
      {/* Sección de bienvenida y descripción para usuarios */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">ProyectoGYM - Plataforma Digital del Gimnasio</h1>
            <p className="text-lg mb-6 leading-relaxed">
              La plataforma oficial de tu gimnasio donde puedes comprar membresías, realizar pagos 
              online y acceder a la tienda de productos deportivos desde la comodidad de tu hogar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Compra Membresías</h3>
                <p className="text-sm opacity-90">Adquiere tu acceso al gimnasio online</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <DollarSign className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Pagos Online</h3>
                <p className="text-sm opacity-90">Realiza pagos seguros desde casa</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Tienda del Gimnasio</h3>
                <p className="text-sm opacity-90">Productos deportivos y suplementos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'Panel de Administración' : 'Inicio'}
        </h1>
        <div className="text-sm text-gray-500">
          Bienvenido, {user?.nombre}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsToShow.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : stat.changeType === 'active'
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}
              >
                {stat.changeType === 'increase' && <TrendingUp className="h-4 w-4 inline mr-1" />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pagos Recientes
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((payment) => (
                <div key={payment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Usuario {payment}</p>
                    <p className="text-sm text-gray-500">Membresía Premium</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">$75.00</p>
                    <p className="text-sm text-gray-500">Hace {payment} día(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Membresías por Vencer
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((membership) => (
                <div key={membership} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Cliente {membership}</p>
                    <p className="text-sm text-gray-500">Membresía Básica</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-600">{5 - membership} días</p>
                    <p className="text-sm text-gray-500">Vence pronto</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Pago procesado</p>
                <p className="text-sm text-gray-500">Membresía Premium renovada - S/ 75.00</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">Hace 2 días</div>
            </div>

            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Compra realizada</p>
                <p className="text-sm text-gray-500">Proteína Whey - S/ 45.00</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">Hace 1 semana</div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Membresías Compradas (solo para usuarios) */}
      {!isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="h-6 w-6 text-blue-500 mr-2" />
              Mis Membresías
            </h2>
            {membershipLoading && <LoadingSpinner size="sm" />}
          </div>

          {userMemberships.length > 0 ? (
            <div className="grid gap-4">
              {userMemberships.map((registration) => (
                <div key={registration.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Membresía {registration.membresia?.tipo || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Duración: {registration.membresia?.duracion_dias ? Math.ceil(registration.membresia.duracion_dias / 30) : 'N/A'} meses
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">
                            Inicio: {new Date(registration.fecha_inicio).toLocaleDateString('es-ES')}
                          </span>
                          {registration.fecha_fin && (
                            <span className="text-xs text-gray-500 ml-4">
                              Fin: {new Date(registration.fecha_fin).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        S/ {registration.membresia?.precio || '0'}
                      </span>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          registration.estado === 'ACTIVA' 
                            ? 'bg-green-100 text-green-800' 
                            : registration.estado === 'VENCIDA'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {registration.estado || 'ACTIVA'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {registration.membresia?.descripcion && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        {registration.membresia.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes membresías activas
              </h3>
              <p className="text-gray-600 mb-4">
                Explora nuestras membresías disponibles y encuentra la que mejor se adapte a tus necesidades.
              </p>
              <button
                onClick={() => window.location.href = '/products'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Ver Membresías Disponibles
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;