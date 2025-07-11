import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { GymApiService } from '../services/api';
import { Plus, Edit, Trash2, Search, UserCheck, UserX } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import ConfirmDialog from '../components/Common/ConfirmDialog';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    apellido: '',
    email: '',
    rol: 'CLIENTE' as 'ADMIN' | 'EMPLEADO' | 'CLIENTE',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await GymApiService.getUsers();
      setUsers(users);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (editingUser) {
        // Actualizar usuario
        const updateData = {
          ...formData,
          password: formData.password || undefined, // No enviar password vacío
        };
        const updatedUser = await GymApiService.updateUser(editingUser.id, updateData);
        setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      } else {
        // Crear usuario
        const newUser = await GymApiService.createUser(formData);
        setUsers([...users, newUser]);
      }
      
      resetForm();
    } catch (err) {
      setError('Error al guardar el usuario');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
    });
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setConfirmDialog({
      isOpen: true,
      userId: user.id,
      userName: `${user.nombre} ${user.apellido}`,
    });
  };

  const confirmDelete = async () => {
    if (confirmDialog.userId) {
      try {
        setLoading(true);
        await GymApiService.deleteUser(confirmDialog.userId);
        setUsers(users.filter(user => user.id !== confirmDialog.userId));
        setConfirmDialog({ isOpen: false, userId: null, userName: '' });
      } catch (err) {
        setError('Error al eliminar el usuario');
        console.error('Error deleting user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nombre: '',
      apellido: '',
      email: '',
      rol: 'CLIENTE',
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (rol: string) => {
    const styles = {
      ADMIN: 'bg-red-100 text-red-800',
      EMPLEADO: 'bg-blue-100 text-blue-800',
      CLIENTE: 'bg-green-100 text-green-800',
    };
    return styles[rol as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Usuario</span>
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
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">@{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{user.nombre} {user.apellido}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.rol)}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.estado ? (
                        <>
                          <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-700 text-sm">Activo</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-700 text-sm">Inactivo</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Editar usuario"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre de usuario único"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contraseña segura"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apellido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  required
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'ADMIN' | 'EMPLEADO' | 'CLIENTE' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CLIENTE">Cliente</option>
                  <option value="EMPLEADO">Empleado</option>
                  <option value="ADMIN">Administrador</option>
                </select>
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
                  {loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, userId: null, userName: '' })}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${confirmDialog.userName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Users;