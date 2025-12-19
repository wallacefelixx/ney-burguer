import React, { useState } from 'react';
import { cardapio } from '../data/cardapio';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Balcao.css';

const Balcao = () => {
  const navigate = useNavigate();
  const [carrinho, setCarrinho] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [pagamento, setPagamento] = useState('Dinheiro');

  // Adiciona item ao carrinho local
  const adicionarItem = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);
    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id ? { ...item, quantidade: item.quantidade + 1, total: (item.quantidade + 1) * item.preco } : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1, obs: '', total: produto.preco }]);
    }
  };

  // Remove item
  const removerItem = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const totalGeral = carrinho.reduce((acc, item) => acc + item.total, 0);

  const finalizarPedidoBalcao = async () => {
    if (carrinho.length === 0 || !nomeCliente.trim()) {
      alert("Preencha o nome do cliente e adicione itens.");
      return;
    }

    const payload = {
      cliente: nomeCliente,
      telefone: 'Balcão', // Identificador fixo
      endereco: 'RETIRADA NO BALCÃO', // Para ficar claro
      itens: carrinho,
      total: totalGeral,
      pagamento: pagamento,
      status: 'Pendente',
      data_timestamp: serverTimestamp(),
      data: new Date().toLocaleString('pt-BR'),
      tipoEntrega: 'Retirada' // <--- AQUI ESTÁ O SEGREDO
    };

    try {
      await addDoc(collection(db, "pedidos"), payload);
      alert("Pedido enviado para a cozinha! 👨‍🍳");
      setCarrinho([]);
      setNomeCliente('');
    } catch (error) {
      alert("Erro ao lançar pedido.");
    }
  };

  return (
    <div className="balcao-container">
      {/* LADO ESQUERDO: CARDÁPIO RÁPIDO */}
      <div className="balcao-menu">
        <h2>🖥️ Terminal de Vendas</h2>
        <div className="grid-produtos-balcao">
          {cardapio.map(prod => (
            <button key={prod.id} className="btn-prod-balcao" onClick={() => adicionarItem(prod)}>
              <strong>{prod.nome}</strong>
              <span>R$ {prod.preco.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* LADO DIREITO: RESUMO DO PEDIDO */}
      <div className="balcao-carrinho">
        <h3>📝 Novo Pedido</h3>
        <input 
          type="text" 
          placeholder="Nome do Cliente (Mesa ou Senha)" 
          className="input-balcao"
          value={nomeCliente}
          onChange={e => setNomeCliente(e.target.value)}
        />
        
        <div className="lista-itens-balcao">
          {carrinho.map(item => (
            <div key={item.id} className="item-balcao">
              <span>{item.quantidade}x {item.nome}</span>
              <button onClick={() => removerItem(item.id)}>🗑️</button>
            </div>
          ))}
        </div>

        <div className="balcao-footer">
          <div className="total-balcao">Total: R$ {totalGeral.toFixed(2)}</div>
          
          <select value={pagamento} onChange={e => setPagamento(e.target.value)} className="select-balcao">
            <option value="Dinheiro">Dinheiro</option>
            <option value="Débito">Débito</option>
            <option value="Crédito">Crédito</option>
            <option value="PIX">PIX</option>
          </select>

          <button className="btn-lancar" onClick={finalizarPedidoBalcao}>
            LANÇAR PEDIDO 🚀
          </button>
          
          <button className="btn-voltar-cozinha" onClick={() => navigate('/cozinha')}>
            Ir para Cozinha
          </button>
        </div>
      </div>
    </div>
  );
};

export default Balcao;