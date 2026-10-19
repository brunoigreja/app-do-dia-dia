import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { BLOCOS_PADRAO } from '../constants/routine';
import {
  calcularPorcentagem,
  calcularSomaTipo,
  formatarHoras,
  obterMensagemStatus,
} from '../utils/calculations';

export default function ResumoCard({ dadosDia, blocos }) {
  const listaBlocos = blocos || dadosDia?.blocosLista || BLOCOS_PADRAO;
  const concluidas = listaBlocos.filter((b) => dadosDia?.blocos?.[b.id]?.feito).length;
  const total = listaBlocos.length;

  const focoFeito = calcularSomaTipo(dadosDia, 'foco', true, listaBlocos);
  const focoTotal = calcularSomaTipo(dadosDia, 'foco', false, listaBlocos);

  const treinoFeito = calcularSomaTipo(dadosDia, 'treino', true, listaBlocos);
  const treinoTotal = calcularSomaTipo(dadosDia, 'treino', false, listaBlocos);

  const pct = calcularPorcentagem(dadosDia, listaBlocos);
  const fraseStatus = obterMensagemStatus(pct);

  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoTitulo}>Resumo do dia</Text>

      <View style={styles.numerosGrid}>
        <View style={styles.numeroBox}>
          <Text style={styles.numeroDestaque}>
            {concluidas}/{total}
          </Text>
          <Text style={styles.numeroRotulo}>concluídas</Text>
        </View>

        <View style={styles.numeroBox}>
          <Text style={styles.numeroDestaque}>{formatarHoras(focoFeito)}</Text>
          <Text style={styles.numeroRotulo}>de foco ({formatarHoras(focoTotal)})</Text>
        </View>

        <View style={styles.numeroBox}>
          <Text style={styles.numeroDestaque}>{formatarHoras(treinoFeito)}</Text>
          <Text style={styles.numeroRotulo}>de treino ({formatarHoras(treinoTotal)})</Text>
        </View>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.barraFundo}>
        <View style={[styles.barraProgresso, { width: `${pct}%` }]} />
      </View>

      <Text style={styles.fraseStatus}>{fraseStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cartaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  numerosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numeroBox: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  numeroDestaque: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  numeroRotulo: {
    fontSize: 10,
    color: colors.textDark,
    textAlign: 'center',
  },
  barraFundo: {
    height: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  fraseStatus: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
  },
});
