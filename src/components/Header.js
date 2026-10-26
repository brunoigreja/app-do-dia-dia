import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../constants/colors';
import { somarDias, hoje, paraData, paraTexto } from '../utils/dateUtils';
import { logout } from '../services/authService';

export default function Header({
  usuario,
  dataAtual,
  onMudarData,
  mostrarDatePicker,
  setMostrarDatePicker,
}) {
  const nomeUsuario = usuario?.displayName || usuario?.email?.split('@')[0] || '';

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            console.error('Erro ao sair:', e);
            Alert.alert('Erro', 'Não foi possível desconectar.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.header}>
      <View style={styles.topoRow}>
        <View style={styles.titulosCol}>
          <Text style={styles.headerTitulo}>📓 Diário do dia</Text>
          <Text style={styles.headerSubtitulo}>
            {nomeUsuario ? `Olá, ${nomeUsuario}! 👋` : 'Planeje, marque e acompanhe seu dia.'}
          </Text>
        </View>

        {usuario && (
          <TouchableOpacity
            style={styles.btnSair}
            onPress={handleLogout}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.btnSairTexto}>🚪 Sair</Text>
          </TouchableOpacity>
        )}
      </View>

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
  topoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titulosCol: {
    flex: 1,
    marginRight: 10,
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitulo: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  btnSair: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  btnSairTexto: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
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
