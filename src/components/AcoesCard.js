import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function AcoesCard({ onCopiarResumo, onLimparDia }) {
  return (
    <View style={styles.container}>
      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={styles.btnAcaoPrincipal}
          onPress={onCopiarResumo}
          activeOpacity={0.8}
        >
          <Text style={styles.btnAcaoTexto}>Copiar resumo do dia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnAcaoDiscreto}
          onPress={onLimparDia}
          activeOpacity={0.6}
        >
          <Text style={styles.btnAcaoDiscretoTexto}>Limpar este dia</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.rodape}>
        Seus dados estão sincronizados com a nuvem (Firebase).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  acoesContainer: {
    gap: 10,
    marginVertical: 10,
  },
  btnAcaoPrincipal: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnAcaoTexto: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnAcaoDiscreto: {
    borderBottomWidth: 1,
    borderBottomColor: colors.danger,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnAcaoDiscretoTexto: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 13,
  },
  rodape: {
    textAlign: 'center',
    fontSize: 11,
    color: '#777',
    marginTop: 10,
  },
});
