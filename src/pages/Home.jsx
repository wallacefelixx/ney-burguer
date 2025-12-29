import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { cardapio } from '../data/cardapio';
import BarraCarrinho from '../components/BarraCarrinho';

const Home = () => {
  const navigate = useNavigate();
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  
  // --- CONFIGURAÇÃO DA OFERTA DO DIA ---
  // Escolha o ID do produto que será a oferta (ex: 4 = Monster Ney)
  const ID_OFERTA_DO_DIA = 4; 
  const PRECO_PROMOCIONAL = 34.90; // Preço com desconto

  // Encontra o produto no cardápio
  const produtoOferta = cardapio.find(p => p.id === ID_OFERTA_DO_DIA);

  const categorias = ["Todas", "Tradicionais", "Artesanais", "Combos", "Pizzas", "Bebidas"];

  const produtosFiltrados = categoriaAtiva === 'Todas' 
    ? cardapio 
    : cardapio.filter(p => p.categoria === categoriaAtiva);

  // Função inteligente para navegar (Resolve o problema da lista)
  const abrirProduto = (produto) => {
    // Verifica se o produto clicado é o mesmo da oferta do dia
    if (produto.id === ID_OFERTA_DO_DIA) {
      // Se for, manda com o desconto na mochila
      navigate(`/produto/${produto.id}`, { state: { precoPromocional: PRECO_PROMOCIONAL } });
    } else {
      // Se não for, navega normal
      navigate(`/produto/${produto.id}`);
    }
  };

  return (
    <div className="home-container">
      {/* Cabeçalho */}
       <header className="header">
            <div className="topo-header">
              <div className="marca-box">
                <span className="logo-texto">Ney Burguer</span>
              </div>
              <button className="btn-meus-pedidos" onClick={() => navigate('/pedidos')}>
                🕒 Meus Pedidos
              </button>
            </div>
        
        <div className="categorias-container">
          <div className="categorias-scroll">
            {categorias.map(cat => (
              <button 
                key={cat}
                className={`btn-categoria ${categoriaAtiva === cat ? 'ativa' : ''}`}
                onClick={() => setCategoriaAtiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- BANNER DE OFERTA CLICÁVEL (CORRIGIDO) --- */}
      <div className="banner-container">
        {produtoOferta ? (
          // AQUI ESTAVA O ERRO 1: Agora chamamos a função abrirProduto passando a oferta
          <div className="card-oferta-dia" onClick={() => abrirProduto(produtoOferta)}>
            <div className="faixa-oferta">🔥 OFERTA DO DIA</div>
            <div className="oferta-conteudo">
              <div className="oferta-info">
                  <h3>{produtoOferta.nome}</h3>
                  <p>{produtoOferta.descricao}</p>
                  <div className="precos-oferta">
                      <span className="preco-antigo">De R$ {produtoOferta.preco.toFixed(2).replace('.', ',')}</span>
                      <span className="preco-novo">Por R$ {PRECO_PROMOCIONAL.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button className="btn-ver-oferta">EU QUERO!</button>
              </div>
              <img src={produtoOferta.imagem} alt={produtoOferta.nome} className="img-oferta" />
            </div>
          </div>
        ) : (
          <div className="banner-promocao" style={{ background: '#333', color: '#FBBF24', border: 'none' }}>
                  🍔 <strong>O Melhor Artesanal da Cidade!</strong> Peça já o seu.
          </div>
        )}
      </div>

      {/* --- LISTA DE PRODUTOS (CORRIGIDA) --- */}
      <div className="lista-produtos">
        <h2 className="titulo-secao">{categoriaAtiva}</h2>

        {produtosFiltrados.length === 0 ? (
          <p className="aviso-vazio">Nenhum produto nesta categoria.</p>
        ) : (
          produtosFiltrados.map(produto => (
            <div 
              key={produto.id} 
              className="produto-card"
              // AQUI ESTAVA O ERRO 2: Usamos a função para decidir se aplica desconto ou não
              onClick={() => abrirProduto(produto)}
            >
              <div className="produto-info">
                <h3 className="produto-nome">{produto.nome}</h3>
                <p className="produto-desc">{produto.descricao}</p>
                <p className="produto-preco">
                  {/* Visualmente mostra o desconto se for o item da oferta */}
                  {produto.id === ID_OFERTA_DO_DIA ? (
                     <>
                       <span style={{textDecoration: 'line-through', fontSize: '12px', color: '#999', marginRight: '5px'}}>
                         R$ {produto.preco.toFixed(2).replace('.', ',')}
                       </span>
                       <span style={{color: '#25D366', fontWeight: 'bold'}}>
                         R$ {PRECO_PROMOCIONAL.toFixed(2).replace('.', ',')}
                       </span>
                     </>
                  ) : (
                     `R$ ${produto.preco.toFixed(2).replace('.', ',')}`
                  )}
                </p>
              </div>

              <div className="produto-img-wrapper">
                 <img src={produto.imagem} alt={produto.nome} className="produto-img" />
              </div>
            </div>
          ))
        )}
      </div>

      <BarraCarrinho />
    </div>
  );
};

export default Home;