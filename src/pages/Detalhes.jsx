// src/pages/Detalhes.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cardapio } from '../data/menu';
import './Detalhes.css';
import { useCart } from '../contexts/CartContext'; // Importação correta

const Detalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // === ADICIONE ESTA LINHA AQUI ===
  const { addToCart } = useCart(); 
  // ================================

  const produto = cardapio.find(item => item.id === Number(id));

  const [qtd, setQtd] = useState(1);
  const [observacao, setObservacao] = useState('');

  if (!produto) {
    return <div className="p-4">Produto não encontrado! <button onClick={() => navigate('/')}>Voltar</button></div>;
  }

  const aumentar = () => setQtd(qtd + 1);
  const diminuir = () => {
    if (qtd > 1) setQtd(qtd - 1);
  };

  const adicionarAoCarrinho = () => {
    const itemPedido = {
      ...produto,
      quantidade: qtd,
      obs: observacao,
      total: produto.preco * qtd
    };
    
    // Agora vai funcionar porque declaramos ela ali em cima
    addToCart(itemPedido);
    
    navigate('/');
  };

  return (
    <div className="detalhes-container">
      {/* ... o resto do seu código (HTML) continua igual ... */}
       <button className="btn-voltar" onClick={() => navigate('/')}>
        {'<'}
      </button>

      <img src={produto.imagem} alt={produto.nome} className="detalhes-img" />

      <div className="detalhes-info">
        <h1 className="detalhes-titulo">{produto.nome}</h1>
        <p className="detalhes-desc">{produto.descricao}</p>
        
        <div className="detalhes-preco">
          R$ {produto.preco.toFixed(2).replace('.', ',')}
        </div>

        <label className="label-obs">Observações:</label>
        <textarea 
          className="input-obs"
          placeholder="Ex: Sem milho, salada, etc..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>

      <div className="barra-fixa">
        <div className="contador">
          <button className="btn-qtd" onClick={diminuir}>-</button>
          <span className="numero-qtd">{qtd}</span>
          <button className="btn-qtd" onClick={aumentar}>+</button>
        </div>

        <button className="btn-adicionar" onClick={adicionarAoCarrinho}>
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
};

export default Detalhes;