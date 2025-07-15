import React, { useState, useEffect } from 'react';
import { User, Membership, MembershipRegistration } from '../types';
import { GymApiService } from '../services/api';
import { Plus, Search, Calendar, User as UserIcon, Clock } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';

const Registros: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [registrations, setRegistrations] = useState<MembershipRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    usuario_id: '',
    membresia_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, membershipsData] = await Promise.all([
        GymApiService.getUsers(),
        GymApiService.getMemberships(),
      ]);
      
      setUsers(usersData);
      setMemberships(membershipsData);
      
      // Si hay un usuario seleccionado, obtener sus registros
      if (selectedUserId) {
        await fetchUserRegistrations(selectedUserId);
      }
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async (usuarioId: number) => {
    try {
      const userRegistrations = await GymApiService.getUserMembershipRegistrations(usuarioId);
      setRegistrations(userRegistrations);
    } catch (err) {
      console.error('Error fetching user registrations:', err);
      setError('Error al cargar los registros del usuario');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const registrationData = {
        usuario_id: parseInt(formData.usuario_id),
        membresia_id: parseInt(formData.membresia_id),
        fecha_inicio: formData.fecha_inicio,
      };
      
      const newRegistration = await GymApiService.createMembershipRegistration(registrationData);
      
      // Si estamos viendo los registros de este usuario, actualizar la lista
      if (selectedUserId === registrationData.usuario_id && newRegistration) {
        setRegistrations([...registrations, newRegistration]);
      }
      
      resetForm();
      alert('Membresía asignada exitosamente');
    } catch (err) {
      setError('Error al asignar la membresía');
      console.error('Error creating registration:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      usuario_id: '',
      membresia_id: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const handleUserSelect = async (userId: number) => {
    setSelectedUserId(userId);
    await fetchUserRegistrations(userId);
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    const styles = {
      ACTIVA: 'bg-green-100 text-green-800',
      VENCIDA: 'bg-red-100 text-red-800',
      CANCELADA: 'bg-gray-100 text-gray-800',
    };
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const calculateDaysRemaining = (fecha_fin: string) => {
    const today = new Date();
    const endDate = new Date(fecha_fin);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const selectedUser = users.find(user => user.id === selectedUserId);

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Membresías</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Asignar Membresía</span>
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Usuarios */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seleccionar Usuario</h2>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
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
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.rol === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.rol === 'EMPLEADO' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.rol}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registros del Usuario Seleccionado */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedUser ? `Membresías de ${selectedUser.nombre} ${selectedUser.apellido}` : 'Selecciona un usuario'}
            </h2>
          </div>

          {selectedUser ? (
            <div className="p-6">
              {registrations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-gray-500 text-lg mt-4">Sin membresías registradas</div>
                  <button
                    onClick={() => {
                      setFormData({ ...formData, usuario_id: selectedUser.id.toString() });
                      setShowForm(true);
                    }}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Asignar primera membresía
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((registration) => {
                    const daysRemaining = calculateDaysRemaining(registration.fecha_fin);
                    return (
                      <div key={registration.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {registration.membresia?.tipo} - {registration.membresia?.descripcion}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              ${registration.membresia?.precio.toFixed(2)}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(registration.estado)}`}>
                            {registration.estado}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Inicio:</span>
                            <div className="font-medium">{formatDate(registration.fecha_inicio)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Fin:</span>
                            <div className="font-medium">{formatDate(registration.fecha_fin)}</div>
                          </div>
                        </div>

                        {registration.estado === 'ACTIVA' && (
                          <div className="mt-2 flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className={daysRemaining > 7 ? 'text-green-600' : daysRemaining > 0 ? 'text-yellow-600' : 'text-red-600'}>
                              {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencida'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">Selecciona un usuario para ver sus membresías</div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Asignar Membresía
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <select
                  required
                  value={formData.usuario_id}
                  onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} {user.apellido} (@{user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membresía *
                </label>
                <select
                  required
                  value={formData.membresia_id}
                  onChange={(e) => setFormData({ ...formData, membresia_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar membresía</option>
                  {memberships.filter(m => m.estado).map((membership) => (
                    <option key={membership.id} value={membership.id}>
                      {membership.tipo} - ${membership.precio.toFixed(2)} ({membership.duracion_dias} días)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {formData.membresia_id && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm text-blue-800">
                    <strong>Información de la membresía:</strong>
                    {(() => {
                      const selectedMembership = memberships.find(m => m.id === parseInt(formData.membresia_id));
                      if (selectedMembership) {
                        const startDate = new Date(formData.fecha_inicio);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + selectedMembership.duracion_dias);
                        
                        return (
                          <div className="mt-1">
                            <div>Duración: {selectedMembership.duracion_dias} días</div>
                            <div>Precio: ${selectedMembership.precio.toFixed(2)}</div>
                            <div>Fecha fin: {endDate.toLocaleDateString('es-ES')}</div>
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
                  {loading ? 'Asignando...' : 'Asignar Membresía'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registros;
