import React, { useState, useEffect } from 'react';
import './Cozinha.css';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getCountFromServer } from 'firebase/firestore';

// --- COMPONENTE DO BADGE (Fidelidade) ---
const BadgeFidelidade = ({ telefone }) => {
  const [totalPedidos, setTotalPedidos] = useState(null);

  useEffect(() => {
    async function contar() {
      if (!telefone) return;
      // Conta quantos pedidos esse telefone já fez
      const q = query(collection(db, "pedidos"), where("telefone", "==", telefone));
      try {
        const snapshot = await getCountFromServer(q);
        setTotalPedidos(snapshot.data().count);
      } catch (error) {
        console.error("Erro ao contar:", error);
        setTotalPedidos(0);
      }
    }
    contar();
  }, [telefone]);

  if (totalPedidos === null) return <span className="badge-loading">...</span>;

  const estilo = totalPedidos === 1 ? 'badge-novo' : 'badge-fiel';
  const texto = totalPedidos === 1 ? '🌟 1º Pedido' : `🏆 ${totalPedidos}º Pedido`;

  return <span className={`badge-cliente ${estilo}`}>{texto}</span>;
};

// --- PÁGINA DA COZINHA ---
const Cozinha = () => {
  const [estaLogado, setEstaLogado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const [pedidos, setPedidos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('pendentes');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  // Login automático
  useEffect(() => {
    const loginSalvo = localStorage.getItem('cozinhaLogada');
    if (loginSalvo === 'sim') setEstaLogado(true);
  }, []);

  // Monitoramento em Tempo Real
  useEffect(() => {
    if (!estaLogado) return;

    // MUDANÇA 1: Ordenar por 'asc' (Mais antigos primeiro)
    // Isso garante a fila correta: quem pediu primeiro aparece no topo
    const q = query(collection(db, "pedidos"), orderBy("data_timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPedidos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [estaLogado]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (senhaInput === 'ney123') {
      setEstaLogado(true);
      localStorage.setItem('cozinhaLogada', 'sim');
      setErroSenha('');
    } else {
      setErroSenha('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setEstaLogado(false);
    localStorage.removeItem('cozinhaLogada');
  };

  const concluirPedido = async (id) => {
    if(window.confirm("Confirmar que o pedido está pronto?")) {
        await updateDoc(doc(db, "pedidos", id), { status: "Concluido" });
    }
  };

  const imprimirPedidoIndividual = () => window.print();
  const imprimirRelatorio = () => window.print();

  // Filtros do Histórico
  const filtrarPedidosHistorico = () => {
    // Pegamos apenas os concluídos
    let lista = pedidos.filter(p => p.status === 'Concluido'); 
    
    // Filtro de Data
    const hoje = new Date().toLocaleDateString();
    if (filtroPeriodo === 'hoje') {
        lista = lista.filter(p => p.data.includes(hoje));
    } else if (filtroPeriodo === 'data' && dataSelecionada) {
      const [ano, mes, dia] = dataSelecionada.split('-');
      lista = lista.filter(p => p.data.includes(`${dia}/${mes}/${ano}`));
    }
    
    // MUDANÇA 2: Inverter a ordem no histórico (Mostra o último concluído no topo)
    // Como a lista original está 'asc' (antigo->novo), o reverse() deixa 'novo->antigo'
    return lista.reverse();
  };

  const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente');
  const historicoFiltrado = filtrarPedidosHistorico();
  const totalFaturamento = historicoFiltrado.reduce((acc, curr) => acc + curr.total, 0);

  // Tela de Login
  if (!estaLogado) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>🔒 Acesso Cozinha</h2>
          <form onSubmit={handleLogin}>
            <input 
                type="password" 
                placeholder="Senha" 
                value={senhaInput} 
                onChange={(e) => setSenhaInput(e.target.value)} 
                autoFocus 
            />
            <button type="submit">Entrar</button>
          </form>
          {erroSenha && <p className="msg-erro">{erroSenha}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="cozinha-container">
      <header className="cozinha-header no-print">
        <div className="titulo-logout">
            <h1>👨‍🍳 Fila de Pedidos</h1>
            <button onClick={handleLogout} className="btn-sair">Sair 🚪</button>
        </div>
        <div className="abas-controle">
          <button className={abaAtiva === 'pendentes' ? 'aba-btn ativa' : 'aba-btn'} onClick={() => setAbaAtiva('pendentes')}>
            🔥 Fila ({pedidosPendentes.length})
          </button>
          <button className={abaAtiva === 'historico' ? 'aba-btn ativa' : 'aba-btn'} onClick={() => setAbaAtiva('historico')}>
            📊 Histórico
          </button>
        </div>
      </header>

      {/* --- ABA DE PEDIDOS PENDENTES --- */}
      {abaAtiva === 'pendentes' && (
        <div className="tela-cozinha">
          <div className="lista-pedidos-cozinha">
            {pedidosPendentes.length === 0 ? <div className="aviso-vazio">✅ Tudo limpo! Aguardando novos pedidos...</div> : 
              pedidosPendentes.map(pedido => (
                <div key={pedido.id} className="card-pedido-cozinha">
                  <div className="pedido-header">
                    <h3>#{pedido.id.slice(-4)}</h3> 
                    <span className="hora-pedido">🕒 {pedido.data.split(' ')[1]}</span>
                  </div>
                  
                  <div className="pedido-info-cliente">
                    <p className="cliente-nome">
                        👤 {pedido.cliente} <BadgeFidelidade telefone={pedido.telefone} />
                    </p>
                    <p className="cliente-fone">📞 {pedido.telefone}</p>
                    <p className="cliente-end">📍 {pedido.endereco}</p>
                    <p className="cliente-pag">💰 {pedido.pagamento}</p>
                  </div>
                  <hr />
                  
                  <ul className="pedido-itens-lista">
                    {pedido.itens.map((item, idx) => (
                      <li key={idx}><strong>{item.quantidade}x</strong> {item.nome} {item.obs && <small>({item.obs})</small>}</li>
                    ))}
                  </ul>

                  <div className="total-comanda">
                    Total: R$ {pedido.total.toFixed(2)}
                  </div>

                  <div className="pedido-acoes no-print">
                    <button className="btn-imprimir" onClick={imprimirPedidoIndividual}>🖨️ Imprimir</button>
                    <button className="btn-concluir" onClick={() => concluirPedido(pedido.id)}>✅ Pronto / Entregue</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* --- ABA DE HISTÓRICO (ATUALIZADA) --- */}
      {abaAtiva === 'historico' && (
        <div className="tela-historico">
            <div className="filtros-box no-print">
                <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                    <option value="hoje">Hoje</option>
                    <option value="data">Data Específica</option>
                </select>
                {filtroPeriodo === 'data' && <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />}
                <button className="btn-imprimir-relatorio" onClick={imprimirRelatorio}>🖨️ Imprimir Relatório</button>
            </div>
            
            <div className="area-relatorio-print">
                 <div className="cabecalho-relatorio"><h2>Relatório de Vendas</h2></div>
                 
                 <div className="resumo-cards">
                    <div className="card-resumo"><span>Pedidos Concluídos</span><strong>{historicoFiltrado.length}</strong></div>
                    <div className="card-resumo destaque"><span>Faturamento Total</span><strong>R$ {totalFaturamento.toFixed(2).replace('.', ',')}</strong></div>
                 </div>

                 {/* TABELA COM NOVAS COLUNAS */}
                 <table className="tabela-historico">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Endereço</th> 
                            <th>Pagamento</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historicoFiltrado.map(p => (
                            <tr key={p.id}>
                                <td>{p.data.split(' ')[1]}</td>
                                <td>{p.cliente}</td>
                                <td style={{fontSize: '0.85rem'}}>{p.endereco}</td> 
                                <td style={{fontSize: '0.85rem'}}>{p.pagamento}</td>
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