import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { BLOCOS_PADRAO } from '../constants/routine';
import BlocoItem from './BlocoItem';

export default function RotinaCard({
  blocosPadrao = BLOCOS_PADRAO,
  dadosDia,
  onAlternarBloco,
  onEditarBloco,
}) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoTitulo}>Rotina do dia</Text>

      {blocosPadrao.map((bloco) => {
        const dadosBloco = dadosDia?.blocos?.[bloco.id] || {};
        return (
          <BlocoItem
            key={bloco.id}
            bloco={bloco}
            dadosBloco={dadosBloco}
            onAlternar={onAlternarBloco}
            onEditar={onEditarBloco}
          />
        );
      })}
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
});
