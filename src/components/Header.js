import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../constants/colors';
import { somarDias, hoje, paraData, paraTexto } from '../utils/dateUtils';

export default function Header({
  dataAtual,
  onMudarData,
  mostrarDatePicker,
  setMostrarDatePicker,
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitulo}>📓 Diário do dia</Text>
      <Text style={styles.headerSubtitulo}>Planeje, marque e acompanhe seu dia.</Text>

      <View style={styles.navDatas}>
        <TouchableOpacity
          style={styles.btnNav}
          onPress={() => onMudarData(somarDias(dataAtual, -1))}
          activeOpacity={0.7}
        >
          <Text style={styles.btnNavTexto}>◀ Ant.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnDataPicker}
          onPress={() => setMostrarDatePicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnDataTexto}>{dataAtual}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnNav}
          onPress={() => onMudarData(hoje())}
          activeOpacity={0.7}
        >
          <Text style={styles.btnNavTexto}>Hoje</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnNav}
          onPress={() => onMudarData(somarDias(dataAtual, 1))}
          activeOpacity={0.7}
        >
          <Text style={styles.btnNavTexto}>Próx. ▶</Text>
        </TouchableOpacity>
      </View>

      {mostrarDatePicker && (
        <DateTimePicker
          value={paraData(dataAtual)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(evt, selectedDate) => {
            setMostrarDatePicker(false);
            if (selectedDate) onMudarData(paraTexto(selectedDate));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitulo: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 14,
  },
  navDatas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnNav: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnNavTexto: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnDataPicker: {
    backgroundColor: colors.white,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnDataTexto: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
