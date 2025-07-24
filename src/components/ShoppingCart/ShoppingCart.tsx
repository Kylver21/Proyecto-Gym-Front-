import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product, Membership } from '../../types';
import { ShoppingCart, X, Plus, Minus, CreditCard, Package, Trash2 } from 'lucide-react';
import ErrorMessage from '../Common/ErrorMessage';

const ShoppingCartComponent: React.FC = () => {
  const navigate = useNavigate();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems,
    isOpen,
    toggleCart 
  } = useCart();
  
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      setError('Debes iniciar sesión para realizar una compra');
      return;
    }

    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    // Cerrar el carrito y navegar a la página de checkout
    toggleCart();
    navigate('/checkout');
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleCart}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Carrito de Compras ({getTotalItems()})
          </h2>
          <button
            onClick={toggleCart}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {error && (
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          )}

          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-500 mt-2">
                Agrega productos o membresías para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'membership' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {item.type === 'membership' ? (
                        <CreditCard className={`h-5 w-5 ${
                          item.type === 'membership' ? 'text-purple-600' : 'text-blue-600'
                        }`} />
                      ) : (
                        <Package className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.type === 'membership' 
                          ? `Membresía ${(item.item as Membership).tipo}`
                          : (item.item as Product).nombre
                        }
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.item.descripcion}
                        {item.type === 'product' && (
                          <span className="block mt-1 text-xs">
                            Stock disponible: {(item.item as Product).stock}
                          </span>
                        )}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green-600">
                            S/{item.price.toFixed(2)}
                          </span>
                          {item.type === 'membership' && (
                            <span className="text-sm text-gray-500">
                              ({(item.item as Membership).duracion_dias} días)
                            </span>
                          )}
                        </div>
                        
                        {item.type === 'product' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (item.type === 'product') {
                                  // Verificar si hay stock disponible
                                  const product = item.item as Product;
                                  if (item.quantity < product.stock) {
                                    updateQuantity(item.id, item.quantity + 1);
                                  } else {
                                    setError(`Stock máximo disponible: ${product.stock}`);
                                    setTimeout(() => setError(null), 3000);
                                  }
                                } else {
                                  updateQuantity(item.id, item.quantity + 1);
                                }
                              }}
                              className={`p-1 ${
                                item.type === 'product' && item.quantity >= (item.item as Product).stock
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                              disabled={item.type === 'product' && item.quantity >= (item.item as Product).stock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          Subtotal: S/{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">S/{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={!user}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceder al Pago</span>
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Vaciar Carrito
                </button>
              </div>
              
              {!user && (
                <p className="text-sm text-red-600 text-center">
                  Debes iniciar sesión para realizar una compra
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
