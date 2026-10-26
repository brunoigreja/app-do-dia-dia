import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';

/**
 * Cria uma nova conta com e-mail, senha e nome de exibição
 */
export async function cadastrar(email, senha, nome) {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha);
  if (nome) {
    await updateProfile(credencial.user, { displayName: nome });
  }
  return credencial.user;
}

/**
 * Faz login com e-mail e senha
 */
export async function login(email, senha) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

/**
 * Encerra a sessão do usuário atual
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Traduz mensagens de erro do Firebase Auth para português
 */
export function traduzirErroAuth(codigo) {
  const erros = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
  };
  return erros[codigo] || 'Ocorreu um erro. Tente novamente.';
}
