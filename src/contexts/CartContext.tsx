import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Membership } from '../types';

export interface CartItem {
  id: string;
  type: 'product' | 'membership';
  item: Product | Membership;
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Product | Membership, type: 'product' | 'membership', quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar items del localStorage al inicializar
  useEffect(() => {
    const savedItems = localStorage.getItem('gym-cart-items');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar items en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('gym-cart-items', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Product | Membership, type: 'product' | 'membership', quantity = 1) => {
    const itemId = `${type}-${item.id}`;
    
    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === itemId);
      
      if (existingItem) {
        // Si es una membresía, no permitir más de 1
        if (type === 'membership') {
          return prevItems;
        }
        
        // Si es un producto, verificar stock antes de incrementar
        if (type === 'product') {
          const product = item as Product;
          const newQuantity = existingItem.quantity + quantity;
          
          if (newQuantity > product.stock) {
            // No permitir exceder el stock
            alert(`Stock insuficiente. Disponible: ${product.stock}, en carrito: ${existingItem.quantity}`);
            return prevItems;
          }
        }
        
        // Incrementar cantidad
        return prevItems.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Verificar stock para productos nuevos
        if (type === 'product') {
          const product = item as Product;
          if (quantity > product.stock) {
            alert(`Stock insuficiente. Disponible: ${product.stock}`);
            return prevItems;
          }
        }
        
        // Agregar nuevo item
        const newItem: CartItem = {
          id: itemId,
          type,
          item,
          quantity: type === 'membership' ? 1 : quantity,
          price: item.precio
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          // Validar stock para productos
          if (item.type === 'product') {
            const product = item.item as Product;
            if (quantity > product.stock) {
              alert(`Stock insuficiente. Disponible: ${product.stock}`);
              return item; // No cambiar la cantidad
            }
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      isOpen,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
