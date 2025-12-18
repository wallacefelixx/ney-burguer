import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Detalhes from './pages/Detalhes';
import Carrinho from './pages/Carrinho';
import Cozinha from './pages/Cozinha';
import MeusPedidos from './pages/MeusPedidos'; // <--- O Import que faltava

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:id" element={<Detalhes />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cozinha" element={<Cozinha />} />
        {/* A Rota que estava faltando: */}
        <Route path="/pedidos" element={<MeusPedidos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;