import React, { useState, useEffect } from 'react';
import { User, Membership, Product, Payment, MembershipRegistration } from '../types';
import { GymApiService } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Package,
  AlertCircle,
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';

interface ReportStats {
  totalUsers: number;
  totalMemberships: number;
  totalProducts: number;
  totalRevenue: number;
  activeMembers: number;
  expiredMembers: number;
  lowStockProducts: number;
  monthlyRevenue: number;
}

const Reportes: React.FC = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    totalMemberships: 0,
    totalProducts: 0,
    totalRevenue: 0,
    activeMembers: 0,
    expiredMembers: 0,
    lowStockProducts: 0,
    monthlyRevenue: 0,
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, membershipsData, productsData] = await Promise.all([
        GymApiService.getUsers(),
        GymApiService.getMemberships(),
        GymApiService.getProducts(),
      ]);

      setUsers(usersData);
      setMemberships(membershipsData);
      setProducts(productsData);

      // Calcular estadísticas
      await calculateStats(usersData, membershipsData, productsData);
    } catch (err) {
      setError('Error al cargar los datos del reporte');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (usersData: User[], membershipsData: Membership[], productsData: Product[]) => {
    try {
      // Obtener registros de membresías y pagos para todos los usuarios
      const allRegistrations: MembershipRegistration[] = [];
      const allPayments: Payment[] = [];

      for (const user of usersData) {
        try {
          const [userRegs, userPayments] = await Promise.all([
            GymApiService.getUserMembershipRegistrations(user.id),
            GymApiService.getUserPayments(user.id),
          ]);
          allRegistrations.push(...userRegs);
          allPayments.push(...userPayments);
        } catch (err) {
          console.warn(`Error fetching data for user ${user.id}:`, err);
        }
      }

      // Calcular estadísticas
      const totalRevenue = allPayments
        .filter(p => p.estado === 'COMPLETADO')
        .reduce((sum, p) => sum + p.monto, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = allPayments
        .filter(p => {
          const paymentDate = new Date(p.fecha_pago);
          return p.estado === 'COMPLETADO' && 
                 paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.monto, 0);

      const activeMembers = allRegistrations.filter(r => r.estado === 'ACTIVA').length;
      const expiredMembers = allRegistrations.filter(r => r.estado === 'VENCIDA').length;
      const lowStockProducts = productsData.filter(p => p.stock <= 10 && p.stock > 0).length;

      setStats({
        totalUsers: usersData.length,
        totalMemberships: membershipsData.length,
        totalProducts: productsData.length,
        totalRevenue,
        activeMembers,
        expiredMembers,
        lowStockProducts,
        monthlyRevenue,
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  const generateReport = () => {
    const reportData = {
      fecha: new Date().toISOString(),
      periodo: selectedPeriod,
      estadisticas: stats,
      usuarios: users.map(u => ({
        id: u.id,
        nombre: `${u.nombre} ${u.apellido}`,
        email: u.email,
        rol: u.rol,
        estado: u.estado
      })),
      membresias: memberships.map(m => ({
        id: m.id,
        tipo: m.tipo,
        descripcion: m.descripcion,
        precio: m.precio,
        estado: m.estado
      })),
      productos: products.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        stock: p.stock
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-gym-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getUsersByRole = () => {
    const roleCount = users.reduce((acc, user) => {
      acc[user.rol] = (acc[user.rol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Clientes', value: roleCount.CLIENTE || 0, color: 'bg-green-500' },
      { name: 'Empleados', value: roleCount.EMPLEADO || 0, color: 'bg-blue-500' },
      { name: 'Administradores', value: roleCount.ADMIN || 0, color: 'bg-red-500' },
    ];
  };

  const getMembershipsByType = () => {
    const typeCount = memberships.reduce((acc, membership) => {
      acc[membership.tipo] = (acc[membership.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Mensual', value: typeCount.MENSUAL || 0, color: 'bg-blue-400' },
      { name: 'Trimestral', value: typeCount.TRIMESTRAL || 0, color: 'bg-green-400' },
      { name: 'Semestral', value: typeCount.SEMESTRAL || 0, color: 'bg-yellow-400' },
      { name: 'Anual', value: typeCount.ANUAL || 0, color: 'bg-purple-400' },
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const usersByRole = getUsersByRole();
  const membershipsByType = getMembershipsByType();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
            <option value="año">Este Año</option>
          </select>
          <button
            onClick={generateReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={fetchReportData} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Miembros Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.monthlyRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Usuarios por Rol
          </h3>
          <div className="space-y-4">
            {usersByRole.map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-gray-900">{item.value}</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{
                        width: `${stats.totalUsers > 0 ? (item.value / stats.totalUsers) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memberships by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Membresías por Tipo
          </h3>
          <div className="space-y-4">
            {membershipsByType.map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-gray-900">{item.value}</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{
                        width: `${stats.totalMemberships > 0 ? (item.value / stats.totalMemberships) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Membresías</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Activas</span>
              <span className="text-green-600 font-semibold">{stats.activeMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vencidas</span>
              <span className="text-red-600 font-semibold">{stats.expiredMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Registros</span>
              <span className="text-gray-900 font-semibold">{stats.activeMembers + stats.expiredMembers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Productos</span>
              <span className="text-gray-900 font-semibold">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock Bajo</span>
              <span className="text-yellow-600 font-semibold">{stats.lowStockProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sin Stock</span>
              <span className="text-red-600 font-semibold">
                {products.filter(p => p.stock <= 0).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valor Total</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inventario</span>
              <span className="text-gray-900 font-semibold">
                ${products.reduce((sum, p) => sum + (p.precio * p.stock), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Membresías</span>
              <span className="text-gray-900 font-semibold">
                ${memberships.reduce((sum, m) => sum + m.precio, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingresos</span>
              <span className="text-green-600 font-semibold">
                ${stats.totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.lowStockProducts > 0 || stats.expiredMembers > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Alertas del Sistema</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {stats.lowStockProducts > 0 && (
                    <li>Tienes {stats.lowStockProducts} producto(s) con stock bajo</li>
                  )}
                  {stats.expiredMembers > 0 && (
                    <li>Hay {stats.expiredMembers} membresía(s) vencida(s)</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
