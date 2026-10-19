import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function MenteCard({ dadosDia, onAtualizarDia }) {
  const prioridades = dadosDia?.prioridades || ['', '', ''];
  const gratidao = dadosDia?.gratidao || '';
  const notas = dadosDia?.notas || '';

  const mudarPrioridade = (idx, valor) => {
    const novasPrioridades = [...(prioridades.length ? prioridades : ['', '', ''])];
    novasPrioridades[idx] = valor;
    onAtualizarDia({ prioridades: novasPrioridades });
  };

  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoTitulo}>Cabeça e coração</Text>

      <Text style={styles.labelBold}>Prioridades de hoje:</Text>
      {[0, 1, 2].map((idx) => (
        <TextInput
          key={idx}
          style={styles.inputPrioridade}
          placeholder={`${idx + 1}ª prioridade`}
          placeholderTextColor={colors.textMuted}
          value={prioridades[idx] || ''}
          onChangeText={(v) => mudarPrioridade(idx, v)}
        />
      ))}

      <Text style={[styles.labelBold, { marginTop: 10 }]}>Pelo que sou grato hoje:</Text>
      <TextInput
        style={styles.inputTexto}
        placeholder="Sua gratidão de hoje..."
        placeholderTextColor={colors.textMuted}
        value={gratidao}
        onChangeText={(v) => onAtualizarDia({ gratidao: v })}
      />

      <Text style={[styles.labelBold, { marginTop: 10 }]}>Anotações do dia:</Text>
      <TextInput
        style={[styles.inputTexto, styles.inputNotas]}
        multiline
        placeholder="Anotações gerais..."
        placeholderTextColor={colors.textMuted}
        value={notas}
        onChangeText={(v) => onAtualizarDia({ notas: v })}
      />
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
  labelBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 6,
  },
  inputPrioridade: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 6,
  },
  inputTexto: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.textDark,
  },
  inputNotas: {
    height: 80,
    textAlignVertical: 'top',
  },
});
