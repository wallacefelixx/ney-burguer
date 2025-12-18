import React, { useState } from 'react';
import './Rodape.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const Rodape = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contadorCliques, setContadorCliques] = useState(0);

  // Não mostra o rodapé se já estiver na cozinha
  if (location.pathname === '/cozinha') return null;

  // Função do Botão Secreto
  const handleSecretClick = () => {
    const novoContador = contadorCliques + 1;
    setContadorCliques(novoContador);

    if (novoContador === 5) {
      // Se clicou 5 vezes, leva pra cozinha
      navigate('/cozinha');
      setContadorCliques(0); // Reseta
    }
  };

  return (
    <footer className="rodape">
      <div className="rodape-container">
        
        {/* Coluna 1: Marca */}
        <div className="rodape-coluna">
          <h3 className="marca">🍔 Ney Burguer</h3>
          <p className="slogan">
            O autêntico sabor artesanal. Ingredientes selecionados e paixão em cada mordida.
          </p>
          <div className="redes-sociais">
            <span className="social-link">Instagram</span>
            <span className="social-link">Facebook</span>
            <span className="social-link">WhatsApp</span>
          </div>
        </div>

        {/* Coluna 2: Contato */}
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

        {/* Coluna 3: Horários */}
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

      {/* Barra Final com o SEGREDO */}
      <div className="rodape-bottom">
        <p>&copy; {new Date().getFullYear()} Ney Burguer & Grill. Todos os direitos reservados.</p>
        
        {/* CLIQUE AQUI 5 VEZES PARA IR PARA A COZINHA */}
        <p 
          className="dev-credito" 
          onClick={handleSecretClick} 
          style={{cursor: 'pointer', userSelect: 'none'}}
          title="Área Restrita (Clique 5x)"
        >
          Desenvolvido por <strong>Wallace Tech</strong>
        </p>
      </div>
    </footer>
  );
};

export default Rodape;