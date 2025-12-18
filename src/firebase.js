// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// COLE AQUI O SEU CÓDIGO DO CONSOLE FIREBASE (O QUE TEM A API KEY)
// Exemplo (Use os seus dados reais!):

const firebaseConfig = {
  apiKey: "AIzaSyAEEAmcNViKtAoYaaZ5xA9lY3Mtib_BElU",
  authDomain: "ney-burguer.firebaseapp.com",
  projectId: "ney-burguer",
  storageBucket: "ney-burguer.firebasestorage.app",
  messagingSenderId: "113525098424",
  appId: "1:113525098424:web:7637b8a8049d2b919fb14d"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o Banco de Dados (Firestore)
export const db = getFirestore(app);