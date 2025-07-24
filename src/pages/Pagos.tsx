import React, { useState, useEffect } from 'react';
import { User, Payment, MembershipRegistration, CreatePaymentRequest } from '../types';
import { GymApiService } from '../services/api';
import { Plus, Search, DollarSign, User as UserIcon } from 'lucide-react';
import ErrorMessage from '../components/Common/ErrorMessage';
import { formatDateForBackend, formatDateForDisplay } from '../utils/dateUtils';

const Pagos: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<MembershipRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    registro_membresia_id: '',
    monto: '',
    metodo_pago: 'EFECTIVO' as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await GymApiService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: number) => {
    try {
      setLoading(true);
      const [userPayments, userRegs] = await Promise.all([
        GymApiService.getUserPayments(userId),
        GymApiService.getUserMembershipRegistrations(userId),
      ]);
      
      setPayments(userPayments);
      setUserRegistrations(userRegs);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId: number) => {
    setSelectedUserId(userId);
    await fetchUserData(userId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const paymentData: CreatePaymentRequest = {
        registroMembresiaId: parseInt(formData.registro_membresia_id),
        monto: parseFloat(formData.monto),
        fechaPago: formatDateForBackend(), // Formato YYYY-MM-DD
        metodoPago: formData.metodo_pago,
        estado: 'COMPLETADO'
      };
      
      const newPayment = await GymApiService.createPayment(paymentData);
      
      // Actualizar la lista de pagos si estamos viendo este usuario
      if (selectedUserId && newPayment) {
        setPayments([...payments, newPayment]);
      }
      
      resetForm();
      alert('Pago registrado exitosamente');
    } catch (err) {
      setError('Error al registrar el pago');
      console.error('Error creating payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      registro_membresia_id: '',
      monto: '',
      metodo_pago: 'EFECTIVO',
    });
    setShowForm(false);
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMetodoPagoBadge = (metodo: string) => {
    const styles = {
      EFECTIVO: 'bg-green-100 text-green-800',
      TARJETA: 'bg-blue-100 text-blue-800',
      TRANSFERENCIA: 'bg-purple-100 text-purple-800',
    };
    return styles[metodo as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoPagoBadge = (estado: string) => {
    const styles = {
      COMPLETADO: 'bg-green-100 text-green-800',
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      CANCELADO: 'bg-red-100 text-red-800',
    };
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  const selectedUser = users.find(user => user.id === selectedUserId);
  const totalPagado = payments.reduce((sum, payment) => 
    payment.estado === 'COMPLETADO' ? sum + payment.monto : sum, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Registrar Pago</span>
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Usuarios */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seleccionar Cliente</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredUsers.filter(user => user.rol === 'CLIENTE').map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUserId === user.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center">
                  <UserIcon className="h-10 w-10 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {user.nombre} {user.apellido}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="space-y-6">
          {selectedUser && (
            <>
              {/* Stats del Usuario */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedUser.nombre} {selectedUser.apellido}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Pagado:</span>
                    <span className="text-2xl font-bold text-green-600">
                      S/{totalPagado.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pagos Realizados:</span>
                    <span className="text-lg font-semibold">
                      {payments.filter(p => p.estado === 'COMPLETADO').length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Membresías Activas:</span>
                    <span className="text-lg font-semibold">
                      {userRegistrations.filter(r => r.estado === 'ACTIVA').length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFormData({ ...formData });
                    setShowForm(true);
                  }}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar Nuevo Pago
                </button>
              </div>

              {/* Membresías del Usuario */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Membresías</h3>
                </div>
                
                <div className="p-6">
                  {userRegistrations.length === 0 ? (
                    <div className="text-center text-gray-500">
                      Sin membresías registradas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userRegistrations.map((registration) => (
                        <div key={registration.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">
                                {registration.membresia?.tipo}
                              </div>
                              <div className="text-sm text-gray-600">
                                S/{registration.membresia?.precio.toFixed(2)}
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              registration.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' :
                              registration.estado === 'VENCIDA' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {registration.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Historial de Pagos */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedUser ? `Historial de Pagos` : 'Selecciona un cliente'}
            </h3>
          </div>

          {selectedUser ? (
            <div className="p-6">
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">Sin pagos registrados</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            S/{payment.monto.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(payment.fecha_pago)}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoPagoBadge(payment.estado)}`}>
                            {payment.estado}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMetodoPagoBadge(payment.metodo_pago)}`}>
                          {payment.metodo_pago}
                        </span>
                        
                        {payment.registroMembresia && (
                          <span className="text-gray-500">
                            Membresía #{payment.registroMembresia.id}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">Selecciona un cliente para ver sus pagos</div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar Pago
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membresía *
                </label>
                <select
                  required
                  value={formData.registro_membresia_id}
                  onChange={(e) => {
                    const selectedRegistrationId = e.target.value;
                    setFormData({ ...formData, registro_membresia_id: selectedRegistrationId });
                    
                    // Auto-llenar el monto con el precio de la membresía
                    if (selectedRegistrationId) {
                      const selectedReg = userRegistrations.find(r => r.id === parseInt(selectedRegistrationId));
                      if (selectedReg && selectedReg.membresia) {
                        setFormData(prev => ({ 
                          ...prev, 
                          registro_membresia_id: selectedRegistrationId,
                          monto: selectedReg.membresia!.precio.toString()
                        }));
                      }
                    } else {
                      setFormData(prev => ({ ...prev, monto: '' }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar membresía</option>
                  {userRegistrations.map((registration) => (
                    <option key={registration.id} value={registration.id}>
                      {registration.membresia?.tipo} - S/{registration.membresia?.precio.toFixed(2)} ({registration.estado})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (S/) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  required
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>

              {formData.registro_membresia_id && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm text-blue-800">
                    <strong>Información de la membresía:</strong>
                    {(() => {
                      const selectedRegistration = userRegistrations.find(r => r.id === parseInt(formData.registro_membresia_id));
                      if (selectedRegistration) {
                        return (
                          <div className="mt-1">
                            <div>Tipo: {selectedRegistration.membresia?.tipo}</div>
                            <div>Precio: S/{selectedRegistration.membresia?.precio.toFixed(2)}</div>
                            <div>Estado: {selectedRegistration.estado}</div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagos;
