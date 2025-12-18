import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // Importação correta (Inglês)
import './Navbar.css';

const Navbar = () => {
  const { cartCount } = useCart();
  const location = useLocation();

  // Esconde o Navbar na tela da cozinha para dar foco total aos pedidos
  if (location.pathname === '/cozinha') return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* LOGO / TÍTULO */}
        <Link to="/" className="navbar-logo">
          🍔 Ney <span className="logo-highlight">Burguer</span>
        </Link>

        {/* ÁREA DE AÇÕES (DIREITA) */}
        <div className="navbar-actions">
          
          {/* Link Meus Pedidos */}
          <Link to="/pedidos" className="nav-link">
            {/* Ícone de Lista SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span className="link-text">Pedidos</span>
          </Link>

          {/* Link Carrinho com Badge */}
          <Link to="/carrinho" className="nav-cart-btn">
            <div className="icon-wrapper">
              {/* Ícone de Sacola de Compras SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              
              {/* Bolinha Vermelha (Só mostra se tiver item) */}
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span className="link-text">Carrinho</span>
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;