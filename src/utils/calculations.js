import { BLOCOS_PADRAO } from '../constants/routine';

/**
 * Converte string 'HH:MM' em minutos totais
 */
export function minutos(hhmm) {
  if (!hhmm) return null;
  const p = hhmm.split(':');
  if (p.length < 2) return null;
  return Number(p[0]) * 60 + Number(p[1]);
}

/**
 * Calcula a duração em minutos entre início e fim
 */
export function duracaoMin(ini, fim) {
  const a = minutos(ini);
  const b = minutos(fim);
  if (a === null || b === null || b <= a) return 0;
  return b - a;
}

/**
 * Formata minutos em formato amigável 'XhYY'
 */
export function formatarHoras(min) {
  if (!min) return '—';
  const hh = Math.floor(min / 60);
  const mm = min % 60;
  return `${hh}h${mm ? String(mm).padStart(2, '0') : ''}`;
}

/**
 * Cria a estrutura de dados inicial para um novo dia
 */
export function criarDiaVazio() {
  const dia = {
    blocos: {},
    agua: 0,
    sono: '',
    humor: 0,
    remedios: false,
    prioridades: ['', '', ''],
    gratidao: '',
    notas: '',
  };

  BLOCOS_PADRAO.forEach((b) => {
    dia.blocos[b.id] = { feito: false, ini: b.ini, fim: b.fim, nota: '' };
  });

  return dia;
}

/**
 * Calcula a porcentagem de conclusão dos blocos de um dia
 */
export function calcularPorcentagem(dadosDia) {
  if (!dadosDia || !dadosDia.blocos) return 0;
  const feitos = BLOCOS_PADRAO.filter((b) => dadosDia.blocos[b.id]?.feito).length;
  return Math.round((feitos / BLOCOS_PADRAO.length) * 100);
}

/**
 * Soma o tempo total gasto em um tipo de atividade (foco, treino, etc.)
 */
export function calcularSomaTipo(dadosDia, tipo, soConcluidos = false) {
  if (!dadosDia || !dadosDia.blocos) return 0;

  return BLOCOS_PADRAO.filter((b) => b.tipo === tipo).reduce((soma, b) => {
    const x = dadosDia.blocos[b.id];
    if (!x) return soma;
    if (soConcluidos && !x.feito) return soma;
    return soma + duracaoMin(x.ini, x.fim);
  }, 0);
}

/**
 * Retorna uma mensagem motivacional baseada no percentual concluído
 */
export function obterMensagemStatus(pct) {
  if (pct === 100) {
    return '🎉 Dia completo! Você cumpriu toda a rotina.';
  }
  if (pct >= 60) {
    return 'Muito bem, você está na reta final do dia.';
  }
  if (pct > 0) {
    return 'Você já começou, e cada passo conta.';
  }
  return 'Marque as atividades conforme for concluindo.';
}
