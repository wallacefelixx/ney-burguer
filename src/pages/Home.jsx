import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
// Importação CORRETA (apenas uma vez)
import { cardapio } from '../data/cardapio';
import BarraCarrinho from '../components/BarraCarrinho'; // Ou SacolaFlutuante, dependendo de qual você escolheu usar

const Home = () => {
  const navigate = useNavigate();
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  
  // Lista de categorias para o filtro
  const categorias = ["Todas", "Tradicionais", "Artesanais", "Combos", "Pizzas", "Bebidas"];

  // Lógica de Filtro
  const produtosFiltrados = categoriaAtiva === 'Todas' 
    ? cardapio 
    : cardapio.filter(p => p.categoria === categoriaAtiva);

  return (
    <div className="home-container">
      {/* Cabeçalho */}
       <header className="header">
            <div className="topo-header">
              <div className="marca-box">
                <span className="logo-texto">Ney Burguer</span>
              </div>
              
              {/* Link para Meus Pedidos */}
              <button className="btn-meus-pedidos" onClick={() => navigate('/pedidos')}>
                🕒 Meus Pedidos
              </button>
            </div>
        
        {/* Categorias (Scroll Horizontal) */}
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

      {/* Banner Promocional */}
      <div className="banner-container">
        <div className="banner-promocao">
          🔥 <strong>Oferta do Dia:</strong> Entrega Grátis acima de R$ 50!
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="lista-produtos">
        <h2 className="titulo-secao">{categoriaAtiva}</h2>

        {produtosFiltrados.length === 0 ? (
          <p className="aviso-vazio">Nenhum produto nesta categoria.</p>
        ) : (
          produtosFiltrados.map(produto => (
            <div 
              key={produto.id} 
              className="produto-card"
              onClick={() => navigate(`/produto/${produto.id}`)}
            >
              <div className="produto-info">
                <h3 className="produto-nome">{produto.nome}</h3>
                <p className="produto-desc">{produto.descricao}</p>
                <p className="produto-preco">
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="produto-img-wrapper">
                 <img src={produto.imagem} alt={produto.nome} className="produto-img" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Barra de Carrinho Flutuante (Rodapé) */}
      <BarraCarrinho />

    </div>
  );
};

export default Home;