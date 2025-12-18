import React from 'react';
import './Rodape.css';
import { useLocation, Link } from 'react-router-dom';

const Rodape = () => {
  const location = useLocation();

  // Não mostra na cozinha para economizar espaço
  if (location.pathname === '/cozinha') return null;

  return (
    <footer className="rodape">
      <div className="rodape-container">
        
        {/* Coluna 1: Marca e Slogan */}
        <div className="rodape-coluna">
          <h3 className="marca">🍔 Ney Burguer</h3>
          <p className="slogan">
            O autêntico sabor artesanal. Ingredientes selecionados e paixão em cada mordida.
          </p>
          <div className="redes-sociais">
            {/* Links fictícios para demonstração */}
            <a href="https://www.instagram.com/neyburguerlanches/" className="social-link">Instagram</a>
            <a href="https://w.app/kjl3cz" className="social-link">WhatsApp</a>
          </div>
        </div>

        {/* Coluna 2: Contato e Endereço */}
        <div className="rodape-coluna">
          <h4>📍 Onde Estamos</h4>
          <address>
            <p>Rua Bayssur, 570 - Maria Helena</p>
            <p>Divinópolis - MG</p>
            <p>CEP: 35500-034</p>
          </address>
          <div className="contato-direto">
            <p>📞 (37) 3215-3414</p>
            <p>✉️ contato@neyburguer.com.br</p>
          </div>
        </div>

        {/* Coluna 3: Horários e Links Úteis */}
        <div className="rodape-coluna">
          <h4>🕒 Horário de Atendimento</h4>
          <ul className="lista-horarios">
            <li><span>Qui:</span> 18:30hs às 23:30hs</li>
            <li><span>Sex:</span> 18:30h às 23:30hs</li>
            <li><span>Sábado:</span> 18:30hs às 23h30hs</li>
            <li><span>Domingo:</span> 18:30hs às 23h30hs</li>
          </ul>
          <div className="links-uteis">
             <Link to="/pedidos">Meus Pedidos</Link>
          </div>
        </div>

      </div>

      {/* Barra Final de Copyright */}
      <div className="rodape-bottom">
        <p>&copy; {new Date().getFullYear()} Ney Burguer. Todos os direitos reservados.</p>
        <p className="dev-credito">Desenvolvido por <strong>Wallace Tech</strong></p>
      </div>
    </footer>
  );
};

export default Rodape;