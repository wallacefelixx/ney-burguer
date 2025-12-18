// src/contexts/CartContext.jsx
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find(
        (item) => item.id === newItem.id && item.obs === newItem.obs
      );

      if (itemExists) {
        return prevItems.map((item) =>
          item.id === newItem.id && item.obs === newItem.obs
            ? { ...item, quantidade: item.quantidade + newItem.quantidade, total: (item.quantidade + newItem.quantidade) * item.preco }
            : item
        );
      }
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (itemId, itemObs) => {
    setCartItems((prevItems) => 
      prevItems.filter(item => !(item.id === itemId && item.obs === itemObs))
    );
  };

  // --- NOVA FUNÇÃO NECESSÁRIA PARA O CHECKOUT ---
  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.total, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantidade, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};