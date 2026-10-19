import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { somarDias, obterDiaSemanaCurto } from '../utils/dateUtils';
import { calcularPorcentagem } from '../utils/calculations';

export default function SemanaGraficoCard({ dataAtual, dias, onSelecionarData }) {
  const diasSemana = [6, 5, 4, 3, 2, 1, 0];

  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoTitulo}>Últimos 7 dias</Text>
      <View style={styles.semanaGrafico}>
        {diasSemana.map((i) => {
          const t = somarDias(dataAtual, -i);
          const pct = calcularPorcentagem(dias[t]);
          const eAtual = t === dataAtual;
          const nomeDia = obterDiaSemanaCurto(t);

          return (
            <TouchableOpacity
              key={t}
              style={styles.colunaGraficoWrap}
              onPress={() => onSelecionarData(t)}
              activeOpacity={0.7}
            >
              <Text style={styles.pctColunaText}>{pct}%</Text>
              <View style={styles.colunaFundoBarra}>
                <View
                  style={[
                    styles.colunaPreenchimento,
                    { height: `${Math.max(pct, 5)}%` },
                    eAtual && styles.colunaAtual,
                  ]}
                />
              </View>
              <Text style={[styles.nomeDiaText, eAtual && styles.nomeDiaAtual]}>
                {nomeDia}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  semanaGrafico: {
    flexDirection: 'row',
    height: 130,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  colunaGraficoWrap: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  pctColunaText: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  colunaFundoBarra: {
    width: 14,
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.barBackground,
    borderRadius: 6,
    overflow: 'hidden',
  },
  colunaPreenchimento: {
    width: '100%',
    backgroundColor: colors.barFill,
    borderRadius: 6,
  },
  colunaAtual: {
    backgroundColor: colors.primary,
  },
  nomeDiaText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  nomeDiaAtual: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});
