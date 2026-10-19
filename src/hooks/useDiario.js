import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { hoje, somarDias, dataBonita } from '../utils/dateUtils';
import { criarDiaVazio, calcularPorcentagem } from '../utils/calculations';
import { BLOCOS_PADRAO, HUMORES } from '../constants/routine';
import {
  escutarDia,
  salvarDia,
  deletarDia,
  buscarMultiplosDias,
} from '../services/diarioService';

export function useDiario() {
  const [dias, setDias] = useState({});
  const [dataAtual, setDataAtual] = useState(hoje());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  // Escuta alterações em tempo real do Firestore para o dia selecionado
  useEffect(() => {
    const unsubscribe = escutarDia(dataAtual, (dados) => {
      setDias((prev) => ({
        ...prev,
        [dataAtual]: dados || criarDiaVazio(),
      }));
    });

    return () => unsubscribe();
  }, [dataAtual]);

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
    return dias[dataAtual] || criarDiaVazio();
  }, [dias, dataAtual]);

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
    const pct = calcularPorcentagem(diaAtualDados);
    const linhas = [`Diário do dia — ${dataBonita(dataAtual)}`, `Concluído: ${pct}% da rotina`, ''];

    BLOCOS_PADRAO.forEach((b) => {
      const x = diaAtualDados.blocos?.[b.id] || {};
      const horario = x.ini + (x.fim ? `–${x.fim}` : '');
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

    await Clipboard.setStringAsync(linhas.join('\n'));
    Alert.alert('Copiado!', 'O resumo do dia foi copiado para a área de transferência.');
  }, [dataAtual, diaAtualDados]);

  return {
    dataAtual,
    setDataAtual,
    dias,
    diaAtualDados,
    mostrarDatePicker,
    setMostrarDatePicker,
    atualizarDiaAtual,
    alternarBloco,
    editarBloco,
    mudarAgua,
    escolherHumor,
    limparDiaAtual,
    copiarResumoDia,
  };
}
