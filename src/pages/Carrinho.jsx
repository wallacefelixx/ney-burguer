import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './Carrinho.css';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CODIGO_PIX = "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540410.005802BR5913Ney Burguer6008Divinopolis62070503***6304E2CA";

const Carrinho = () => {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Variáveis adaptadas
  const carrinho = cartItems;
  const total = cartTotal;

  // Estados do Formulário
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  
  // Novos Estados para o Troco
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [valorTroco, setValorTroco] = useState('');

  const [pixCopiado, setPixCopiado] = useState(false);

  // Formata telefone
  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    setTelefoneInput(value); // Nota: Corrigi o nome da função aqui embaixo na hora de usar
    setTelefone(value);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CODIGO_PIX);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 3000);
  };

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return;
    
    // Validação Básica
    if (!nomeCliente.trim() || !endereco.trim() || !telefone.trim()) {
      alert("⚠️ Por favor, preencha todos os dados de entrega.");
      return;
    }

    if (telefone.length < 14) {
      alert("⚠️ Digite um telefone válido com DDD.");
      return;
    }

    // Validação do Troco
    let infoPagamento = formaPagamento;
    if (formaPagamento === 'dinheiro') {
      if (precisaTroco) {
        if (!valorTroco) {
          alert("⚠️ Você informou que precisa de troco. Diga para quanto.");
          return;
        }
        infoPagamento = `Dinheiro (Troco para R$ ${valorTroco})`;
      } else {
        infoPagamento = "Dinheiro (Sem troco)";
      }
    } else if (formaPagamento === 'cartao') {
      infoPagamento = "Cartão (Levaremos a maquininha)";
    } else if (formaPagamento === 'pix') {
      infoPagamento = "PIX (Pago via App)";
    }

    const payloadPedido = {
      cliente: nomeCliente,
      telefone: telefone,
      endereco: endereco,
      itens: carrinho,
      total: total,
      pagamento: infoPagamento,
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
      console.error("Erro ao enviar:", error);
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
      
      {/* Resumo do Pedido */}
      <div className="resumo-pedido">
        <div className="lista-itens-resumo">
          {carrinho.map((item, index) => (
            <div key={`${item.id}-${index}`} className="item-linha">
               <div className="item-info">
                  <span className="qtd">{item.quantidade}x</span>
                  <span className="nome">{item.nome}</span>
               </div>
               <span className="preco">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
               <button onClick={() => removeFromCart(item.id, item.obs)} className="btn-lixeira">🗑️</button>
            </div>
          ))}
        </div>
        <div className="total-badge">
          <span>Total a pagar:</span>
          <strong>R$ {total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="formulario-entrega">
        <h3>📍 Dados de Entrega</h3>
        
        {/* Grid para alinhar Nome e Telefone */}
        <div className="form-grid">
            <div className="form-grupo">
                <label>Seu Nome</label>
                <input 
                    type="text" 
                    className="input-moderno"
                    value={nomeCliente} 
                    onChange={e => setNomeCliente(e.target.value)} 
                    placeholder="Ex: João Silva" 
                />
            </div>

            <div className="form-grupo">
                <label>WhatsApp / Celular</label>
                <input 
                    type="tel" 
                    className="input-moderno"
                    value={telefone} 
                    onChange={handleTelefoneChange} 
                    maxLength="15"
                    placeholder="(37) 99999-9999" 
                />
            </div>
        </div>

        <div className="form-grupo">
          <label>Endereço Completo</label>
          <textarea 
            className="input-moderno textarea-end"
            value={endereco} 
            onChange={e => setEndereco(e.target.value)} 
            placeholder="Rua, Número, Bairro e Ponto de Referência..."
            rows="3" 
          />
        </div>

        <h3>💳 Pagamento</h3>
        <div className="form-grupo">
          <select 
            className="input-moderno select-pag" 
            value={formaPagamento} 
            onChange={e => setFormaPagamento(e.target.value)}
          >
            <option value="dinheiro">💵 Dinheiro</option>
            <option value="cartao">💳 Cartão (Entrega)</option>
            <option value="pix">💠 PIX</option>
          </select>
        </div>

        {/* --- LÓGICA DO DINHEIRO E TROCO --- */}
        {formaPagamento === 'dinheiro' && (
          <div className="area-troco fade-in">
            <p className="label-troco">Vai precisar de troco?</p>
            <div className="opcoes-troco">
                <button 
                    className={`btn-opcao ${!precisaTroco ? 'ativo' : ''}`}
                    onClick={() => setPrecisaTroco(false)}
                >
                    Não, tenho certinho
                </button>
                <button 
                    className={`btn-opcao ${precisaTroco ? 'ativo' : ''}`}
                    onClick={() => setPrecisaTroco(true)}
                >
                    Sim, preciso
                </button>
            </div>
            
            {precisaTroco && (
                <div className="input-troco-wrapper fade-in">
                    <label>Troco para quanto?</label>
                    <input 
                        type="number" 
                        placeholder="Ex: 50" 
                        className="input-moderno"
                        value={valorTroco}
                        onChange={(e) => setValorTroco(e.target.value)}
                    />
                </div>
            )}
          </div>
        )}

        {/* --- LÓGICA DO PIX --- */}
        {formaPagamento === 'pix' && (
          <div className="pix-area fade-in">
            <div className="pix-alerta">
                ⚠️ NÃO ESQUEÇA DE ENVIAR O COMPROVANTE!
                <small>Seu pedido só será preparado após o envio.</small>
            </div>
            
            <div className="input-group-copy">
              <input type="text" value={CODIGO_PIX} readOnly disabled />
              <button type="button" onClick={handleCopyPix} className={`btn-copy ${pixCopiado ? 'success' : ''}`}>
                {pixCopiado ? 'Copiado!' : 'Copiar Chave'}
              </button>
            </div>
          </div>
        )}

        <button className="btn-finalizar" onClick={finalizarPedido}>
          ✅ Confirmar Pedido
        </button>
      </div>
    </div>
  );
};

export default Carrinho;