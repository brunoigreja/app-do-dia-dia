import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { META_AGUA, HUMORES } from '../constants/routine';

export default function CuidadosCard({
  dadosDia,
  onMudarAgua,
  onAtualizarDia,
  onEscolherHumor,
}) {
  const agua = dadosDia?.agua || 0;
  const sono = dadosDia?.sono ?? '';
  const humor = dadosDia?.humor || 0;
  const remedios = !!dadosDia?.remedios;

  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoTitulo}>Cuidados com você</Text>

      {/* Água */}
      <View style={styles.linhaFlex}>
        <Text style={styles.labelBold}>💧 Água:</Text>
        <TouchableOpacity
          style={styles.btnContador}
          onPress={() => onMudarAgua(-1)}
          activeOpacity={0.7}
        >
          <Text style={styles.btnContadorTexto}>−</Text>
        </TouchableOpacity>
        <Text style={styles.valorContador}>
          {agua} / {META_AGUA} copos
        </Text>
        <TouchableOpacity
          style={styles.btnContador}
          onPress={() => onMudarAgua(1)}
          activeOpacity={0.7}
        >
          <Text style={styles.btnContadorTexto}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Sono */}
      <View style={styles.linhaFlex}>
        <Text style={styles.labelBold}>😴 Horas de sono:</Text>
        <TextInput
          style={styles.inputSono}
          keyboardType="numeric"
          placeholder="Ex.: 7"
          placeholderTextColor={colors.textMuted}
          value={String(sono)}
          onChangeText={(v) => onAtualizarDia({ sono: v })}
        />
      </View>

      {/* Humor */}
      <View style={{ marginTop: 10 }}>
        <Text style={styles.labelBold}>Humor:</Text>
        <View style={styles.humorRow}>
          {HUMORES.map((hm, idx) => {
            const n = idx + 1;
            const selecionado = humor === n;
            return (
              <TouchableOpacity
                key={n}
                style={[styles.btnHumor, selecionado && styles.btnHumorAtivo]}
                onPress={() => onEscolherHumor(n)}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiHumor}>{hm.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Remédios */}
      <View style={[styles.linhaFlex, { marginTop: 15 }]}>
        <Text style={styles.labelBold}>💊 Remédios e vitaminas:</Text>
        <Switch
          value={remedios}
          onValueChange={(val) => onAtualizarDia({ remedios: val })}
          trackColor={{ false: '#767577', true: colors.primary }}
        />
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
  linhaFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    justifyContent: 'space-between',
  },
  labelBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  btnContador: {
    backgroundColor: colors.primaryLight,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContadorTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  valorContador: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  inputSono: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.textDark,
    width: 80,
    textAlign: 'center',
  },
  humorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  btnHumor: {
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 10,
  },
  btnHumorAtivo: {
    backgroundColor: colors.humorAtivo,
  },
  emojiHumor: {
    fontSize: 24,
  },
});
