import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import { useAuth } from './src/hooks/useAuth';
import { colors } from './src/constants/colors';
import {
  configurarHandler,
  configurarCanal,
  pedirPermissaoNotificacao,
} from './src/services/notificationService';

// Configura o handler ANTES de qualquer renderização
configurarHandler();

export default function App() {
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    // Configura canal Android e pede permissão ao iniciar
    configurarCanal();
    pedirPermissaoNotificacao();
  }, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  if (!usuario) {
    return <LoginScreen />;
  }

  return <HomeScreen usuario={usuario} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});