import React, { createContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);
      if (existingItemIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += item.quantity;
        return newItems;
      } else {
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, calculateTotal, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
