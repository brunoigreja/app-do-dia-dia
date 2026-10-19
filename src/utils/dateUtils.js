/**
 * Utilitários para manipulação e formatação de datas
 */

export function paraTexto(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function hoje() {
  return paraTexto(new Date());
}

export function paraData(texto) {
  if (!texto) return new Date();
  const p = texto.split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

export function somarDias(texto, n) {
  const d = paraData(texto);
  d.setDate(d.getDate() + n);
  return paraTexto(d);
}

export function dataBonita(texto) {
  return paraData(texto).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function obterDiaSemanaCurto(texto) {
  return paraData(texto)
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '');
}
