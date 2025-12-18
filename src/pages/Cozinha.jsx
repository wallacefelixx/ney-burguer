import React, { useState, useEffect } from 'react';
import './Cozinha.css';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Cozinha = () => {
  // --- ESTADOS DE LOGIN ---
  const [estaLogado, setEstaLogado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  // --- ESTADOS DA COZINHA ---
  const [pedidos, setPedidos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('pendentes');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  // 1. Verifica se já logou antes (ao abrir a tela)
  useEffect(() => {
    const loginSalvo = localStorage.getItem('cozinhaLogada');
    if (loginSalvo === 'sim') {
      setEstaLogado(true);
    }
  }, []);

  // 2. Carrega os pedidos SOMENTE se estiver logado
  useEffect(() => {
    if (!estaLogado) return; // Se não tá logado, nem conecta no Firebase

    const q = query(collection(db, "pedidos"), orderBy("data_timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaPedidos = [];
      querySnapshot.forEach((doc) => {
        listaPedidos.push({ id: doc.id, ...doc.data() });
      });
      setPedidos(listaPedidos);
    });

    return () => unsubscribe();
  }, [estaLogado]);

  // --- FUNÇÃO DE LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    // A SENHA DEFINIDA É "ney123" (Você pode mudar aqui)
    if (senhaInput === 'ney123') {
      setEstaLogado(true);
      localStorage.setItem('cozinhaLogada', 'sim'); // Salva para não pedir de novo
      setErroSenha('');
    } else {
      setErroSenha('Senha incorreta! Tente novamente.');
    }
  };

  const handleLogout = () => {
    setEstaLogado(false);
    localStorage.removeItem('cozinhaLogada');
  };

  // ... (Funções de concluir, imprimir e filtrar continuam iguais) ...
  const concluirPedido = async (id) => {
    const pedidoRef = doc(db, "pedidos", id);
    await updateDoc(pedidoRef, { status: "Concluido" });
  };

  const imprimirPedidoIndividual = () => window.print();
  const imprimirRelatorio = () => window.print();

  const filtrarPedidosHistorico = () => {
    let lista = pedidos.filter(p => p.status === 'Concluido'); 
    const hoje = new Date().toLocaleDateString();
    if (filtroPeriodo === 'hoje') lista = lista.filter(p => p.data.includes(hoje));
    else if (filtroPeriodo === 'data' && dataSelecionada) {
      const [ano, mes, dia] = dataSelecionada.split('-');
      lista = lista.filter(p => p.data.includes(`${dia}/${mes}/${ano}`));
    }
    return lista;
  };

  const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente');
  const historicoFiltrado = filtrarPedidosHistorico();
  const totalFaturamento = historicoFiltrado.reduce((acc, curr) => acc + curr.total, 0);

  // --- TELA DE BLOQUEIO (RENDERIZAÇÃO CONDICIONAL) ---
  if (!estaLogado) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>🔒 Acesso Restrito</h2>
          <p>Área exclusiva da cozinha</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Digite a senha..." 
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

  // --- TELA DA COZINHA (Igual a anterior, só adicionei o botão de Sair) ---
  return (
    <div className="cozinha-container">
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

      {/* Conteúdo das Abas (Exatamente igual ao código anterior) */}
      {abaAtiva === 'pendentes' && (
        <div className="tela-cozinha">
          <div className="lista-pedidos-cozinha">
            {pedidosPendentes.length === 0 ? <p className="aviso-vazio">Sem pedidos pendentes...</p> : 
              pedidosPendentes.map(pedido => (
                <div key={pedido.id} className="card-pedido-cozinha">
                  <div className="pedido-header">
                    <h3>#{pedido.id.slice(-4)}</h3> 
                    <span>{pedido.data.split(' ')[1]}</span>
                  </div>
                  <div className="pedido-tipo-entrega">{pedido.tipoEntrega}</div>
                  <div className="pedido-info-cliente">
                    <p><strong>End:</strong> {pedido.endereco}</p>
                    <p><strong>Pag:</strong> {pedido.pagamento}</p>
                  </div>
                  <ul className="pedido-itens-lista">
                    {pedido.itens.map((item, idx) => (
                      <li key={idx}><strong>{item.quantidade}x</strong> {item.nome} {item.obs && <small>({item.obs})</small>}</li>
                    ))}
                  </ul>
                  <div className="pedido-acoes no-print">
                    <button className="btn-imprimir" onClick={imprimirPedidoIndividual}>🖨️</button>
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
            {/* ... (Seu código de histórico anterior continua aqui igualzinho) ... */}
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
                 <div className="cabecalho-relatorio"><h2>Relatório Financeiro</h2></div>
                 <div className="resumo-cards">
                    <div className="card-resumo"><span>Qtd</span><strong>{historicoFiltrado.length}</strong></div>
                    <div className="card-resumo destaque"><span>Total</span><strong>R$ {totalFaturamento.toFixed(2).replace('.', ',')}</strong></div>
                 </div>
                 <table className="tabela-historico">
                    <thead><tr><th>Data</th><th>Tipo</th><th>Total</th></tr></thead>
                    <tbody>
                        {historicoFiltrado.map(p => (
                            <tr key={p.id}><td>{p.data}</td><td>{p.tipoEntrega}</td><td>R$ {p.total.toFixed(2)}</td></tr>
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