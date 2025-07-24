import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { GymApiService } from '../services/api';
import { Product, Membership, CreatePaymentRequest, CreateProductSaleRequest } from '../types';
import { ShoppingCart, CreditCard as CreditCardIcon, Package, ArrowLeft, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { formatDateForBackend } from '../utils/dateUtils';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart, getTotalPrice } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState({
    metodo_pago: 'TARJETA' as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA',
  });

  // Redirigir si no hay items o no está autenticado
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (items.length === 0) {
      navigate('/products');
      return;
    }
  }, [user, items, navigate]);

  const handlePayment = async () => {
    if (!user || items.length === 0) {
      setError('Error: No hay items para procesar o usuario no válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const purchases = [];
      
      for (const item of items) {
        if (item.type === 'membership') {
          // Procesar compra de membresía
          const membershipData = {
            usuario_id: user.id,
            membresia_id: item.item.id,
            fecha_inicio: new Date().toISOString().split('T')[0]
          };
          
          const registration = await GymApiService.createMembershipRegistration(membershipData);
          
          // Crear el pago asociado
          if (registration) {
            const paymentInfo: CreatePaymentRequest = {
              registroMembresiaId: registration.id,
              monto: item.price,
              fechaPago: formatDateForBackend(),
              metodoPago: paymentData.metodo_pago,
              estado: 'COMPLETADO'
            };
            
            const payment = await GymApiService.createPayment(paymentInfo);
            purchases.push({ 
              type: 'membership', 
              registration, 
              payment,
              item: item.item 
            });
          }
        } else if (item.type === 'product') {
          // Para productos, solo registrar la compra - el admin manejará el stock
          const productPurchase = {
            usuario_id: user.id,
            producto_id: item.item.id,
            cantidad: item.quantity,
            precio_total: item.price * item.quantity,
            metodo_pago: paymentData.metodo_pago,
            fecha_compra: formatDateForBackend() // Formato YYYY-MM-DD
          };
          
          // Actualizar stock del producto (opcional - depende si el backend lo maneja)
          try {
            const currentProduct = item.item as Product;
            if (currentProduct.stock >= item.quantity) {
              await GymApiService.updateProduct(currentProduct.id, {
                stock: currentProduct.stock - item.quantity
              });
            }
          } catch (error) {
            console.warn('No se pudo actualizar el stock automaticamente:', error);
          }
          
          purchases.push({ 
            type: 'product', 
            data: productPurchase,
            item: item.item
          });
        }
      }

      // Limpiar carrito después de compra exitosa
      clearCart();
      setPurchaseDetails(purchases);
      setSuccess(true);
      
      // Redirigir después de 5 segundos (más tiempo para ver los detalles)
      setTimeout(() => {
        navigate('/home');
      }, 5000);
      
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Error al procesar el pago. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Compra Exitosa!
            </h1>
            <p className="text-gray-600">
              Tu compra ha sido procesada correctamente
            </p>
          </div>

          {/* Detalles de la compra */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen de tu compra:
            </h2>
            
            <div className="space-y-4">
              {purchaseDetails.map((purchase, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  {purchase.type === 'membership' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-6 w-6 text-blue-500 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Membresía: {purchase.item.nombre}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Duración: {purchase.item.duracion_meses} meses
                          </p>
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Membresía activada en tu cuenta
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        S/ {purchase.item.precio}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingCart className="h-6 w-6 text-green-500 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Producto: {purchase.item.nombre}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Cantidad: {purchase.data.cantidad}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        S/ {purchase.data.precio_total}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total pagado:</span>
                <span className="text-green-600">
                  S/ {purchaseDetails.reduce((sum, p) => 
                    sum + (p.type === 'membership' ? p.item.precio : p.data.precio_total), 0
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-4">
              Serás redirigido al inicio en unos segundos...
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Ir al Inicio Ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a la tienda
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumen de la Compra */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <ShoppingCart className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Resumen de tu Compra</h2>
          </div>

          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-3 rounded-lg ${
                  item.type === 'membership' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  {item.type === 'membership' ? (
                    <CreditCardIcon className={`h-6 w-6 ${
                      item.type === 'membership' ? 'text-purple-600' : 'text-blue-600'
                    }`} />
                  ) : (
                    <Package className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.type === 'membership' 
                      ? `Membresía ${(item.item as Membership).tipo}`
                      : (item.item as Product).nombre
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.item.descripcion}
                  </p>
                  {item.type === 'membership' && (
                    <p className="text-sm text-blue-600">
                      Duración: {(item.item as Membership).duracion_dias} días
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">
                      S/{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Total a Pagar:</span>
              <span className="text-green-600">S/{getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Formulario de Pago */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <CreditCardIcon className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Información de Pago</h2>
          </div>

          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Datos del Cliente</h3>
              <p className="text-blue-800">{user.nombre} {user.apellido}</p>
              <p className="text-sm text-blue-700">{user.email}</p>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pago *
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="TARJETA"
                    checked={paymentData.metodo_pago === 'TARJETA'}
                    onChange={(e) => setPaymentData({ 
                      ...paymentData, 
                      metodo_pago: e.target.value as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' 
                    })}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span>Tarjeta de Crédito/Débito</span>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="TRANSFERENCIA"
                    checked={paymentData.metodo_pago === 'TRANSFERENCIA'}
                    onChange={(e) => setPaymentData({ 
                      ...paymentData, 
                      metodo_pago: e.target.value as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' 
                    })}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-purple-600 mr-2" />
                    <span>Transferencia Bancaria</span>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="EFECTIVO"
                    checked={paymentData.metodo_pago === 'EFECTIVO'}
                    onChange={(e) => setPaymentData({ 
                      ...paymentData, 
                      metodo_pago: e.target.value as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' 
                    })}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="h-5 w-5 text-green-600 mr-2">💵</span>
                    <span>Efectivo (Pago en sucursal)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Información adicional según método de pago */}
            {paymentData.metodo_pago === 'EFECTIVO' && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Para pagos en efectivo, deberás presentarte en nuestras instalaciones 
                  dentro de las próximas 24 horas para completar el pago.
                </p>
              </div>
            )}

            {paymentData.metodo_pago === 'TRANSFERENCIA' && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Datos para transferencia:</strong><br />
                  Banco: ProyectoGYM Bank<br />
                  N° Cuenta: 1234567890<br />
                  Referencia: {user.username}-{Date.now()}
                </p>
              </div>
            )}

            {/* Botón de Pago */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Procesando Pago...</span>
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5" />
                  <span>Confirmar Pago - S/{getTotalPrice().toFixed(2)}</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Al confirmar el pago, aceptas nuestros términos y condiciones. 
              Tu membresía se activará inmediatamente después del pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
