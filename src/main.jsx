import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Importe o Provider que acabamos de criar
import { CartProvider } from './contexts/CartContext.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos o App com o CartProvider */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
)