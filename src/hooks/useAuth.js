import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

/**
 * Hook que escuta o estado de autenticação em tempo real.
 * Retorna:
 *   - usuario: objeto do usuário Firebase (null se não logado)
 *   - carregando: true enquanto verifica a sessão salva
 */
export function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  return { usuario, carregando };
}
