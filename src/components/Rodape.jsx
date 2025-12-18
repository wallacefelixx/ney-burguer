import React from 'react';
import './Rodape.css';
import { useLocation } from 'react-router-dom';

const Rodape = () => {
  const location = useLocation();

  // Se estiver na tela da cozinha, não mostra o rodapé
  if (location.pathname === '/cozinha') return null;

  return (
    <footer className="rodape">
      <div className="rodape-container">
        <h3>🍔 Ney Burguer</h3>
        <div className="rodape-info">
            <p>📍 Rua do Sabor, 123 - Centro, Divinópolis/MG</p>
            <p>📱 (37) 99888-7777</p>
            <p>🕒 Aberto de Terça a Domingo, das 18h às 00h</p>
        </div>
        <div className="rodape-copy">
            <p>&copy; 2025 Ney Burguer. Feito por Wallace.</p>
        </div>
      </div>
    </footer>
  );
};

export default Rodape;