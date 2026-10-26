import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/colors';
import { login, cadastrar, traduzirErroAuth } from '../services/authService';

export default function LoginScreen() {
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const limparCampos = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setErro('');
    setVerSenha(false);
  };

  const alternarModo = () => {
    limparCampos();
    setModo(modo === 'login' ? 'cadastro' : 'login');
  };

  const handleSubmit = async () => {
    setErro('');

    // Validações
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (modo === 'cadastro') {
      if (!nome.trim()) {
        setErro('Informe seu nome.');
        return;
      }
      if (senha !== confirmarSenha) {
        setErro('As senhas não coincidem.');
        return;
      }
      if (senha.length < 6) {
        setErro('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }

    setCarregando(true);
    try {
      if (modo === 'login') {
        await login(email.trim(), senha);
      } else {
        await cadastrar(email.trim(), senha, nome.trim());
      }
      // useAuth detecta automaticamente — App.js redireciona para HomeScreen
    } catch (e) {
      setErro(traduzirErroAuth(e.code));
    } finally {
      setCarregando(false);
    }
  };

  const ehLogin = modo === 'login';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" backgroundColor={colors.primary} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HEADER ─────────────────────────────────── */}
        <View style={styles.headerBloco}>
          <Text style={styles.logo}>📓</Text>
          <Text style={styles.titulo}>Diário do Dia</Text>
          <Text style={styles.subtitulo}>
            {ehLogin
              ? 'Entre para acessar seu diário'
              : 'Crie sua conta e comece a planejar'}
          </Text>
        </View>

        {/* ─── CARD DO FORMULÁRIO ──────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>
            {ehLogin ? '👋 Bem-vindo de volta!' : '🚀 Criar conta'}
          </Text>

          {/* NOME (apenas no cadastro) */}
          {!ehLogin && (
            <View style={styles.campoWrapper}>
              <Text style={styles.label}>Seu nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: João Silva"
                placeholderTextColor={colors.textMuted}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          {/* E-MAIL */}
          <View style={styles.campoWrapper}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* SENHA */}
          <View style={styles.campoWrapper}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.senhaRow}>
              <TextInput
                style={[styles.input, styles.senhaInput]}
                placeholder="••••••"
                placeholderTextColor={colors.textMuted}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!verSenha}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType={ehLogin ? 'done' : 'next'}
                onSubmitEditing={ehLogin ? handleSubmit : undefined}
              />
              <TouchableOpacity
                style={styles.btnVerSenha}
                onPress={() => setVerSenha(!verSenha)}
                activeOpacity={0.7}
              >
                <Text style={styles.btnVerSenhaTexto}>
                  {verSenha ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRMAR SENHA (apenas no cadastro) */}
          {!ehLogin && (
            <View style={styles.campoWrapper}>
              <Text style={styles.label}>Confirmar senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor={colors.textMuted}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!verSenha}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          )}

          {/* MENSAGEM DE ERRO */}
          {erro !== '' && (
            <View style={styles.erroBox}>
              <Text style={styles.erroTexto}>⚠️ {erro}</Text>
            </View>
          )}

          {/* BOTÃO PRINCIPAL */}
          <TouchableOpacity
            style={[styles.btnPrincipal, carregando && styles.btnDesabilitado]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnPrincipalTexto}>
                {ehLogin ? 'Entrar' : 'Criar conta'}
              </Text>
            )}
          </TouchableOpacity>

          {/* ALTERNAR MODO */}
          <View style={styles.alternarRow}>
            <Text style={styles.alternarTexto}>
              {ehLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
            </Text>
            <TouchableOpacity onPress={alternarModo} activeOpacity={0.7}>
              <Text style={styles.alternarLink}>
                {ehLogin ? 'Criar conta' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── RODAPÉ ──────────────────────────────────── */}
        <Text style={styles.rodape}>Seus dados ficam seguros com o Firebase 🔒</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // ─── Header
  headerBloco: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.85,
  },

  // ─── Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },

  // ─── Campos
  campoWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark,
  },

  // ─── Campo senha com botão ver
  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senhaInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  btnVerSenha: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  btnVerSenhaTexto: {
    fontSize: 16,
  },

  // ─── Erro
  erroBox: {
    backgroundColor: '#FDEDED',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#C0392B',
  },
  erroTexto: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Botão principal
  btnPrincipal: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnDesabilitado: {
    opacity: 0.7,
  },
  btnPrincipalTexto: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // ─── Alternar modo
  alternarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  alternarTexto: {
    color: colors.textMuted,
    fontSize: 14,
  },
  alternarLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },

  // ─── Rodapé
  rodape: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginTop: 28,
    opacity: 0.7,
  },
});
