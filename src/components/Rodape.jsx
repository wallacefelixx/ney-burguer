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
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Facebook</a>
            <a href="#" className="social-link">WhatsApp</a>
          </div>
        </div>

        {/* Coluna 2: Contato e Endereço */}
        <div className="rodape-coluna">
          <h4>📍 Onde Estamos</h4>
          <address>
            <p>Rua do Sabor, 123 - Centro</p>
            <p>Divinópolis - MG</p>
            <p>CEP: 35500-000</p>
          </address>
          <div className="contato-direto">
            <p>📞 (37) 99888-7777</p>
            <p>✉️ contato@neyburguer.com.br</p>
          </div>
        </div>

        {/* Coluna 3: Horários e Links Úteis */}
        <div className="rodape-coluna">
          <h4>🕒 Horário de Atendimento</h4>
          <ul className="lista-horarios">
            <li><span>Ter - Qui:</span> 18h às 23h</li>
            <li><span>Sex - Sáb:</span> 18h às 00h30</li>
            <li><span>Domingo:</span> 18h às 23h30</li>
          </ul>
          <div className="links-uteis">
             <Link to="/pedidos">Meus Pedidos</Link>
          </div>
        </div>

      </div>

      {/* Barra Final de Copyright */}
      <div className="rodape-bottom">
        <p>&copy; {new Date().getFullYear()} Ney Burguer & Grill. Todos os direitos reservados.</p>
        <p className="dev-credito">Desenvolvido por <strong>Wallace Tech</strong></p>
      </div>
    </footer>
  );
};

export default Rodape;