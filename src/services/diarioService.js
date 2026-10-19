import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const COLECAO = 'diarios';

/**
 * Escuta atualizações em tempo real de um dia específico
 */
export function escutarDia(data, onSucesso, onError) {
  const docRef = doc(db, COLECAO, data);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onSucesso(docSnap.data());
      } else {
        onSucesso(null);
      }
    },
    (erro) => {
      console.error(`Erro ao escutar dados do dia ${data}:`, erro);
      if (onError) onError(erro);
    }
  );
}

/**
 * Salva ou atualiza os dados de um dia no Firestore
 */
export async function salvarDia(data, dados) {
  try {
    const docRef = doc(db, COLECAO, data);
    await setDoc(docRef, dados, { merge: true });
  } catch (erro) {
    console.error(`Erro ao salvar dados do dia ${data}:`, erro);
    throw erro;
  }
}

/**
 * Deleta o registro de um dia no Firestore
 */
export async function deletarDia(data) {
  try {
    const docRef = doc(db, COLECAO, data);
    await deleteDoc(docRef);
  } catch (erro) {
    console.error(`Erro ao deletar dia ${data}:`, erro);
    throw erro;
  }
}

/**
 * Busca dados pontuais de um dia
 */
export async function buscarDia(data) {
  try {
    const docRef = doc(db, COLECAO, data);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (erro) {
    console.error(`Erro ao buscar dia ${data}:`, erro);
    return null;
  }
}

/**
 * Busca dados de uma lista de datas (para carregar o gráfico da semana)
 */
export async function buscarMultiplosDias(datas) {
  try {
    const promessas = datas.map(async (d) => {
      const dados = await buscarDia(d);
      return { data: d, dados };
    });
    const resultados = await Promise.all(promessas);
    const mapa = {};
    resultados.forEach((item) => {
      if (item.dados) {
        mapa[item.data] = item.dados;
      }
    });
    return mapa;
  } catch (erro) {
    console.error('Erro ao buscar múltiplos dias:', erro);
    return {};
  }
}
