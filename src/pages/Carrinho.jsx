import React, { useState } from 'react';
// 1. CORREÇÃO DO IMPORT (Caminho correto)
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './Carrinho.css';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CODIGO_PIX_COPIA_COLA = "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540410.005802BR5913Ney Burguer6008Divinopolis62070503***6304E2CA";

const Carrinho = () => {
  // 2. CORREÇÃO DAS VARIÁVEIS (Inglês do Context -> Português da tela)
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  
  // Para facilitar, vamos apelidar as variáveis aqui dentro:
  const carrinho = cartItems;
  const total = cartTotal;
  const limparCarrinho = clearCart;
  // A remoção precisa receber ID e OBS agora
  const removerDoCarrinho = (id, obs) => removeFromCart(id, obs); 

  const [nomeCliente, setNomeCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [pixCopiado, setPixCopiado] = useState(false);
  const navigate = useNavigate();

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CODIGO_PIX_COPIA_COLA);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 3000);
  };

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return;
    if (!nomeCliente || !endereco) {
      alert("Por favor, preencha nome e endereço!");
      return;
    }

    const pedido = {
      cliente: nomeCliente,
      endereco: endereco,
      itens: carrinho, // O Firebase vai receber a lista correta
      total: total,
      pagamento: formaPagamento,
      status: 'Pendente',
      data_timestamp: serverTimestamp(),
      data: new Date().toLocaleString('pt-BR'),
      tipoEntrega: 'Delivery'
    };

    try {
      await addDoc(collection(db, "pedidos"), pedido);
      limparCarrinho(); // Agora essa função existe!
      navigate('/pedidos');
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar pedido. Tente novamente.");
    }
  };

  if (carrinho.length === 0) {
    return (
      <div className="carrinho-vazio">
        <h2>Seu carrinho está vazio 😢</h2>
        <Link to="/">Voltar para o cardápio</Link>
      </div>
    );
  }

  return (
    <div className="carrinho-container">
      <h2>Finalizar Pedido</h2>
      
      <div className="lista-itens">
        {carrinho.map((item, index) => (
          // Usando index como chave extra para garantir unicidade
          <div key={`${item.id}-${index}`} className="item-carrinho">
             <div>
                <h4>{item.quantidade}x {item.nome}</h4>
                {item.obs && <p className="obs">Obs: {item.obs}</p>}
             </div>
             <div className="item-actions">
                <p>R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                {/* Ajuste importante: Passar ID e OBS para remover corretamente */}
                <button onClick={() => removerDoCarrinho(item.id, item.obs)} className="btn-remover">Remover</button>
             </div>
          </div>
        ))}
      </div>

      <div className="total-pedido">
        <h3>Total: R$ {total.toFixed(2)}</h3>
      </div>

      <div className="formulario-entrega">
        <h3>Dados para Entrega</h3>
        <div className="form-grupo">
          <label>Seu Nome:</label>
          <input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Ex: João Silva" />
        </div>
        <div className="form-grupo">
          <label>Endereço Completo:</label>
          <textarea 
            value={endereco} 
            onChange={e => setEndereco(e.target.value)} 
            placeholder="Rua, Número, Bairro e Referência..."
            rows="4" 
          />
        </div>
        <div className="form-grupo">
          <label>Forma de Pagamento:</label>
          <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
            <option value="dinheiro">Dinheiro (Levar troco)</option>
            <option value="cartao">Cartão (Maquininha na entrega)</option>
            <option value="pix">PIX (Pagar agora)</option>
          </select>
        </div>

        {formaPagamento === 'pix' && (
          <div className="pix-area animate-fade-in">
            <h4>Pagamento via PIX</h4>
            <p className="pix-instrucao">Escaneie o QR Code ou use o "Copia e Cola" abaixo:</p>
            
            <div className="qr-code-box">
              <img 
                src="https://placehold.co/200x200/FBBF24/1a1a1a?text=QR+Code+PIX\n(Exemplo)" 
                alt="QR Code PIX" 
              />
            </div>

            <div className="copia-cola-box">
              <input type="text" value={CODIGO_PIX_COPIA_COLA} readOnly />
              <button 
                type="button" 
                onClick={handleCopyPix}
                className={pixCopiado ? 'btn-copiar copiado' : 'btn-copiar'}
              >
                {pixCopiado ? 'Copiado! ✅' : 'Copiar Código'}
              </button>
            </div>
            <p className="pix-aviso"><small>Após pagar, clique em "Confirmar Pedido" abaixo.</small></p>
          </div>
        )}

        <button className="btn-finalizar" onClick={finalizarPedido}>
          Confirmar Pedido {formaPagamento === 'pix' && 'e Enviar Comprovante'}
        </button>
      </div>
    </div>
  );
};

export default Carrinho;