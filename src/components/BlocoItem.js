import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { duracaoMin, formatarHoras } from '../utils/calculations';

export default function BlocoItem({
  bloco,
  dadosBloco,
  onAlternar,
  onEditar,
  onEditarAtividade,
}) {
  const estaFeito = !!dadosBloco?.feito;
  const ini = dadosBloco?.ini ?? bloco.ini;
  const fim = dadosBloco?.fim ?? bloco.fim;
  const nota = dadosBloco?.nota ?? '';
  const duracao = duracaoMin(ini, fim);

  // Define cor da borda esquerda baseada na categoria
  const obterCorTipo = (tipo) => {
    switch (tipo) {
      case 'treino':
        return colors.tipoTreino;
      case 'foco':
        return colors.tipoFoco;
      case 'refeicao':
        return colors.tipoRefeicao;
      case 'descanso':
        return colors.tipoDescanso;
      default:
        return colors.primary;
    }
  };

  return (
    <View
      style={[
        styles.blocoCard,
        { borderLeftColor: obterCorTipo(bloco.tipo) },
        estaFeito && styles.blocoFeito,
      ]}
    >
      <View style={styles.blocoTopoContainer}>
        <TouchableOpacity
          style={styles.blocoTopo}
          onPress={() => onAlternar(bloco.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.checkboxEmoji}>{estaFeito ? '✅' : '⬜'}</Text>
          <Text style={[styles.blocoNome, estaFeito && styles.textoRiscado]}>
            {bloco.icone} {bloco.nome}
          </Text>
        </TouchableOpacity>

        <View style={styles.topoDireita}>
          {duracao > 0 && (
            <Text style={styles.duracaoBadge}>{formatarHoras(duracao)}</Text>
          )}
          {onEditarAtividade && (
            <TouchableOpacity
              style={styles.btnEditarAtividade}
              onPress={() => onEditarAtividade(bloco)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.iconeEditar}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.horariosRow}>
        <View style={styles.horarioInputWrap}>
          <Text style={styles.labelPequeno}>Início</Text>
          <TextInput
            style={styles.inputHora}
            value={ini}
            placeholder="00:00"
            placeholderTextColor={colors.textMuted}
            onChangeText={(v) => onEditar(bloco.id, 'ini', v)}
          />
        </View>
        <View style={styles.horarioInputWrap}>
          <Text style={styles.labelPequeno}>Fim</Text>
          <TextInput
            style={styles.inputHora}
            value={fim}
            placeholder="00:00"
            placeholderTextColor={colors.textMuted}
            onChangeText={(v) => onEditar(bloco.id, 'fim', v)}
          />
        </View>
      </View>

      <TextInput
        style={styles.inputAnotacao}
        placeholder="Anotação (opcional)"
        placeholderTextColor={colors.textMuted}
        value={nota}
        onChangeText={(v) => onEditar(bloco.id, 'nota', v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blocoCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 6,
  },
  blocoFeito: {
    backgroundColor: colors.blocoFeitoBg,
  },
  blocoTopoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blocoTopo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  topoDireita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnEditarAtividade: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 58, 107, 0.08)',
  },
  iconeEditar: {
    fontSize: 13,
  },
  checkboxEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  blocoNome: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  textoRiscado: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  duracaoBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  horariosRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  horarioInputWrap: {
    flex: 1,
  },
  labelPequeno: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  inputHora: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: colors.textDark,
  },
  inputAnotacao: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    marginTop: 8,
    color: colors.textDark,
  },
});
