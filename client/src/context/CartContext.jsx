import { createContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = sessionStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const saveCart = (items) => {
    sessionStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
  };

  const addToCart = useCallback((food) => {
    setCartItems(prev => {
      // Check if items are from different vendor
      if (prev.length > 0 && prev[0].vendor !== food.vendor._id && prev[0].vendor !== food.vendor) {
        toast.error('You can only order from one vendor at a time. Clear your cart first.');
        return prev;
      }

      const existing = prev.find(item => item._id === food._id);
      let updated;
      if (existing) {
        updated = prev.map(item =>
          item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, {
          _id: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          vendor: food.vendor?._id || food.vendor,
          vendorName: food.vendor?.shopName || food.vendorName || '',
          quantity: 1,
        }];
      }
      sessionStorage.setItem('cart', JSON.stringify(updated));
      toast.success(`${food.name} added to cart`);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((foodId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item._id !== foodId);
      sessionStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    toast.success('Item removed from cart');
  }, []);

  const updateQuantity = useCallback((foodId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => {
      const updated = prev.map(item =>
        item._id === foodId ? { ...item, quantity } : item
      );
      sessionStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    sessionStorage.removeItem('cart');
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
