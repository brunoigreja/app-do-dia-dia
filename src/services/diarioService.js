import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Retorna a referência de um dia específico do usuário.
 * Estrutura: /usuarios/{userId}/diarios/{data}
 */
function refDia(userId, data) {
  return doc(db, 'usuarios', userId, 'diarios', data);
}

/**
 * Retorna a referência da rotina padrão do usuário.
 * Estrutura: /usuarios/{userId}/config/rotina
 */
function refRotina(userId) {
  return doc(db, 'usuarios', userId, 'config', 'rotina');
}

/**
 * Escuta atualizações em tempo real de um dia específico
 */
export function escutarDia(userId, data, onSucesso, onError) {
  const docRef = refDia(userId, data);
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
export async function salvarDia(userId, data, dados) {
  try {
    const docRef = refDia(userId, data);
    await setDoc(docRef, dados, { merge: true });
  } catch (erro) {
    console.error(`Erro ao salvar dados do dia ${data}:`, erro);
    throw erro;
  }
}

/**
 * Deleta o registro de um dia no Firestore
 */
export async function deletarDia(userId, data) {
  try {
    const docRef = refDia(userId, data);
    await deleteDoc(docRef);
  } catch (erro) {
    console.error(`Erro ao deletar dia ${data}:`, erro);
    throw erro;
  }
}

/**
 * Busca dados pontuais de um dia
 */
export async function buscarDia(userId, data) {
  try {
    const docRef = refDia(userId, data);
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
export function buscarMultiplosDias(userId, datas) {
  try {
    const promessas = datas.map(async (d) => {
      const dados = await buscarDia(userId, d);
      return { data: d, dados };
    });
    return Promise.all(promessas).then((resultados) => {
      const mapa = {};
      resultados.forEach((item) => {
        if (item.dados) {
          mapa[item.data] = item.dados;
        }
      });
      return mapa;
    });
  } catch (erro) {
    console.error('Erro ao buscar múltiplos dias:', erro);
    return Promise.resolve({});
  }
}

/**
 * Escuta em tempo real a rotina padrão configurada pelo usuário
 */
export function escutarRotinaPadrao(userId, onSucesso, onError) {
  const docRef = refRotina(userId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists() && docSnap.data().blocos) {
        onSucesso(docSnap.data().blocos);
      } else {
        onSucesso(null);
      }
    },
    (erro) => {
      console.error('Erro ao escutar rotina padrão:', erro);
      if (onError) onError(erro);
    }
  );
}

/**
 * Salva a rotina padrão no Firestore
 */
export async function salvarRotinaPadrao(userId, blocos) {
  try {
    const docRef = refRotina(userId);
    await setDoc(docRef, { blocos }, { merge: true });
  } catch (erro) {
    console.error('Erro ao salvar rotina padrão:', erro);
    throw erro;
  }
}
