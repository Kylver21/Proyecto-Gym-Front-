import React, { useState, useEffect } from 'react';
import { Membership, MembershipRegistration } from '../types';
import { GymApiService } from '../services/api';
import { Plus, Edit, Trash2, Search, Calendar, DollarSign, Clock, User } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

const Memberships: React.FC = () => {
  const { user, isClient, isAdmin, isEmployee } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clientRegistrations, setClientRegistrations] = useState<MembershipRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    membershipId: number | null;
    membershipName: string;
  }>({
    isOpen: false,
    membershipId: null,
    membershipName: '',
  });

  const [formData, setFormData] = useState({
    tipo: 'MENSUAL' as 'DIARIO' | 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'ESTUDIANTE' | 'PREMIUM',
    descripcion: '',
    precio: '',
    duracion_dias: '',
  });

  useEffect(() => {
    if (isClient && user) {
      // Si es cliente, cargar sus membresías registradas
      fetchClientMemberships();
    } else if (isAdmin || isEmployee) {
      // Si es admin o empleado, cargar todas las membresías para gestión
      fetchMemberships();
    }
  }, [isClient, isAdmin, isEmployee, user]);

  const fetchClientMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Iniciando carga de membresías del cliente...');
      
      const registrations = await GymApiService.getCurrentUserMembershipRegistrations();
      console.log('✅ Membresías obtenidas:', registrations);
      
      setClientRegistrations(registrations);
    } catch (err) {
      console.error('❌ Error fetching client memberships:', err);
      setError('Error al cargar tus membresías');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const memberships = await GymApiService.getMemberships();
      setMemberships(memberships);
    } catch (err) {
      setError('Error al cargar las membresías');
      console.error('Error fetching memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const membershipData = {
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        duracion_dias: parseInt(formData.duracion_dias),
      };

      if (editingMembership) {
        // Update membership
        const updatedMembership = await GymApiService.updateMembership(editingMembership.id, membershipData);
        if (updatedMembership) {
          setMemberships(memberships.map(membership => 
            membership.id === editingMembership.id ? updatedMembership : membership
          ));
        } else {
          console.warn('No se actualizó la membresía: respuesta null');
        }
      } else {
        // Create new membership
        const newMembership = await GymApiService.createMembership(membershipData);
        if (newMembership) {
          setMemberships([...memberships, newMembership]);
        } else {
          console.warn('No se creó la membresía: respuesta null');
        }
      }
      
      resetForm();
    } catch (err) {
      setError('Error al guardar la membresía');
      console.error('Error saving membership:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (membership: Membership) => {
    setEditingMembership(membership);
    setFormData({
      tipo: membership.tipo,
      descripcion: membership.descripcion,
      precio: membership.precio.toString(),
      duracion_dias: membership.duracion_dias.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (membership: Membership) => {
    setConfirmDialog({
      isOpen: true,
      membershipId: membership.id,
      membershipName: membership.tipo,
    });
  };

  const confirmDelete = async () => {
    if (confirmDialog.membershipId) {
      try {
        setLoading(true);
        await GymApiService.deleteMembership(confirmDialog.membershipId);
        setMemberships(memberships.filter(membership => membership.id !== confirmDialog.membershipId));
        setConfirmDialog({ isOpen: false, membershipId: null, membershipName: '' });
      } catch (err) {
        setError('Error al eliminar la membresía');
        console.error('Error deleting membership:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'MENSUAL',
      descripcion: '',
      precio: '',
      duracion_dias: '',
    });
    setEditingMembership(null);
    setShowForm(false);
  };

  // Funciones helper para clientes
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

  const getTypeColor = (tipo: string) => {
    const colors = {
      DIARIO: 'bg-orange-100 text-orange-800',
      MENSUAL: 'bg-blue-100 text-blue-800',
      TRIMESTRAL: 'bg-green-100 text-green-800',
      SEMESTRAL: 'bg-yellow-100 text-yellow-800',
      ANUAL: 'bg-purple-100 text-purple-800',
      ESTUDIANTE: 'bg-cyan-100 text-cyan-800',
      PREMIUM: 'bg-gold-100 text-gold-800 bg-gradient-to-r from-yellow-200 to-yellow-300',
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading && (memberships.length === 0 && clientRegistrations.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Vista para clientes - Mostrar sus membresías
  if (isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Mi Membresía</h1>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600">{user?.nombre} {user?.apellido}</span>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} onRetry={fetchClientMemberships} />
        )}

        {clientRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-900 mt-4">No tienes membresías activas</h3>
            <p className="text-gray-500 mt-2">
              Contacta con el gimnasio para activar una membresía
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {clientRegistrations.map((registration) => {
              const daysRemaining = calculateDaysRemaining(registration.fecha_fin);
              return (
                <div key={registration.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {registration.membresia?.tipo}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {registration.membresia?.descripcion}
                        </p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEstadoBadge(registration.estado)}`}>
                        {registration.estado}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-blue-600 text-sm font-medium">Precio</div>
                        <div className="text-2xl font-bold text-blue-900">
                          ${registration.membresia?.precio.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-green-600 text-sm font-medium">Fecha de Inicio</div>
                        <div className="text-lg font-semibold text-green-900">
                          {formatDate(registration.fecha_inicio)}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-purple-600 text-sm font-medium">Fecha de Fin</div>
                        <div className="text-lg font-semibold text-purple-900">
                          {formatDate(registration.fecha_fin)}
                        </div>
                      </div>
                    </div>

                    {registration.estado === 'ACTIVA' && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className={`font-medium ${daysRemaining > 7 ? 'text-green-600' : daysRemaining > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Membresía vencida'}
                          </span>
                        </div>
                        {daysRemaining <= 7 && daysRemaining > 0 && (
                          <p className="text-sm text-yellow-700 mt-1">
                            ⚠️ Tu membresía está próxima a vencer. Contacta con el gimnasio para renovarla.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Vista para administradores y empleados
  const filteredMemberships = memberships.filter(membership =>
    membership.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membership.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Membresías</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Membresía</span>
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar membresías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Memberships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemberships.map((membership) => (
          <div key={membership.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(membership.tipo)}`}>
                  {membership.tipo}
                </span>
                {membership.estado === 0 && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Inactiva
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(membership)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                  title="Editar membresía"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(membership)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  title="Eliminar membresía"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">{membership.descripcion}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    ${membership.precio.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{membership.duracion_dias} días de duración</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Membership Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingMembership ? 'Editar Membresía' : 'Agregar Membresía'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DIARIO">Diario</option>
                  <option value="MENSUAL">Mensual</option>
                  <option value="TRIMESTRAL">Trimestral</option>
                  <option value="SEMESTRAL">Semestral</option>
                  <option value="ANUAL">Anual</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe los beneficios de esta membresía"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (días) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duracion_dias}
                  onChange={(e) => setFormData({ ...formData, duracion_dias: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                />
              </div>

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
                  {loading ? 'Guardando...' : (editingMembership ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, membershipId: null, membershipName: '' })}
        onConfirm={confirmDelete}
        title="Eliminar Membresía"
        message={`¿Estás seguro de que deseas eliminar la membresía "${confirmDialog.membershipName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Memberships;