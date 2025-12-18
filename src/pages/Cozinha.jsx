import React, { useState, useEffect } from 'react';
import './Cozinha.css';
// Importações do Firebase
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Cozinha = () => {
  const [pedidos, setPedidos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('pendentes');
  
  // Estados do Filtro
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Cria a consulta: Buscar na coleção "pedidos", ordenado por data (mais recente primeiro)
    const q = query(collection(db, "pedidos"), orderBy("data_timestamp", "desc"));

    // LIGA O MONITORAMENTO EM TEMPO REAL
    // Assim que cair um pedido no Firebase, essa função roda sozinha
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaPedidos = [];
      querySnapshot.forEach((doc) => {
        // Junta o ID do documento com os dados dele
        listaPedidos.push({ id: doc.id, ...doc.data() });
      });
      setPedidos(listaPedidos);
    });

    // Desliga o monitoramento se sair da tela (para não pesar o pc)
    return () => unsubscribe();
  }, []);

  const concluirPedido = async (id) => {
    // Atualiza o status no Firebase para "Concluido"
    const pedidoRef = doc(db, "pedidos", id);
    await updateDoc(pedidoRef, {
      status: "Concluido"
    });
    // O onSnapshot vai atualizar a tela automaticamente
  };

  const imprimirPedidoIndividual = () => {
    window.print();
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  // --- LÓGICA DE FILTROS ---
  const filtrarPedidosHistorico = () => {
    let lista = pedidos.filter(p => p.status === 'Concluido'); 
    const hoje = new Date().toLocaleDateString();

    if (filtroPeriodo === 'hoje') {
      lista = lista.filter(p => p.data.includes(hoje));
    } 
    else if (filtroPeriodo === 'data' && dataSelecionada) {
      const [ano, mes, dia] = dataSelecionada.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;
      lista = lista.filter(p => p.data.includes(dataFormatada));
    }
    
    return lista;
  };

  const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente');
  const historicoFiltrado = filtrarPedidosHistorico();
  const totalFaturamento = historicoFiltrado.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="cozinha-container">
      <header className="cozinha-header no-print">
        <h1>👨‍🍳 Gestão Ney Burguer (Online)</h1>
        <div className="abas-controle">
          <button 
            className={abaAtiva === 'pendentes' ? 'aba-btn ativa' : 'aba-btn'} 
            onClick={() => setAbaAtiva('pendentes')}
          >
            🔥 Pendentes ({pedidosPendentes.length})
          </button>
          <button 
            className={abaAtiva === 'historico' ? 'aba-btn ativa' : 'aba-btn'} 
            onClick={() => setAbaAtiva('historico')}
          >
            📊 Histórico
          </button>
        </div>
      </header>

      {/* --- TELA 1: PEDIDOS PENDENTES --- */}
      {abaAtiva === 'pendentes' && (
        <div className="tela-cozinha">
          <div className="lista-pedidos-cozinha">
            {pedidosPendentes.length === 0 ? (
              <p className="aviso-vazio">Aguardando novos pedidos...</p>
            ) : (
              pedidosPendentes.map(pedido => (
                <div key={pedido.id} className="card-pedido-cozinha">
                  <div className="pedido-header">
                    {/* Mostra os últimos 4 caracteres do ID do Firebase */}
                    <h3>#{pedido.id.slice(-4)}</h3> 
                    <span>{pedido.data.split(' ')[1]}</span>
                  </div>
                  
                  <div className="pedido-tipo-entrega">
                    {pedido.tipoEntrega === 'Entrega' ? '🛵 ENTREGA' : 'bag RETIRADA'}
                  </div>

                  <div className="pedido-info-cliente">
                    <p><strong>End:</strong> {pedido.endereco}</p>
                    <p><strong>Pag:</strong> {pedido.pagamento}</p>
                  </div>

                  <ul className="pedido-itens-lista">
                    {pedido.itens.map((item, idx) => (
                      <li key={idx}>
                        <strong>{item.quantidade}x</strong> {item.nome}
                        {item.obs && <small className="obs-destaque"> ({item.obs})</small>}
                      </li>
                    ))}
                  </ul>

                  <div className="pedido-acoes no-print">
                    <button className="btn-imprimir" onClick={imprimirPedidoIndividual}>🖨️ Imprimir</button>
                    <button className="btn-concluir" onClick={() => concluirPedido(pedido.id)}>✅ Pronto</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TELA 2: HISTÓRICO --- */}
      {abaAtiva === 'historico' && (
        <div className="tela-historico">
          <div className="filtros-box no-print">
            <label>Filtrar:</label>
            <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
              <option value="hoje">Hoje</option>
              <option value="data">Data Específica</option>
            </select>
            {filtroPeriodo === 'data' && (
              <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
            )}
            <button className="btn-imprimir-relatorio" onClick={imprimirRelatorio}>🖨️ Imprimir</button>
          </div>

          <div className="area-relatorio-print">
            <div className="cabecalho-relatorio">
              <h2>Relatório de Vendas</h2>
              <p>Período: {filtroPeriodo}</p>
            </div>
            <div className="resumo-cards">
              <div className="card-resumo"><span>Pedidos</span><strong>{historicoFiltrado.length}</strong></div>
              <div className="card-resumo destaque"><span>Total</span><strong>R$ {totalFaturamento.toFixed(2).replace('.', ',')}</strong></div>
            </div>
            
            <table className="tabela-historico">
              <thead><tr><th>Data</th><th>Tipo</th><th>Itens</th><th>Valor</th></tr></thead>
              <tbody>
                {historicoFiltrado.map(p => (
                  <tr key={p.id}>
                    <td>{p.data}</td>
                    <td>{p.tipoEntrega}</td>
                    <td>{p.itens.length} itens</td>
                    <td>R$ {p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cozinha;