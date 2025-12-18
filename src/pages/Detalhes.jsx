import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // Importação corrigida
import './Detalhes.css';

// Lista de Produtos (A mesma da Home, idealmente viria de um arquivo separado ou do banco)
// Se você já tem esse array em outro lugar, pode importar. Vou repetir aqui para garantir que funcione.
const cardapio = [
  { id: 1, nome: 'X-Burguer', preco: 18.00, img: 'https://img.freepik.com/fotos-gratis/vista-frontal-deliciosos-hamburgueres-de-carne-e-queijo-no-fundo-escuro_140725-89623.jpg', desc: 'Pão, carne artesanal 150g, queijo prato e molho especial.' },
  { id: 2, nome: 'X-Salada', preco: 22.00, img: 'https://img.freepik.com/fotos-gratis/hamburguer-saboroso-isolado-no-fundo-branco-fastfood-de-hamburguer-fresco-com-carne-e-queijo_90220-1063.jpg', desc: 'Pão, carne 150g, queijo, alface, tomate e maionese verde.' },
  { id: 3, nome: 'X-Bacon', preco: 25.00, img: 'https://img.freepik.com/fotos-gratis/hamburguer-de-carne-com-salada-e-queijo_140725-5856.jpg', desc: 'Pão, carne 150g, muito bacon crocante, queijo cheddar e barbecue.' },
  { id: 4, nome: 'Ney Tudo', preco: 32.00, img: 'https://img.freepik.com/fotos-premium/hamburguer-monstro-isolado-em-fundo-preto_841229-399.jpg', desc: 'O matador de fome: 2 carnes, ovo, bacon, calabresa, salada e cheddar.' },
  { id: 5, nome: 'Coca-Cola 350ml', preco: 6.00, img: 'https://img.freepik.com/fotos-gratis/refrigerante-gelado-em-copo_140725-789.jpg', desc: 'Lata geladíssima.' },
  { id: 6, nome: 'Batata Frita', preco: 15.00, img: 'https://img.freepik.com/fotos-gratis/batatas-fritas-crocantes_140725-667.jpg', desc: 'Porção individual sequinha e crocante.' }
];

const Detalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. CHAMA O NOVO MÉTODO EM INGLÊS (addToCart)
  const { addToCart } = useCart(); 

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    // Busca o produto pelo ID na URL
    const itemEncontrado = cardapio.find(item => item.id === parseInt(id));
    if (itemEncontrado) {
      setProduto(itemEncontrado);
    } else {
      navigate('/'); // Se não achar (ex: id 999), volta pra home
    }
  }, [id, navigate]);

  const handleAdicionar = () => {
    if (!produto) return;

    // Cria o objeto do item para mandar pro carrinho
    const itemParaCarrinho = {
      ...produto,
      quantidade: quantidade,
      obs: observacao,
      // Calcula o total desse item específico
      total: produto.preco * quantidade 
    };

    // 2. USA A FUNÇÃO NOVA
    addToCart(itemParaCarrinho);
    
    // Feedback visual ou redirecionamento
    // Opção A: Ir direto pro carrinho
    navigate('/carrinho');
    
    // Opção B: Voltar pra home (Descomente se preferir)
    // navigate('/'); 
    // alert("Adicionado com sucesso!");
  };

  if (!produto) return <div className="carregando">Carregando delícias...</div>;

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

            <div className="controles">
                <div className="contador">
                    <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>-</button>
                    <span>{quantidade}</span>
                    <button onClick={() => setQuantidade(q => q + 1)}>+</button>
                </div>
            </div>

            <div className="observacoes">
                <label>Alguma observação?</label>
                <textarea 
                    placeholder="Ex: Sem cebola, capricha no molho..." 
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows="3"
                ></textarea>
            </div>

            <button className="btn-add-carrinho" onClick={handleAdicionar}>
                Adicionar • R$ {(produto.preco * quantidade).toFixed(2)}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Detalhes;