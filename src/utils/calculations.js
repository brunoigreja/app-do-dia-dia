import { BLOCOS_PADRAO, META_AGUA } from '../constants/routine';

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
export function criarDiaVazio(blocosIniciais = BLOCOS_PADRAO) {
  const dia = {
    blocos: {},
    blocosLista: blocosIniciais,
    agua: 0,
    sono: '',
    humor: 0,
    remedios: false,
    prioridades: ['', '', ''],
    gratidao: '',
    notas: '',
    avaliacao: {
      notaPessoal: 0,
      reflexao: '',
    },
  };

  blocosIniciais.forEach((b) => {
    dia.blocos[b.id] = { feito: false, ini: b.ini, fim: b.fim, nota: '' };
  });

  return dia;
}

/**
 * Retorna a lista de blocos a considerar (personalizada ou padrão)
 */
export function obterBlocosDia(dadosDia, fallbackBlocos = BLOCOS_PADRAO) {
  if (dadosDia?.blocosLista && Array.isArray(dadosDia.blocosLista) && dadosDia.blocosLista.length > 0) {
    return dadosDia.blocosLista;
  }
  return fallbackBlocos;
}

/**
 * Calcula a porcentagem de conclusão dos blocos de um dia
 */
export function calcularPorcentagem(dadosDia, fallbackBlocos = BLOCOS_PADRAO) {
  if (!dadosDia || !dadosDia.blocos) return 0;
  const lista = obterBlocosDia(dadosDia, fallbackBlocos);
  if (lista.length === 0) return 0;
  const feitos = lista.filter((b) => dadosDia.blocos[b.id]?.feito).length;
  return Math.round((feitos / lista.length) * 100);
}

/**
 * Soma o tempo total gasto em um tipo de atividade (foco, treino, etc.)
 */
export function calcularSomaTipo(dadosDia, tipo, soConcluidos = false, fallbackBlocos = BLOCOS_PADRAO) {
  if (!dadosDia || !dadosDia.blocos) return 0;
  const lista = obterBlocosDia(dadosDia, fallbackBlocos);

  return lista.filter((b) => b.tipo === tipo).reduce((soma, b) => {
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

/**
 * Calcula o Score Automático do Dia (0 a 100 pontos)
 * baseado no cumprimento das metas
 */
export function calcularScoreDia(dadosDia, fallbackBlocos = BLOCOS_PADRAO) {
  if (!dadosDia) return 0;

  // 1. Rotina: até 50 pontos
  const lista = obterBlocosDia(dadosDia, fallbackBlocos);
  const totalBlocos = lista.length;
  const concluidas = lista.filter((b) => dadosDia?.blocos?.[b.id]?.feito).length;
  const ptsRotina = totalBlocos > 0 ? (concluidas / totalBlocos) * 50 : 0;

  // 2. Hidratação / Água: até 20 pontos
  const agua = dadosDia?.agua || 0;
  const ptsAgua = Math.min(1, agua / META_AGUA) * 20;

  // 3. Sono: até 15 pontos (meta saudável >= 7h)
  const sonoNum = parseFloat(dadosDia?.sono) || 0;
  let ptsSono = 0;
  if (sonoNum >= 7) ptsSono = 15;
  else if (sonoNum >= 6) ptsSono = 10;
  else if (sonoNum > 0) ptsSono = 5;

  // 4. Remédios e Vitaminas: até 10 pontos
  const ptsRemedios = dadosDia?.remedios ? 10 : 0;

  // 5. Cabeça e Coração (Prioridades ou Gratidão preenchidas): até 5 pontos
  const temGratidao = !!dadosDia?.gratidao?.trim();
  const temPrioridades = (dadosDia?.prioridades || []).some((p) => !!p?.trim());
  const ptsMente = temGratidao || temPrioridades ? 5 : 0;

  const scoreTotal = Math.round(ptsRotina + ptsAgua + ptsSono + ptsRemedios + ptsMente);
  return Math.min(100, Math.max(0, scoreTotal));
}

/**
 * Retorna o título, emoji e cor de destaque para cada faixa de score
 */
export function obterClassificacaoScore(score) {
  if (score >= 90) return { label: 'Dia Excepcional!', emoji: '🏆', cor: '#2E7D6B' };
  if (score >= 75) return { label: 'Alta Performance', emoji: '🚀', cor: '#1E3A6B' };
  if (score >= 50) return { label: 'Bom Progresso', emoji: '👍', cor: '#3B72A4' };
  if (score >= 25) return { label: 'Em Ritmo', emoji: '⚡', cor: '#D9962B' };
  return { label: 'Passo Inicial', emoji: '🌱', cor: '#888888' };
}

