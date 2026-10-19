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

export function useDiario() {
  const [dias, setDias] = useState({});
  const [dataAtual, setDataAtual] = useState(hoje());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [rotinaPadrao, setRotinaPadrao] = useState(BLOCOS_PADRAO);

  // Escuta alterações na rotina padrão salva pelo usuário
  useEffect(() => {
    const unsubRotina = escutarRotinaPadrao((blocosSalvos) => {
      if (blocosSalvos && Array.isArray(blocosSalvos) && blocosSalvos.length > 0) {
        setRotinaPadrao(blocosSalvos);
      }
    });

    return () => unsubRotina();
  }, []);

  // Escuta alterações em tempo real do Firestore para o dia selecionado
  useEffect(() => {
    const unsubscribe = escutarDia(dataAtual, (dados) => {
      setDias((prev) => ({
        ...prev,
        [dataAtual]: dados || criarDiaVazio(rotinaPadrao),
      }));
    });

    return () => unsubscribe();
  }, [dataAtual, rotinaPadrao]);

  // Carrega os últimos 7 dias para exibir o gráfico da semana preenchido
  useEffect(() => {
    const datasSemana = [0, 1, 2, 3, 4, 5, 6].map((i) => somarDias(dataAtual, -i));
    buscarMultiplosDias(datasSemana).then((mapaDias) => {
      setDias((prev) => ({
        ...prev,
        ...mapaDias,
      }));
    });
  }, [dataAtual]);

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
        await salvarDia(dataAtual, atualizado);
      } catch (e) {
        console.error('Erro ao sincronizar com Firebase:', e);
      }
    },
    [diaAtualDados, dataAtual]
  );

  // Ações nos blocos da rotina
  const alternarBloco = useCallback(
    (id) => {
      const blocos = { ...diaAtualDados.blocos };
      const blocoAtual = blocos[id] || {};
      blocos[id] = { ...blocoAtual, feito: !blocoAtual.feito };
      atualizarDiaAtual({ blocos });
    },
    [diaAtualDados, atualizarDiaAtual]
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
          await salvarRotinaPadrao(novaLista);
          setRotinaPadrao(novaLista);
        } catch (e) {
          console.error('Erro ao atualizar rotina padrão:', e);
        }
      }
    },
    [blocosAtuais, diaAtualDados, atualizarDiaAtual]
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
          await salvarRotinaPadrao(novaLista);
          setRotinaPadrao(novaLista);
        } catch (e) {
          console.error('Erro ao atualizar rotina padrão:', e);
        }
      }
    },
    [blocosAtuais, diaAtualDados, atualizarDiaAtual]
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
            await deletarDia(dataAtual);
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
  }, [dataAtual]);

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
