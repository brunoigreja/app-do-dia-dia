import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Substitua pelas credenciais do seu console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbT133AMO5b1jYpni1CCmDaM3d4KUNtVE",
  authDomain: "cadastro-teste-25385.firebaseapp.com",
  projectId: "cadastro-teste-25385",
  storageBucket: "cadastro-teste-25385.firebasestorage.app",
  messagingSenderId: "748615665202",
  appId: "1:748615665202:web:0d8e8b6482256cc4dc1e2b"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o banco de dados Firestore
export const db = getFirestore(app);

// Inicializa o Auth com persistência via AsyncStorage (mantém login entre sessões)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});