import React, { useState, useEffect } from 'react';
import './Cozinha.css';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getCountFromServer } from 'firebase/firestore';

// --- COMPONENTE DO BADGE (Fica aqui fora mesmo) ---
const BadgeFidelidade = ({ telefone }) => {
  const [totalPedidos, setTotalPedidos] = useState(null);

  useEffect(() => {
    async function contar() {
      if (!telefone) return;
      const q = query(collection(db, "pedidos"), where("telefone", "==", telefone));
      try {
        const snapshot = await getCountFromServer(q);
        setTotalPedidos(snapshot.data().count);
      } catch (error) {
        setTotalPedidos(0);
      }
    }
    contar();
  }, [telefone]);

  if (totalPedidos === null) return <span className="badge-loading">...</span>;

  const estilo = totalPedidos === 1 ? 'badge-novo' : 'badge-fiel';
  const texto = totalPedidos === 1 ? '🌟 1º' : `🏆 ${totalPedidos}º`;
  return <span className={`badge-cliente ${estilo}`}>{texto}</span>;
};

// --- COMPONENTE PRINCIPAL ---
const Cozinha = () => {
  const [estaLogado, setEstaLogado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('pendentes');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  // Estado para controlar qual pedido está sendo impresso
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState(null);

  useEffect(() => {
    const loginSalvo = localStorage.getItem('cozinhaLogada');
    if (loginSalvo === 'sim') setEstaLogado(true);
  }, []);

  useEffect(() => {
    if (!estaLogado) return;
    // Ordena por 'asc' (Antigos primeiro -> FIFO)
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

  // Função para imprimir cupom individual
  const handleImprimir = (pedido) => {
    setPedidoParaImprimir(pedido);
    // Pequeno delay para o React renderizar o cupom antes de abrir a janela de print
    setTimeout(() => {
        window.print();
        setPedidoParaImprimir(null); // Limpa após fechar a janela de impressão
    }, 500);
  };

  const imprimirRelatorio = () => window.print();

  const filtrarPedidosHistorico = () => {
    let lista = pedidos.filter(p => p.status === 'Concluido'); 
    const hoje = new Date().toLocaleDateString();
    if (filtroPeriodo === 'hoje') lista = lista.filter(p => p.data.includes(hoje));
    else if (filtroPeriodo === 'data' && dataSelecionada) {
      const [ano, mes, dia] = dataSelecionada.split('-');
      lista = lista.filter(p => p.data.includes(`${dia}/${mes}/${ano}`));
    }
    // Inverte para mostrar o último concluído no topo da lista
    return lista.reverse();
  };

  const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente');
  const historicoFiltrado = filtrarPedidosHistorico();
  const totalFaturamento = historicoFiltrado.reduce((acc, curr) => acc + curr.total, 0);

  if (!estaLogado) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>🔒 Cozinha</h2>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Senha" value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)} autoFocus />
            <button type="submit">Entrar</button>
          </form>
          {erroSenha && <p className="msg-erro">{erroSenha}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="cozinha-container">
      
      {/* --- ÁREA INVISÍVEL DE IMPRESSÃO (CUPOM FISCAL) --- */}
      {pedidoParaImprimir && (
        <div className="area-cupom-print">
            <div className="cupom-header">
                <h2>NEY BURGUER</h2>
                <p>================================</p>
                <p>PEDIDO #{pedidoParaImprimir.id.slice(-4)}</p>
                <p>{pedidoParaImprimir.data}</p>
                <p>================================</p>
            </div>
            <div className="cupom-cliente">
                <p><strong>Cliente:</strong> {pedidoParaImprimir.cliente}</p>
                <p><strong>Fone:</strong> {pedidoParaImprimir.telefone}</p>
                <p><strong>Endereço:</strong> {pedidoParaImprimir.endereco}</p>
                <p><strong>Pagamento:</strong> {pedidoParaImprimir.pagamento}</p>
            </div>
            <p>--------------------------------</p>
            <div className="cupom-itens">
                {pedidoParaImprimir.itens.map((item, idx) => (
                    <div key={idx} style={{marginBottom: '5px'}}>
                        <div>{item.quantidade}x {item.nome}</div>
                        {item.obs && <small>{'>>'} {item.obs}</small>}
                        <div style={{textAlign: 'right'}}>R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                    </div>
                ))}
            </div>
            <p>--------------------------------</p>
            <div className="cupom-total">
                <h3>TOTAL: R$ {pedidoParaImprimir.total.toFixed(2)}</h3>
            </div>
             <p>================================</p>
             <p style={{textAlign:'center'}}>Obrigado pela preferência!</p>
        </div>
      )}

      {/* --- CABEÇALHO DO SITE --- */}
      <header className="cozinha-header no-print">
        <div className="titulo-logout">
            <h1>👨‍🍳 Gestão Ney Burguer</h1>
            <button onClick={handleLogout} className="btn-sair">Sair 🚪</button>
        </div>
        <div className="abas-controle">
          <button className={abaAtiva === 'pendentes' ? 'aba-btn ativa' : 'aba-btn'} onClick={() => setAbaAtiva('pendentes')}>
            🔥 Pendentes ({pedidosPendentes.length})
          </button>
          <button className={abaAtiva === 'historico' ? 'aba-btn ativa' : 'aba-btn'} onClick={() => setAbaAtiva('historico')}>
            📊 Histórico
          </button>
        </div>
      </header>

      {abaAtiva === 'pendentes' && (
        <div className="tela-cozinha no-print">
          <div className="lista-pedidos-cozinha">
            {pedidosPendentes.length === 0 ? <p className="aviso-vazio">Sem pedidos pendentes...</p> : 
              pedidosPendentes.map(pedido => (
                <div key={pedido.id} className="card-pedido-cozinha">
                  <div className="pedido-header">
                    <h3>#{pedido.id.slice(-4)}</h3> 
                    <span className="hora-pedido">{pedido.data.split(' ')[1]}</span>
                  </div>
                  
                  <div className="pedido-info-cliente">
                    <p className="cliente-nome">
                        👤 {pedido.cliente} 
                        <BadgeFidelidade telefone={pedido.telefone} />
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

                  <div className="pedido-acoes">
                    <button className="btn-imprimir" onClick={() => handleImprimir(pedido)}>🖨️ Imprimir</button>
                    <button className="btn-concluir" onClick={() => concluirPedido(pedido.id)}>✅ Pronto</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {abaAtiva === 'historico' && (
        <div className="tela-historico">
            <div className="filtros-box no-print">
                <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                    <option value="hoje">Hoje</option>
                    <option value="data">Data</option>
                </select>
                {filtroPeriodo === 'data' && <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />}
                <button className="btn-imprimir-relatorio" onClick={imprimirRelatorio}>Relatório</button>
            </div>
            <div className="area-relatorio-print">
                 <div className="cabecalho-relatorio"><h2>Relatório de Vendas</h2></div>
                 <div className="resumo-cards">
                    <div className="card-resumo"><span>Pedidos</span><strong>{historicoFiltrado.length}</strong></div>
                    <div className="card-resumo destaque"><span>Faturamento</span><strong>R$ {totalFaturamento.toFixed(2).replace('.', ',')}</strong></div>
                 </div>
                 <table className="tabela-historico">
                    <thead><tr><th>Hora</th><th>Cliente</th><th>Total</th></tr></thead>
                    <tbody>
                        {historicoFiltrado.map(p => (
                            <tr key={p.id}>
                                <td>{p.data.split(' ')[1]}</td>
                                <td>{p.cliente}</td>
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