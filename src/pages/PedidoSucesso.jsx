import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PedidoSucesso.css';

const PedidoSucesso = () => {
  const location = useLocation();
  // Verifica se o pagamento foi PIX através do estado passado pelo navigate
  const isPix = location.state?.pagamento?.toLowerCase().includes('pix');

  return (
    <div className="sucesso-container">
      <div className="icone-sucesso">🎉</div>
      <h1>Pedido Realizado!</h1>
      <p className="subtitulo">A cozinha já recebeu seu pedido.</p>

      {/* Alerta Especial se for PIX */}
      {isPix && (
        <div className="alerta-pix-box">
          <h3>💠 Pagamento via PIX</h3>
          <p>Para liberar seu pedido mais rápido, não esqueça de enviar o comprovante no nosso WhatsApp!</p>
          <a 
            href="https://wa.me/5537999999999" // Coloque o número real aqui
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-zap"
          >
            Enviar Comprovante Agora
          </a>
        </div>
      )}

      <div className="acoes-sucesso">
        <Link to="/pedidos" className="btn-rastrear">
          📦 Acompanhar Pedido
        </Link>
        <Link to="/" className="btn-inicio">
          Voltar ao Cardápio
        </Link>
      </div>
    </div>
  );
};

export default PedidoSucesso;