import React, { useState } from 'react';
import './MeusPedidos.css';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const MeusPedidos = () => {
  const [telefoneInput, setTelefoneInput] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false); // Controla se já clicou em buscar

  // Mesma máscara do carrinho para garantir que a busca bata com o banco
  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    setTelefoneInput(value);
  };

  const buscarPedidos = async (e) => {
    e.preventDefault();
    
    if (telefoneInput.length < 14) {
      alert("Por favor, digite o número completo com DDD.");
      return;
    }

    setLoading(true);
    setPedidos([]); // Limpa lista anterior
    setBuscou(false);

    try {
      // Busca no banco onde o campo 'telefone' é igual ao digitado
      const q = query(
        collection(db, "pedidos"),
        where("telefone", "==", telefoneInput)
      );

      const querySnapshot = await getDocs(q);
      const lista = [];
      
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });

      // Ordena do mais recente para o mais antigo (manual para evitar erro de índice)
      lista.sort((a, b) => {
         // Se tiver timestamp, usa ele, senão usa string (fallback)
         const dateA = a.data_timestamp ? a.data_timestamp.seconds : 0;
         const dateB = b.data_timestamp ? b.data_timestamp.seconds : 0;
         return dateB - dateA;
      });

      setPedidos(lista);
      setBuscou(true); // Marca que a busca terminou
    } catch (error) {
      console.error("Erro ao buscar:", error);
      alert("Ocorreu um erro ao buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para definir a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente': return 'status-pendente';
      case 'Concluido': return 'status-concluido';
      default: return '';
    }
  };

  return (
    <div className="meus-pedidos-container">
      <h2 className="titulo-rastreio">📦 Rastrear Pedidos</h2>
      <p className="subtitulo-rastreio">Digite seu WhatsApp para ver o histórico e status.</p>

      {/* Área de Busca */}
      <form onSubmit={buscarPedidos} className="search-box">
        <input 
          type="tel" 
          placeholder="(37) 99999-9999" 
          value={telefoneInput}
          onChange={handleTelefoneChange}
          maxLength="15"
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : '🔍 Buscar'}
        </button>
      </form>

      {/* Resultados */}
      <div className="lista-resultados">
        
        {/* Caso não ache nada após buscar */}
        {buscou && pedidos.length === 0 && (
          <div className="msg-vazio">
            <h3>Nenhum pedido encontrado!</h3>
            <p>Verifique se o número está correto ou faça seu primeiro pedido.</p>
            <Link to="/" className="btn-voltar-home">Ir para o Cardápio</Link>
          </div>
        )}

        {/* Lista de Pedidos */}
        {pedidos.map(pedido => (
          <div key={pedido.id} className="card-pedido-cliente">
            <div className="card-header">
              <span className="data-pedido">📅 {pedido.data}</span>
              <span className={`status-badge ${getStatusColor(pedido.status)}`}>
                {pedido.status === 'Pendente' ? '⏳ Preparando' : '✅ Pronto / Saiu'}
              </span>
            </div>
            
            <div className="card-resumo-itens">
              {pedido.itens.map((item, idx) => (
                <p key={idx}>• {item.quantidade}x {item.nome}</p>
              ))}
            </div>
            
            <div className="card-footer">
              <strong>Total: R$ {pedido.total.toFixed(2)}</strong>
              <small>Pagamento: {pedido.pagamento}</small>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default MeusPedidos;