import React, { useState } from 'react';
import { useCarrinho } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './Carrinho.css';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// CÓDIGO PIX DE EXEMPLO (Substitua pelo código real "Copia e Cola" do banco do Ney)
const CODIGO_PIX_COPIA_COLA = "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540410.005802BR5913Ney Burguer6008Divinopolis62070503***6304E2CA";

const Carrinho = () => {
  const { carrinho, total, removerDoCarrinho, limparCarrinho } = useCarrinho();
  const [nomeCliente, setNomeCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [pixCopiado, setPixCopiado] = useState(false); // Novo estado para feedback do botão
  const navigate = useNavigate();

  // --- FUNÇÃO PARA COPIAR O PIX ---
  const handleCopyPix = () => {
    navigator.clipboard.writeText(CODIGO_PIX_COPIA_COLA);
    setPixCopiado(true);
    // Volta o texto do botão ao normal depois de 3 segundos
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
      itens: carrinho,
      total: total,
      pagamento: formaPagamento,
      status: 'Pendente',
      data_timestamp: serverTimestamp(),
      data: new Date().toLocaleString('pt-BR'),
      tipoEntrega: 'Delivery'
    };

    try {
      await addDoc(collection(db, "pedidos"), pedido);
      limparCarrinho();
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
      
      {/* ... Lista de itens (igual ao anterior) ... */}
      <div className="lista-itens">
        {carrinho.map(item => (
          <div key={item.id} className="item-carrinho">
             <div>
                <h4>{item.quantidade}x {item.nome}</h4>
                {item.obs && <p className="obs">Obs: {item.obs}</p>}
             </div>
             <div className="item-actions">
                <p>R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                <button onClick={() => removerDoCarrinho(item.id)} className="btn-remover">Remover</button>
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
          {/* AUMENTAMOS A CAIXA AQUI COM rows="4" */}
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

        {/* --- NOVA SEÇÃO DO PIX (Só aparece se selecionar PIX) --- */}
        {formaPagamento === 'pix' && (
          <div className="pix-area animate-fade-in">
            <h4>Pagamento via PIX</h4>
            <p className="pix-instrucao">Escaneie o QR Code ou use o "Copia e Cola" abaixo:</p>
            
            {/* Placeholder do QR Code (Troque a imagem src pela real depois) */}
            <div className="qr-code-box">
              <img 
                src="https://placehold.co/200x200/FBBF24/1a1a1a?text=QR+Code+PIX\n(Exemplo)" 
                alt="QR Code PIX" 
              />
            </div>

            {/* Área do Copia e Cola */}
            <div className="copia-cola-box">
              <input type="text" value={CODIGO_PIX_COPIA_COLA} readOnly />
              {/* Botão com feedback visual */}
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
        {/* --------------------------------------------------------- */}

        <button className="btn-finalizar" onClick={finalizarPedido}>
          Confirmar Pedido {formaPagamento === 'pix' && 'e Enviar Comprovante'}
        </button>
      </div>
    </div>
  );
};

export default Carrinho;