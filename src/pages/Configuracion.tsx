import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { GymApiService } from '../services/api';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';

const Configuracion: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('Configuracion debe usarse dentro de un AuthProvider');
  }
  const { user } = authContext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados para configuración del perfil
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estados para configuración del sistema
  const [systemConfig, setSystemConfig] = useState({
    gymName: 'ProyectoGYM',
    gymAddress: 'Dirección del Gimnasio',
    gymPhone: '+1234567890',
    gymEmail: 'info@proyectogym.com',
    timezone: 'America/Mexico_City',
    currency: 'USD',
    language: 'es',
  });

  // Estados para configuración de notificaciones
  const [notificationConfig, setNotificationConfig] = useState({
    emailNotifications: true,
    membershipExpiry: true,
    lowStock: true,
    newPayments: true,
    systemAlerts: true,
    emailFrequency: 'daily',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Validar contraseña si se está cambiando
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setError('Las contraseñas nuevas no coinciden');
          return;
        }
        if (profileData.newPassword.length < 6) {
          setError('La nueva contraseña debe tener al menos 6 caracteres');
          return;
        }
        if (!profileData.currentPassword) {
          setError('Debe ingresar su contraseña actual para cambiarla');
          return;
        }
      }

      const updateData: any = {
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        email: profileData.email,
      };

      // Solo incluir password si se está cambiando
      if (profileData.newPassword) {
        updateData.password = profileData.newPassword;
      }

      await GymApiService.updateUser(user.id, updateData);
      
      // Limpiar campos de contraseña
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      alert('Perfil actualizado exitosamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemConfigSave = () => {
    // Simular guardado de configuración del sistema
    localStorage.setItem('gymSystemConfig', JSON.stringify(systemConfig));
    alert('Configuración del sistema guardada');
  };

  const handleNotificationConfigSave = () => {
    // Simular guardado de configuración de notificaciones
    localStorage.setItem('gymNotificationConfig', JSON.stringify(notificationConfig));
    alert('Configuración de notificaciones guardada');
  };

  const handleBackupDownload = () => {
    // Simular descarga de backup
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      systemConfig,
      notificationConfig,
      userProfile: {
        id: user?.id,
        username: user?.username,
        nombre: user?.nombre,
        apellido: user?.apellido,
        email: user?.email,
        rol: user?.rol,
      }
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-gym-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        if (backupData.systemConfig) {
          setSystemConfig(backupData.systemConfig);
        }
        if (backupData.notificationConfig) {
          setNotificationConfig(backupData.notificationConfig);
        }
        
        alert('Backup restaurado exitosamente');
      } catch (err) {
        alert('Error al restaurar el backup: archivo inválido');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'perfil', name: 'Mi Perfil', icon: User },
    { id: 'sistema', name: 'Sistema', icon: Settings },
    { id: 'notificaciones', name: 'Notificaciones', icon: Bell },
    { id: 'seguridad', name: 'Seguridad', icon: Shield },
    { id: 'backup', name: 'Backup', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="h-4 w-4" />
          <span>{user?.nombre} {user?.apellido}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {user?.rol}
          </span>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow-md">
            <div className="p-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md">
            {/* Perfil Tab */}
            {activeTab === 'perfil' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mi Perfil</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileData.nombre}
                        onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileData.apellido}
                        onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contraseña Actual
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={profileData.currentPassword}
                            onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                            placeholder="Dejar vacío si no desea cambiar"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={profileData.newPassword}
                            onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                            placeholder="Mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          value={profileData.confirmPassword}
                          onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Repetir nueva contraseña"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                      <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sistema Tab */}
            {activeTab === 'sistema' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración del Sistema</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Gimnasio
                      </label>
                      <input
                        type="text"
                        value={systemConfig.gymName}
                        onChange={(e) => setSystemConfig({ ...systemConfig, gymName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={systemConfig.gymPhone}
                        onChange={(e) => setSystemConfig({ ...systemConfig, gymPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={systemConfig.gymAddress}
                      onChange={(e) => setSystemConfig({ ...systemConfig, gymAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email del Gimnasio
                    </label>
                    <input
                      type="email"
                      value={systemConfig.gymEmail}
                      onChange={(e) => setSystemConfig({ ...systemConfig, gymEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zona Horaria
                      </label>
                      <select
                        value={systemConfig.timezone}
                        onChange={(e) => setSystemConfig({ ...systemConfig, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="America/Mexico_City">México</option>
                        <option value="America/New_York">Nueva York</option>
                        <option value="America/Los_Angeles">Los Ángeles</option>
                        <option value="Europe/Madrid">Madrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moneda
                      </label>
                      <select
                        value={systemConfig.currency}
                        onChange={(e) => setSystemConfig({ ...systemConfig, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="MXN">MXN ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idioma
                      </label>
                      <select
                        value={systemConfig.language}
                        onChange={(e) => setSystemConfig({ ...systemConfig, language: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSystemConfigSave}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar Configuración</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notificaciones Tab */}
            {activeTab === 'notificaciones' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notificaciones</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Alertas del Sistema</h3>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'membershipExpiry', label: 'Vencimiento de membresías' },
                        { key: 'lowStock', label: 'Stock bajo en productos' },
                        { key: 'newPayments', label: 'Nuevos pagos registrados' },
                        { key: 'systemAlerts', label: 'Alertas del sistema' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={notificationConfig[item.key as keyof typeof notificationConfig] as boolean}
                            onChange={(e) => setNotificationConfig({
                              ...notificationConfig,
                              [item.key]: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frecuencia de Emails
                    </label>
                    <select
                      value={notificationConfig.emailFrequency}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, emailFrequency: e.target.value })}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="immediate">Inmediato</option>
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="never">Nunca</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNotificationConfigSave}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar Configuración</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Seguridad Tab */}
            {activeTab === 'seguridad' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h2>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <Shield className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Información de Seguridad</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Cambie su contraseña regularmente</li>
                            <li>Use contraseñas fuertes con al menos 8 caracteres</li>
                            <li>No comparta sus credenciales de acceso</li>
                            <li>Cierre sesión cuando termine de usar el sistema</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Cuenta</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usuario:</span>
                        <span className="font-medium">@{user?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rol:</span>
                        <span className="font-medium">{user?.rol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`font-medium ${user?.estado ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Backup y Restauración</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <Database className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Información de Backup</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          Los backups incluyen configuración del sistema, preferencias de usuario y datos de configuración.
                          No incluyen datos sensibles como contraseñas.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Download className="h-5 w-5 mr-2" />
                        Crear Backup
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Descarga un archivo de backup con toda la configuración actual del sistema.
                      </p>
                      <button
                        onClick={handleBackupDownload}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Descargar Backup</span>
                      </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        Restaurar Backup
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Selecciona un archivo de backup para restaurar la configuración del sistema.
                      </p>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleBackupRestore}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
