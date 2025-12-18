import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './BarraCarrinho.css'; // Vamos criar esse CSS já já

const BarraCarrinho = () => {
  const { cartCount, cartTotal } = useCart();
  const navigate = useNavigate();

  // Se não tiver nada no carrinho, não mostra a barra
  if (cartCount === 0) return null;

  return (
    <div className="barra-carrinho-fixa" onClick={() => navigate('/carrinho')}>
      <div className="info-resumo">
        <span className="qtd-itens">{cartCount}</span>
        <span className="texto-ver-sacola">Ver sacola</span>
      </div>
      <div className="valor-total">
        R$ {cartTotal.toFixed(2).replace('.', ',')}
      </div>
    </div>
  );
};

export default BarraCarrinho;