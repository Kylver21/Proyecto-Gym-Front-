import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, CreditCard, DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

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

    fetchStats();
  }, []);

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
      value: `$${stats.totalRevenue.toLocaleString()}`,
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
      value: '$75',
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'Panel de Administración' : 'Mi Dashboard'}
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
                <p className="text-sm text-gray-500">Membresía Premium renovada - $75.00</p>
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
                <p className="text-sm text-gray-500">Proteína Whey - $45.00</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">Hace 1 semana</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;