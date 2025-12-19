import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { cardapio } from '../data/cardapio'; // <--- IMPORTA O CARDÁPIO CENTRAL
import './Detalhes.css';

const Detalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); 

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    // Busca no arquivo central
    const itemEncontrado = cardapio.find(item => item.id === parseInt(id));
    if (itemEncontrado) {
      setProduto(itemEncontrado);
    } else {
      navigate('/'); 
    }
  }, [id, navigate]);

  const handleAdicionar = () => {
    if (!produto) return;
    const itemParaCarrinho = {
      ...produto,
      quantidade: quantidade,
      obs: observacao,
      total: produto.preco * quantidade 
    };
    addToCart(itemParaCarrinho);
    navigate('/carrinho');
  };

  if (!produto) return <div className="carregando">Carregando...</div>;

  return (
    <div className="detalhes-container">
      <button className="btn-voltar-topo" onClick={() => navigate('/')}>← Voltar</button>
      
      <div className="detalhes-content">
        <div className="detalhes-img">
            <img src={produto.img} alt={produto.nome} />
        </div>

        <div className="detalhes-info">
            <h1>{produto.nome}</h1>
            <p className="desc">{produto.desc}</p>
            <h3 className="preco">R$ {produto.preco.toFixed(2)}</h3>

            <div className="observacoes">
                <label>Alguma observação?</label>
                <textarea 
                    placeholder="Ex: Sem cebola, capricha no molho..." 
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                ></textarea>
            </div>

            <div className="controles">
                <div className="contador">
                    <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>-</button>
                    <span>{quantidade}</span>
                    <button onClick={() => setQuantidade(q => q + 1)}>+</button>
                </div>
                <button className="btn-add-carrinho" onClick={handleAdicionar}>
                    Adicionar • R$ {(produto.preco * quantidade).toFixed(2)}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Detalhes;