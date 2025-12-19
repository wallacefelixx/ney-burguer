import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Importe suas páginas...
import Home from './pages/Home';
import Detalhes from './pages/Detalhes';
import Carrinho from './pages/Carrinho';
import Cozinha from './pages/Cozinha';
import MeusPedidos from './pages/MeusPedidos';
import Navbar from './components/Navbar';
import PedidoSucesso from './pages/PedidoSucesso';
import Balcao from './pages/Balcao';

// 1. IMPORTE O RODAPÉ AQUI
import Rodape from './components/Rodape'; // (Ou './Rodape' se não criou a pasta components)

function App() {
  return (
    <HashRouter>
      <div className="app-container" style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produto/:id" element={<Detalhes />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/cozinha" element={<Cozinha />} />
          <Route path="/pedidos" element={<MeusPedidos />} />
          <Route path="/sucesso" element={<PedidoSucesso />} />
          <Route path="/balcao" element={<Balcao />} />
        </Routes>

        {/* 2. COLOQUE O RODAPÉ AQUI NO FINAL */}
        <Rodape />
      </div>
    </HashRouter>
  );
}

export default App;