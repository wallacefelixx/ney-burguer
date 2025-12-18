import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeusPedidos.css';
// Importações do Firebase
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarMeusPedidos = async () => {
      // 1. Pega os IDs que salvamos no localStorage na hora da compra
      const idsSalvos = JSON.parse(localStorage.getItem('meusPedidosIds')) || [];
      
      if (idsSalvos.length === 0) return;

      const listaTemp = [];
      
      // 2. Busca cada pedido no Firebase para saber o status atual (Pendente ou Concluido)
      for (const id of idsSalvos) {
        try {
          const docRef = doc(db, "pedidos", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            listaTemp.push({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.log("Pedido antigo não encontrado ou erro de rede:", id);
        }
      }
      
      // 3. Ordena do mais novo para o mais velho
      setPedidos(listaTemp.sort((a,b) => b.data_timestamp - a.data_timestamp));
    };

    carregarMeusPedidos();
    
    // Atualiza a cada 5 segundos para ver se o status mudou para "Saiu para Entrega"
    const intervalo = setInterval(carregarMeusPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="meus-pedidos-container">
      <header className="header-pedidos">
        <button className="btn-voltar-pedidos" onClick={() => navigate('/')}>
          ← Voltar
        </button>
        <h1>Meus Pedidos</h1>
      </header>

      <div className="lista-meus-pedidos">
        {pedidos.length === 0 ? (
          <div className="sem-pedidos">
            <p>Você ainda não fez nenhum pedido.</p>
            <button onClick={() => navigate('/')}>Fazer pedido agora</button>
          </div>
        ) : (
          pedidos.map(pedido => (
            <div key={pedido.id} className="card-meu-pedido">
              <div className="pedido-topo">
                <span className="pedido-id">#{pedido.id.slice(-4)}</span>
                <span className="pedido-data">{pedido.data}</span>
              </div>

              <div className="pedido-status-box">
                <span className={`status-badge ${pedido.status.toLowerCase()}`}>
                  {pedido.status === 'Pendente' ? '🕒 Preparando' : '✅ Pronto / Saiu'}
                </span>
                <span className="tipo-entrega">{pedido.tipoEntrega}</span>
              </div>

              <ul className="itens-resumo">
                {pedido.itens.map((item, idx) => (
                  <li key={idx}>
                    {item.quantidade}x {item.nome}
                  </li>
                ))}
              </ul>

              <div className="pedido-total-row">
                <span>Total:</span>
                <strong>R$ {pedido.total.toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeusPedidos;