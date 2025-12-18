import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './Carrinho.css';
// Importa o banco do Firebase
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore'; 

const Carrinho = () => {
  const { cartItems, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();
  
  const [tipoEntrega, setTipoEntrega] = useState('');
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState('Pix');
  const [loading, setLoading] = useState(false); // Para mostrar "Enviando..."

  const finalizarPedido = async () => {
    if (cartItems.length === 0) return;
    if (!tipoEntrega) { alert('Selecione Entrega ou Retirada!'); return; }
    if (tipoEntrega === 'Entrega' && !endereco) { alert('Digite o endereço!'); return; }

    setLoading(true); // Bloqueia o botão

    try {
      // Cria o objeto do pedido
      const novoPedido = {
        // Não precisa gerar ID manual, o Firebase cria um ID único seguro
        cliente: "Cliente Web",
        tipoEntrega,
        endereco: tipoEntrega === 'Entrega' ? endereco : 'Retirada no Balcão',
        pagamento,
        itens: cartItems,
        total: cartTotal,
        data: new Date().toLocaleString(), // Data legível
        data_timestamp: new Date(), // Data para ordenar corretamente depois
        status: 'Pendente'
      };

      // --- MUDANÇA AQUI: SALVA NO FIREBASE ---
      const docRef = await addDoc(collection(db, "pedidos"), novoPedido);
      
      // Salva o ID do pedido no localStorage APENAS para o cliente rastrear depois
      const meusPedidosIds = JSON.parse(localStorage.getItem('meusPedidosIds')) || [];
      meusPedidosIds.push(docRef.id);
      localStorage.setItem('meusPedidosIds', JSON.stringify(meusPedidosIds));

      alert("Pedido enviado com sucesso! Acompanhe na tela de Pedidos.");
      window.location.href = "/pedidos"; // Manda direto pro rastreio
      
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ... (O Restante do Return é igual, só mude o botão final para:) ...
  
  /* <button className="btn-finalizar" onClick={finalizarPedido} disabled={loading}>
     {loading ? "Enviando..." : "Confirmar Pedido 👨‍🍳"}
  </button>
  */
 
  // Vou colocar o return completo pra facilitar, ok?
  return (
    <div className="carrinho-container">
      <button className="btn-voltar-carrinho" onClick={() => navigate('/')}>← Voltar</button>
      <h1 className="titulo-carrinho">Meu Pedido</h1>

      {cartItems.length === 0 ? (
        <div className="carrinho-vazio"><p>Sacola vazia 😢</p></div>
      ) : (
        <>
          <div className="lista-itens">
            {cartItems.map((item) => (
              <div key={item.id + item.obs} className="item-carrinho">
                <div className="item-info">
                  <h4>{item.quantidade}x {item.nome}</h4>
                  {item.obs && <p className="item-obs">{item.obs}</p>}
                </div>
                <div className="item-preco">R$ {item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="form-entrega">
            <h3>Entrega</h3>
            <div className="opcoes-entrega">
               <button className={`btn-opcao ${tipoEntrega === 'Entrega' ? 'ativo' : ''}`} onClick={() => setTipoEntrega('Entrega')}>🛵 Entrega</button>
               <button className={`btn-opcao ${tipoEntrega === 'Retirada' ? 'ativo' : ''}`} onClick={() => setTipoEntrega('Retirada')}>bag Retirada</button>
            </div>
            {tipoEntrega === 'Entrega' && <textarea placeholder="Endereço..." value={endereco} onChange={e => setEndereco(e.target.value)} className="mt-2 w-full p-2 border rounded" />}
            
            <div className="mt-4">
              <label className="block font-bold mb-1">Pagamento:</label>
              <select value={pagamento} onChange={e => setPagamento(e.target.value)} className="w-full p-2 border rounded">
                <option>Pix</option><option>Dinheiro</option><option>Cartão</option>
              </select>
            </div>
          </div>

          <div className="footer-carrinho">
             <div className="linha-total"><span>Total:</span><span>R$ {cartTotal.toFixed(2)}</span></div>
             <button className="btn-finalizar" onClick={finalizarPedido} disabled={loading}>
               {loading ? "Enviando..." : "Confirmar Pedido 👨‍🍳"}
             </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrinho;