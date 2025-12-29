import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // <--- ADICIONEI useLocation
import { useCart } from '../contexts/CartContext';
import { cardapio } from '../data/cardapio'; 
import './Detalhes.css';

const Detalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // <--- Habilita receber dados da Home
  const { addToCart } = useCart(); 

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');

  // Tenta pegar o preço promocional (se ele existir no "estado" da navegação)
  const precoPromocional = location.state?.precoPromocional;

  useEffect(() => {
    const itemEncontrado = cardapio.find(item => item.id === parseInt(id));
    if (itemEncontrado) {
      setProduto(itemEncontrado);
    } else {
      navigate('/'); 
    }
  }, [id, navigate]);

  // Lógica principal: Se tiver desconto, usa ele. Se não, usa o original.
  const precoFinal = (produto && precoPromocional) ? precoPromocional : (produto ? produto.preco : 0);

  const handleAdicionar = () => {
    if (!produto) return;
    const itemParaCarrinho = {
      ...produto,
      preco: precoFinal, // <--- SALVA O PREÇO JÁ COM DESCONTO
      quantidade: quantidade,
      obs: observacao,
      total: precoFinal * quantidade // <--- CALCULA O TOTAL COM O DESCONTO
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
            {/* Mantive suporte para os dois nomes de variável caso tenha mudado no cardapio */}
            <img src={produto.imagem || produto.img} alt={produto.nome} />
        </div>

        <div className="detalhes-info">
            <h1>{produto.nome}</h1>
            <p className="desc">{produto.descricao || produto.desc}</p>
            
            {/* SE TIVER PROMOÇÃO, MOSTRA O PREÇO DE/POR */}
            {precoPromocional ? (
                <div style={{ marginBottom: '15px' }}>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '1rem', marginRight: '10px' }}>
                        R$ {produto.preco.toFixed(2)}
                    </span>
                    <span className="preco" style={{ color: '#25D366', fontSize: '1.8rem', fontWeight: 'bold' }}>
                        R$ {precoPromocional.toFixed(2)}
                    </span>
                </div>
            ) : (
                <h3 className="preco">R$ {produto.preco.toFixed(2)}</h3>
            )}

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
                {/* O botão agora mostra e calcula com o preço final correto */}
                <button className="btn-add-carrinho" onClick={handleAdicionar}>
                    Adicionar • R$ {(precoFinal * quantidade).toFixed(2)}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Detalhes;