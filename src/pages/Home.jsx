import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardapio } from '../data/menu';
import './Home.css';
import BarraCarrinho from '../components/BarraCarrinho';

const Home = () => {
  const navigate = useNavigate();
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  
  const categorias = ["Todas", "Tradicionais", "Artesanais", "Pizzas", "Bebidas", "Combos"];

  const produtosFiltrados = categoriaAtiva === 'Todas' 
    ? cardapio 
    : cardapio.filter(p => p.categoria === categoriaAtiva);

  return (
    <div>
      {/* Cabeçalho */}
       <header className="header">
            <div className="topo-header">
              <div className="marca-box">
                <span className="logo-texto">Ney Burguer</span>
              </div>
              
              {/* Link para Meus Pedidos */}
              <button className="btn-meus-pedidos" onClick={() => navigate('/pedidos')}>
                🕒 Pedidos
              </button>
            </div>
        
        {/* Categorias coladas no header */}
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

      {/* Banner */}
      <div className="banner-container">
        <div className="banner-promocao">
          🔥 Mega Descontão 🔥
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="lista-produtos">
        <h2 className="titulo-secao">{categoriaAtiva}</h2>

        {produtosFiltrados.map(produto => (
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

            <img src={produto.imagem} alt={produto.nome} className="produto-img" />
          </div>
        ))}
      </div>

      <BarraCarrinho />

    </div>
  );
};

export default Home;