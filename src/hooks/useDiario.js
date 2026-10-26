import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { hoje, somarDias, dataBonita } from '../utils/dateUtils';
import {
  criarDiaVazio,
  calcularPorcentagem,
  calcularScoreDia,
  obterClassificacaoScore,
} from '../utils/calculations';
import { BLOCOS_PADRAO, HUMORES } from '../constants/routine';
import {
  escutarDia,
  salvarDia,
  deletarDia,
  buscarMultiplosDias,
  escutarRotinaPadrao,
  salvarRotinaPadrao,
} from '../services/diarioService';
import { sincronizarLembretesDia, cancelarLembrete } from '../services/notificationService';

export function useDiario(userId) {
  const [dias, setDias] = useState({});
  const [dataAtual, setDataAtual] = useState(hoje());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [rotinaPadrao, setRotinaPadrao] = useState(BLOCOS_PADRAO);

  // Escuta alterações na rotina padrão salva pelo usuário
  useEffect(() => {
    if (!userId) return;
    const unsubRotina = escutarRotinaPadrao(userId, (blocosSalvos) => {
      if (blocosSalvos && Array.isArray(blocosSalvos) && blocosSalvos.length > 0) {
        setRotinaPadrao(blocosSalvos);
      }
    });

    return () => unsubRotina();
  }, [userId]);

  // Escuta alterações em tempo real do Firestore para o dia selecionado
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = escutarDia(userId, dataAtual, (dados) => {
      const dadosDia = dados || criarDiaVazio(rotinaPadrao);
      setDias((prev) => ({
        ...prev,
        [dataAtual]: dadosDia,
      }));

      // Sincroniza lembretes apenas para hoje (não faz sentido para dias passados)
      const ehHoje = dataAtual === hoje();
      if (ehHoje) {
        const lista =
          dadosDia?.blocosLista?.length > 0
            ? dadosDia.blocosLista
            : rotinaPadrao;
        sincronizarLembretesDia(dataAtual, lista, dadosDia?.blocos || {});
      }
    });

    return () => unsubscribe();
  }, [userId, dataAtual, rotinaPadrao]);

  // Carrega os últimos 7 dias para exibir o gráfico da semana preenchido
  useEffect(() => {
    if (!userId) return;
    const datasSemana = [0, 1, 2, 3, 4, 5, 6].map((i) => somarDias(dataAtual, -i));
    buscarMultiplosDias(userId, datasSemana).then((mapaDias) => {
      setDias((prev) => ({
        ...prev,
        ...mapaDias,
      }));
    });
  }, [userId, dataAtual]);

  // Dados do dia atual (ou estrutura padrão vazia)
  const diaAtualDados = useMemo(() => {
    return dias[dataAtual] || criarDiaVazio(rotinaPadrao);
  }, [dias, dataAtual, rotinaPadrao]);

  // Lista de blocos atual do dia (personalizada para o dia ou a rotina padrão)
  const blocosAtuais = useMemo(() => {
    if (
      diaAtualDados?.blocosLista &&
      Array.isArray(diaAtualDados.blocosLista) &&
      diaAtualDados.blocosLista.length > 0
    ) {
      return diaAtualDados.blocosLista;
    }
    return rotinaPadrao;
  }, [diaAtualDados, rotinaPadrao]);

  // Atualização genérica de atributos do dia
  const atualizarDiaAtual = useCallback(
    async (novosAtributos) => {
      const atualizado = { ...diaAtualDados, ...novosAtributos };
      setDias((prev) => ({ ...prev, [dataAtual]: atualizado }));
      try {
        await salvarDia(userId, dataAtual, atualizado);
      } catch (e) {
        console.error('Erro ao sincronizar com Firebase:', e);
      }
    },
    [userId, diaAtualDados, dataAtual]
  );

  // Ações nos blocos da rotina
  const alternarBloco = useCallback(
    (id) => {
      const blocos = { ...diaAtualDados.blocos };
      const blocoAtual = blocos[id] || {};
      const novoFeito = !blocoAtual.feito;
      blocos[id] = { ...blocoAtual, feito: novoFeito };
      atualizarDiaAtual({ blocos });

      // Se marcou como FEITO → cancela o lembrete imediatamente
      // Se desmarcou → reativa o lembrete (via sincronização ao salvar)
      if (novoFeito) {
        cancelarLembrete(dataAtual, id);
      } else {
        // Reativa: busca definição do bloco para reagendar
        const blocoDefinicao = blocosAtuais.find((b) => b.id === id);
        if (blocoDefinicao && blocoDefinicao.lembrete !== false) {
          const ehHoje = dataAtual === hoje();
          if (ehHoje) {
            sincronizarLembretesDia(dataAtual, blocosAtuais, {
              ...blocos,
              [id]: { ...blocos[id], feito: false },
            });
          }
        }
      }
    },
    [diaAtualDados, atualizarDiaAtual, blocosAtuais, dataAtual]
  );

  const editarBloco = useCallback(
    (id, campo, valor) => {
      const blocos = { ...diaAtualDados.blocos };
      const blocoAtual = blocos[id] || {};
      blocos[id] = { ...blocoAtual, [campo]: valor };
      atualizarDiaAtual({ blocos });
    },
    [diaAtualDados, atualizarDiaAtual]
  );

  // Salvar/Editar uma atividade (bloco) da rotina
  const salvarBloco = useCallback(
    async (blocoEditado, aplicarComoPadrao = true) => {
      const listaAtual = [...blocosAtuais];
      const index = listaAtual.findIndex((b) => b.id === blocoEditado.id);

      let novaLista;
      const novoId = blocoEditado.id || `bloco_${Date.now()}`;
      const blocoFormatado = { ...blocoEditado, id: novoId };

      if (index >= 0) {
        // Atualiza bloco existente
        novaLista = [...listaAtual];
        novaLista[index] = blocoFormatado;
      } else {
        // Adiciona novo bloco
        novaLista = [...listaAtual, blocoFormatado];
      }

      // Atualiza os registros do dia mantendo o estado de feito/nota
      const blocosDia = { ...(diaAtualDados.blocos || {}) };
      if (!blocosDia[novoId]) {
        blocosDia[novoId] = {
          feito: false,
          ini: blocoFormatado.ini || '',
          fim: blocoFormatado.fim || '',
          nota: '',
        };
      } else {
        blocosDia[novoId] = {
          ...blocosDia[novoId],
          ini: blocoFormatado.ini ?? blocosDia[novoId].ini,
          fim: blocoFormatado.fim ?? blocosDia[novoId].fim,
        };
      }

      await atualizarDiaAtual({
        blocosLista: novaLista,
        blocos: blocosDia,
      });

      if (aplicarComoPadrao) {
        try {
          await salvarRotinaPadrao(userId, novaLista);
          setRotinaPadrao(novaLista);
        } catch (e) {
          console.error('Erro ao atualizar rotina padrão:', e);
        }
      }

      // Reagenda lembretes do dia com a lista atualizada
      if (dataAtual === hoje()) {
        sincronizarLembretesDia(dataAtual, novaLista, blocosDia);
      }
    },
    [blocosAtuais, diaAtualDados, atualizarDiaAtual, dataAtual, userId]
  );

  // Remover uma atividade (bloco) da rotina
  const removerBloco = useCallback(
    async (blocoId, aplicarComoPadrao = true) => {
      const novaLista = blocosAtuais.filter((b) => b.id !== blocoId);
      const blocosDia = { ...(diaAtualDados.blocos || {}) };
      delete blocosDia[blocoId];

      await atualizarDiaAtual({
        blocosLista: novaLista,
        blocos: blocosDia,
      });

      if (aplicarComoPadrao) {
        try {
          await salvarRotinaPadrao(userId, novaLista);
          setRotinaPadrao(novaLista);
        } catch (e) {
          console.error('Erro ao atualizar rotina padrão:', e);
        }
      }

      // Cancela lembrete do bloco removido
      cancelarLembrete(dataAtual, blocoId);
    },
    [blocosAtuais, diaAtualDados, atualizarDiaAtual, dataAtual, userId]
  );

  // Cuidados pessoais
  const mudarAgua = useCallback(
    (delta) => {
      const novaAgua = Math.max(0, Math.min(20, (diaAtualDados.agua || 0) + delta));
      atualizarDiaAtual({ agua: novaAgua });
    },
    [diaAtualDados.agua, atualizarDiaAtual]
  );

  const escolherHumor = useCallback(
    (n) => {
      const novoHumor = diaAtualDados.humor === n ? 0 : n;
      atualizarDiaAtual({ humor: novoHumor });
    },
    [diaAtualDados.humor, atualizarDiaAtual]
  );

  // Avaliação pessoal do dia
  const avaliarDia = useCallback(
    (notaPessoal, reflexao) => {
      const avaliacao = {
        ...(diaAtualDados.avaliacao || {}),
        notaPessoal: notaPessoal !== undefined ? notaPessoal : (diaAtualDados.avaliacao?.notaPessoal || 0),
        reflexao: reflexao !== undefined ? reflexao : (diaAtualDados.avaliacao?.reflexao || ''),
      };
      atualizarDiaAtual({ avaliacao });
    },
    [diaAtualDados.avaliacao, atualizarDiaAtual]
  );

  // Deletar / Limpar dia
  const limparDiaAtual = useCallback(() => {
    Alert.alert('Limpar dia', 'Tem certeza que deseja apagar todos os registros deste dia?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletarDia(userId, dataAtual);
            setDias((prev) => {
              const copia = { ...prev };
              delete copia[dataAtual];
              return copia;
            });
          } catch (e) {
            console.error('Erro ao deletar dia:', e);
            Alert.alert('Erro', 'Não foi possível apagar os dados do dia.');
          }
        },
      },
    ]);
  }, [userId, dataAtual]);

  // Copiar resumo do dia
  const copiarResumoDia = useCallback(async () => {
    const pct = calcularPorcentagem(diaAtualDados, blocosAtuais);
    const score = calcularScoreDia(diaAtualDados, blocosAtuais);
    const classif = obterClassificacaoScore(score);

    const linhas = [
      `Diário do dia — ${dataBonita(dataAtual)}`,
      `Score do dia: ${score}/100 (${classif.emoji} ${classif.label})`,
      `Concluído: ${pct}% da rotina`,
      '',
    ];

    blocosAtuais.forEach((b) => {
      const x = diaAtualDados.blocos?.[b.id] || {};
      const horario = (x.ini || b.ini) + ((x.fim || b.fim) ? `–${x.fim || b.fim}` : '');
      linhas.push(`${x.feito ? '✔ ' : '✘ '}${b.nome} (${horario})${x.nota ? ' — ' + x.nota : ''}`);
    });

    linhas.push('');
    linhas.push(
      `Água: ${diaAtualDados.agua || 0} copos | Sono: ${diaAtualDados.sono ? diaAtualDados.sono + 'h' : '—'} | Humor: ${
        diaAtualDados.humor ? HUMORES[diaAtualDados.humor - 1]?.emoji : '—'
      }`
    );

    const prio = (diaAtualDados.prioridades || []).filter(Boolean);
    if (prio.length) linhas.push(`Prioridades: ${prio.join(' / ')}`);
    if (diaAtualDados.gratidao) linhas.push(`Gratidão: ${diaAtualDados.gratidao}`);
    if (diaAtualDados.notas) linhas.push(`Notas: ${diaAtualDados.notas}`);

    const notaPessoal = diaAtualDados.avaliacao?.notaPessoal;
    const reflexao = diaAtualDados.avaliacao?.reflexao;
    if (notaPessoal || reflexao) {
      linhas.push('');
      if (notaPessoal) linhas.push(`Avaliação pessoal: ${notaPessoal}/10 ⭐`);
      if (reflexao) linhas.push(`Reflexão: ${reflexao}`);
    }

    await Clipboard.setStringAsync(linhas.join('\n'));
    Alert.alert('Copiado!', 'O resumo do dia foi copiado para a área de transferência.');
  }, [dataAtual, diaAtualDados, blocosAtuais]);

  return {
    dataAtual,
    setDataAtual,
    dias,
    diaAtualDados,
    blocosAtuais,
    salvarBloco,
    removerBloco,
    mostrarDatePicker,
    setMostrarDatePicker,
    atualizarDiaAtual,
    alternarBloco,
    editarBloco,
    mudarAgua,
    escolherHumor,
    avaliarDia,
    limparDiaAtual,
    copiarResumoDia,
  };
}
