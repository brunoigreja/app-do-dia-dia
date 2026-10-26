import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Canal Android ────────────────────────────────────────────────────────────
const CHANNEL_ID = 'diario-lembretes';

export async function configurarCanal() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de Atividades',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#002973',
      sound: 'default',
    });
  }
}

// ─── Permissões ───────────────────────────────────────────────────────────────
export async function pedirPermissaoNotificacao() {
  const { status: existente } = await Notifications.getPermissionsAsync();
  if (existente === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Handler (mostrar notificação mesmo com app aberto) ───────────────────────
export function configurarHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ─── Helpers de horário ───────────────────────────────────────────────────────
/**
 * Converte "HH:MM" + data-string "YYYY-MM-DD" em um objeto Date.
 * Retorna null se o horário for inválido ou já passou.
 */
function montarDataHora(dataStr, horario) {
  if (!horario || !horario.includes(':')) return null;
  const [h, m] = horario.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;

  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const dt = new Date(ano, mes - 1, dia, h, m, 0, 0);

  // Só agenda se ainda estiver no futuro
  if (dt <= new Date()) return null;
  return dt;
}

// ─── Agendar lembrete de uma atividade ───────────────────────────────────────
/**
 * @param {string}  dataStr   "YYYY-MM-DD" do dia
 * @param {object}  bloco     objeto do bloco (id, nome, icone, fim)
 * @returns {string|null} identificador da notificação agendada
 */
export async function agendarLembrete(dataStr, bloco) {
  const horarioFim = bloco.fim;
  const dt = montarDataHora(dataStr, horarioFim);
  if (!dt) return null;

  const id = `lembrete_${bloco.id}_${dataStr}`;

  // Cancela qualquer anterior com mesmo id antes de recriar
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `${bloco.icone ?? '🔔'} ${bloco.nome}`,
      body: 'Horário concluído! Você realizou essa atividade? Toque para marcar no diário.',
      data: { blocoId: bloco.id, data: dataStr },
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dt,
    },
  });

  return id;
}

// ─── Cancelar lembrete de uma atividade ──────────────────────────────────────
export async function cancelarLembrete(dataStr, blocoId) {
  const id = `lembrete_${blocoId}_${dataStr}`;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

// ─── Sincronizar todos os lembretes do dia ───────────────────────────────────
/**
 * Recalcula e reagenda os lembretes do dia com base na lista de blocos.
 * Cancela lembretes de atividades já marcadas como feitas ou sem lembrete.
 *
 * @param {string}   dataStr      "YYYY-MM-DD"
 * @param {Array}    blocosLista  lista de definições de bloco
 * @param {object}   blocosDia    mapa { [id]: { feito, ini, fim, lembrete } }
 */
export async function sincronizarLembretesDia(dataStr, blocosLista, blocosDia) {
  if (!blocosLista || !Array.isArray(blocosLista)) return;

  for (const bloco of blocosLista) {
    const dadosBloco = blocosDia?.[bloco.id] || {};
    const lembreteAtivo = dadosBloco.lembrete !== false && bloco.lembrete !== false;

    if (!lembreteAtivo || dadosBloco.feito) {
      // Atividade já feita ou lembrete desativado → cancela
      await cancelarLembrete(dataStr, bloco.id);
    } else {
      // Usa horário fim do dia (personalizado) ou do bloco padrão
      const horarioFim = dadosBloco.fim || bloco.fim;
      const blocoParaAgendar = { ...bloco, fim: horarioFim };
      await agendarLembrete(dataStr, blocoParaAgendar);
    }
  }
}
