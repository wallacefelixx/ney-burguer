import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './Carrinho.css';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CODIGO_PIX = "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540410.005802BR5913Ney Burguer6008Divinopolis62070503***6304E2CA";

const Carrinho = () => {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();

  // Adaptador (Inglês -> Português)
  const carrinho = cartItems;
  const total = cartTotal;

  // Estados do Formulário
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState(''); // NOVO CAMPO
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [pixCopiado, setPixCopiado] = useState(false);
  
  const navigate = useNavigate();

  // Formata o telefone automaticamente (11) 99999-9999
  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses no DDD
    value = value.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca hífen
    setTelefone(value);
  };

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(CODIGO_PIX);
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 3000);
    }
  };

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return;
    
    // Validação mais rígida: Agora exige telefone
    if (!nomeCliente.trim() || !endereco.trim() || !telefone.trim()) {
      alert("Por favor, preencha Nome, Telefone e Endereço para a entrega.");
      return;
    }

    if (telefone.length < 14) {
      alert("Por favor, digite um telefone válido com DDD.");
      return;
    }

    const payloadPedido = {
      cliente: nomeCliente,
      telefone: telefone, // ENVIA PARA O BANCO
      endereco: endereco,
      itens: carrinho,
      total: total,
      pagamento: formaPagamento,
      status: 'Pendente',
      data_timestamp: serverTimestamp(),
      data: new Date().toLocaleString('pt-BR'),
      tipoEntrega: 'Delivery'
    };

    try {
      await addDoc(collection(db, "pedidos"), payloadPedido);
      clearCart();
      navigate('/pedidos');
    } catch (error) {
      console.error("Falha ao registrar pedido:", error);
      alert("Erro ao enviar pedido. Tente novamente.");
    }
  };

  if (carrinho.length === 0) {
    return (
      <div className="carrinho-vazio">
        <h2>Seu carrinho está vazio 😢</h2>
        <Link to="/" className="btn-voltar">Voltar para o cardápio</Link>
      </div>
    );
  }

  return (
    <div className="carrinho-container">
      <h2 className="titulo-secao">Finalizar Pedido</h2>
      
      <div className="lista-itens">
        {carrinho.map((item, index) => (
          <div key={`${item.id}-${index}`} className="item-carrinho">
             <div className="info-item">
                <h4>{item.quantidade}x {item.nome}</h4>
                {item.obs && <p className="obs-item">Obs: {item.obs}</p>}
             </div>
             <div className="actions-item">
                <span className="preco-item">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.id, item.obs)} className="btn-remover">Remover</button>
             </div>
          </div>
        ))}
      </div>

      <div className="total-pedido">
        <h3>Total Geral: R$ {total.toFixed(2)}</h3>
      </div>

      <div className="formulario-entrega">
        <h3>Dados de Entrega</h3>
        
        {/* GRUPO DE DADOS DO CLIENTE */}
        <div className="form-row">
            <div className="form-grupo">
            <label htmlFor="nome">Seu Nome:</label>
            <input 
                id="nome"
                type="text" 
                value={nomeCliente} 
                onChange={e => setNomeCliente(e.target.value)} 
                placeholder="Ex: João Silva" 
            />
            </div>

            <div className="form-grupo">
            <label htmlFor="telefone">WhatsApp / Telefone:</label>
            <input 
                id="telefone"
                type="tel" 
                value={telefone} 
                onChange={handleTelefoneChange} 
                maxLength="15"
                placeholder="(37) 99999-9999" 
            />
            </div>
        </div>

        <div className="form-grupo">
          <label htmlFor="endereco">Endereço Completo:</label>
          <textarea 
            id="endereco"
            value={endereco} 
            onChange={e => setEndereco(e.target.value)} 
            placeholder="Rua, Número, Bairro e Ponto de Referência..."
            rows="4" 
          />
        </div>

        <div className="form-grupo">
          <label htmlFor="pagamento">Forma de Pagamento:</label>
          <select id="pagamento" value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
            <option value="dinheiro">Dinheiro (Levar troco)</option>
            <option value="cartao">Cartão (Maquininha)</option>
            <option value="pix">PIX (Pagamento imediato)</option>
          </select>
        </div>

        {formaPagamento === 'pix' && (
          <div className="pix-area animate-fade-in">
            <div className="pix-header"><h4>Pagamento via PIX</h4></div>
            <p className="pix-instrucao">Use o Copia e Cola abaixo:</p>
            
            <div className="qr-code-wrapper">
                <img src="https://placehold.co/150x150/FBBF24/1a1a1a?text=QR+Code" alt="QR" className="qr-code-img" />
            </div>

            <div className="input-group-copy">
              <input type="text" value={CODIGO_PIX} readOnly disabled />
              <button type="button" onClick={handleCopyPix} className={`btn-copy ${pixCopiado ? 'success' : ''}`}>
                {pixCopiado ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        <button className="btn-finalizar" onClick={finalizarPedido}>
          Confirmar Pedido
        </button>
      </div>
    </div>
  );
};

export default Carrinho;