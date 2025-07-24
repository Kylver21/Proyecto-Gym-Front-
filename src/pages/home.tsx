import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, ShoppingCart, DollarSign, Users, Calendar } from 'lucide-react';

const Home: React.FC = () => {
  const { user, isClient } = useAuth();

  return (
    <div className="space-y-6">
      {/* Hero Section para clientes */}
      {isClient && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">
              ¡Bienvenido a ProyectoGYM, {user?.nombre}!
            </h1>
            <p className="text-xl mb-6 leading-relaxed">
              La plataforma digital de nuestro gimnasio donde puedes comprar membresías, realizar pagos 
              y gestionar tu acceso al gimnasio de manera fácil y segura desde cualquier lugar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Compra tu Membresía</h3>
                <p className="text-sm opacity-90">
                  Adquiere tu membresía mensual, trimestral o anual directamente desde la plataforma
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <DollarSign className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Pagos Online</h3>
                <p className="text-sm opacity-90">
                  Realiza pagos de membresías y productos deportivos de forma segura
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Tienda del Gimnasio</h3>
                <p className="text-sm opacity-90">
                  Compra productos deportivos y suplementos disponibles en el gimnasio
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información sobre la aplicación */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué puedes hacer en ProyectoGYM?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprar Membresías</h3>
                <p className="text-gray-600">
                  Adquiere tu membresía al gimnasio directamente desde la plataforma. Elige entre planes 
                  diarios, mensuales, trimestrales o anuales según tus necesidades.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Realizar Pagos</h3>
                <p className="text-gray-600">
                  Realiza pagos de membresías y productos del gimnasio de forma segura. 
                  Mantén tu acceso activo con pagos puntuales.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tienda del Gimnasio</h3>
                <p className="text-gray-600">
                  Compra productos deportivos, suplementos y accesorios disponibles 
                  en nuestro gimnasio desde la comodidad de tu hogar.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h3>
              <div className="space-y-3">
                <a
                  href="/products"
                  className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Comprar Membresía</span>
                  </div>
                </a>
                
                <a
                  href="/memberships"
                  className="block p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors border"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Mi Membresía Actual</span>
                  </div>
                </a>
                
                <a
                  href="/pagos"
                  className="block p-3 bg-white rounded-lg hover:bg-green-50 transition-colors border"
                >
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Realizar Pago</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Si tienes dudas sobre las membresías, pagos o el acceso al gimnasio, contáctanos.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas para el usuario */}
      {isClient && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado de Membresía</p>
                <p className="text-2xl font-bold text-gray-900">Premium Anual</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-green-600">Acceso Activo</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Último Pago</p>
                <p className="text-2xl font-bold text-gray-900">$75.00</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Membresía renovada</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencimiento</p>
                <p className="text-2xl font-bold text-gray-900">335 días</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Tiempo restante</span>
            </div>
          </div>
        </div>
      )}

      {/* Actividad reciente */}
      {isClient && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Membresía renovada</p>
                <p className="text-sm text-gray-500">Pago de membresía Premium procesado - $75.00</p>
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
                <p className="text-sm font-medium text-gray-900">Compra en tienda</p>
                <p className="text-sm text-gray-500">Proteína Whey comprada - $45.00</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">Hace 1 semana</div>
            </div>

            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Cuenta actualizada</p>
                <p className="text-sm text-gray-500">Información de contacto modificada</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">Hace 2 semanas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
