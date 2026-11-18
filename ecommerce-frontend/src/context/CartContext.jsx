import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const emptyCart = { items: [], subtotal: 0, shipping_fee: 0, total: 0, item_count: 0 };
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(emptyCart);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.data || emptyCart);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addItem = async (productId, quantity = 1) => {
    await api.post('/cart/items', { product_id: productId, quantity });
    await fetchCart();
  };

  const updateItem = async (itemId, quantity) => {
    await api.put(`/cart/items/${itemId}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    await fetchCart();
  };

  const value = useMemo(
    () => ({ cart, loading, fetchCart, addItem, updateItem, removeItem, clearCart }),
    [cart, loading, isAuthenticated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
