import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';

const ABAS = [
  { id: 'rotina', label: 'Rotina', icone: '📅' },
  { id: 'cuidados', label: 'Cuidados', icone: '💧' },
  { id: 'mente', label: 'Mente', icone: '🧠' },
  { id: 'avaliacao', label: 'Avaliação', icone: '⭐' },
];

export default function NavigationBar({ abaAtiva, onMudarAba }) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {ABAS.map((aba) => {
          const estaAtiva = abaAtiva === aba.id;
          return (
            <TouchableOpacity
              key={aba.id}
              style={[styles.itemAba, estaAtiva && styles.itemAbaAtivo]}
              onPress={() => onMudarAba(aba.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconeWrap, estaAtiva && styles.iconeWrapAtivo]}>
                <Text style={styles.iconeTexto}>{aba.icone}</Text>
              </View>
              <Text style={[styles.labelAba, estaAtiva && styles.labelAbaAtivo]}>
                {aba.label}
              </Text>
              {estaAtiva && <View style={styles.indicadorAtivo} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  itemAba: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemAbaAtivo: {},
  iconeWrap: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeWrapAtivo: {
    backgroundColor: colors.primaryLight,
  },
  iconeTexto: {
    fontSize: 18,
  },
  labelAba: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 2,
  },
  labelAbaAtivo: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  indicadorAtivo: {
    width: 16,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 3,
  },
});
