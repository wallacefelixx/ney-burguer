// src/contexts/CartContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Cria a "caixa" vazia
const CartContext = createContext({});

// Cria o componente que vai "envolver" todo o site para dar acesso à caixa
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Função para adicionar item ao carrinho
  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      // Verifica se o item já existe (mesmo ID e mesma observação)
      // Se a observação for diferente, conta como outro item (ex: um com cebola, outro sem)
      const itemExists = prevItems.find(
        (item) => item.id === newItem.id && item.obs === newItem.obs
      );

      if (itemExists) {
        // Se já existe, só aumenta a quantidade
        return prevItems.map((item) =>
          item.id === newItem.id && item.obs === newItem.obs
            ? { ...item, quantidade: item.quantidade + newItem.quantidade, total: (item.quantidade + newItem.quantidade) * item.preco }
            : item
        );
      }

      // Se não existe, adiciona na lista
      return [...prevItems, newItem];
    });
  };

  // Função para remover item (usaremos na tela do carrinho)
  const removeFromCart = (itemId, itemObs) => {
    setCartItems((prevItems) => 
      prevItems.filter(item => !(item.id === itemId && item.obs === itemObs))
    );
  };

  // Calcula o valor total de tudo no carrinho
  const cartTotal = cartItems.reduce((total, item) => total + item.total, 0);
  
  // Conta quantos itens tem no carrinho
  const cartCount = cartItems.reduce((count, item) => count + item.quantidade, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Um "atalho" para usar o contexto mais fácil nas outras páginas
export const useCart = () => {
  return useContext(CartContext);
};