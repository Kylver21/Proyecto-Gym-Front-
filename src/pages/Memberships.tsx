import React, { useState, useEffect } from 'react';
import { Membership } from '../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import ConfirmDialog from '../components/Common/ConfirmDialog';

const Memberships: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
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
    tipo: '',
    descripcion: '',
    precio: '',
  });

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockMemberships: Membership[] = [
        {
          id: 1,
          tipo: 'Básica',
          descripcion: 'Acceso al gimnasio en horarios regulares',
          precio: 35.00
        },
        {
          id: 2,
          tipo: 'Premium',
          descripcion: 'Acceso completo + clases grupales',
          precio: 55.00
        },
        {
          id: 3,
          tipo: 'VIP',
          descripcion: 'Acceso completo + entrenador personal',
          precio: 85.00
        },
        {
          id: 4,
          tipo: 'Anual',
          descripcion: 'Membresía anual con descuento',
          precio: 600.00
        }
      ];
      setMemberships(mockMemberships);
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
      const membershipData = {
        ...formData,
        precio: parseFloat(formData.precio),
      };

      if (editingMembership) {
        // Update membership
        const updatedMembership = { ...editingMembership, ...membershipData };
        setMemberships(memberships.map(membership => 
          membership.id === editingMembership.id ? updatedMembership : membership
        ));
      } else {
        // Create new membership
        const newMembership: Membership = {
          id: Math.max(...memberships.map(m => m.id)) + 1,
          ...membershipData,
        };
        setMemberships([...memberships, newMembership]);
      }
      
      resetForm();
    } catch (err) {
      setError('Error al guardar la membresía');
      console.error('Error saving membership:', err);
    }
  };

  const handleEdit = (membership: Membership) => {
    setEditingMembership(membership);
    setFormData({
      tipo: membership.tipo,
      descripcion: membership.descripcion,
      precio: membership.precio.toString(),
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
        setMemberships(memberships.filter(membership => membership.id !== confirmDialog.membershipId));
        setConfirmDialog({ isOpen: false, membershipId: null, membershipName: '' });
      } catch (err) {
        setError('Error al eliminar la membresía');
        console.error('Error deleting membership:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      descripcion: '',
      precio: '',
    });
    setEditingMembership(null);
    setShowForm(false);
  };

  const filteredMemberships = memberships.filter(membership =>
    membership.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membership.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
              <h3 className="text-xl font-semibold text-gray-900">{membership.tipo}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(membership)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(membership)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{membership.descripcion}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                ${membership.precio.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">por mes</span>
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
                  Tipo
                </label>
                <input
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Básica, Premium, VIP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
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
                  Precio (USD)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="35.00"
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingMembership ? 'Actualizar' : 'Crear'}
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