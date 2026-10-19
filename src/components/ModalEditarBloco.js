import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';

const EMOJIS_SUGESTOES = [
  '🏋️', '🧘', '🏃', '🥣', '🍽️', '🍲',
  '💼', '💻', '📚', '☕', '🌙', '🎯',
  '🚶', '🧹', '💊', '🎨', '🛒', '🚿',
];

const TIPOS = [
  { id: 'foco', label: 'Foco / Trabalho', icone: '💼', cor: colors.tipoFoco },
  { id: 'treino', label: 'Treino / Físico', icone: '🏋️', cor: colors.tipoTreino },
  { id: 'refeicao', label: 'Refeição', icone: '🍽️', cor: colors.tipoRefeicao },
  { id: 'descanso', label: 'Descanso / Lazer', icone: '🌙', cor: colors.tipoDescanso },
];

export default function ModalEditarBloco({
  visivel,
  blocoParaEditar,
  onSalvar,
  onExcluir,
  onFechar,
}) {
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('💼');
  const [tipo, setTipo] = useState('foco');
  const [ini, setIni] = useState('');
  const [fim, setFim] = useState('');
  const [aplicarPadrao, setAplicarPadrao] = useState(true);

  // Preenche dados ao abrir o modal
  useEffect(() => {
    if (blocoParaEditar) {
      setNome(blocoParaEditar.nome || '');
      setIcone(blocoParaEditar.icone || '💼');
      setTipo(blocoParaEditar.tipo || 'foco');
      setIni(blocoParaEditar.ini || '');
      setFim(blocoParaEditar.fim || '');
      setAplicarPadrao(true);
    } else {
      setNome('');
      setIcone('🎯');
      setTipo('foco');
      setIni('08:00');
      setFim('09:00');
      setAplicarPadrao(true);
    }
  }, [blocoParaEditar, visivel]);

  const handleSalvar = () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o nome da atividade.');
      return;
    }

    onSalvar(
      {
        id: blocoParaEditar?.id,
        nome: nome.trim(),
        icone: icone.trim() || '🎯',
        tipo,
        ini: ini.trim(),
        fim: fim.trim(),
      },
      aplicarPadrao
    );
    onFechar();
  };

  const handleExcluir = () => {
    if (!blocoParaEditar?.id) return;

    Alert.alert(
      'Excluir atividade',
      `Deseja remover "${blocoParaEditar.nome}" da rotina?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            onExcluir(blocoParaEditar.id, aplicarPadrao);
            onFechar();
          },
        },
      ]
    );
  };

  const eNovo = !blocoParaEditar?.id;

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent={true}
      onRequestClose={onFechar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          {/* TOPO */}
          <View style={styles.header}>
            <Text style={styles.tituloModal}>
              {eNovo ? '➕ Nova Atividade' : '✏️ Editar Atividade'}
            </Text>
            <TouchableOpacity onPress={onFechar} style={styles.btnFechar} activeOpacity={0.7}>
              <Text style={styles.btnFecharTexto}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
            {/* NOME */}
            <Text style={styles.label}>Nome da atividade:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Caminhada matinal, Leitura..."
              placeholderTextColor={colors.textMuted}
              value={nome}
              onChangeText={setNome}
            />

            {/* ÍCONE / EMOJI */}
            <Text style={styles.label}>Ícone / Emoji:</Text>
            <View style={styles.emojiInputRow}>
              <View style={styles.emojiPreview}>
                <Text style={{ fontSize: 26 }}>{icone || '🎯'}</Text>
              </View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Cole ou digite um emoji"
                placeholderTextColor={colors.textMuted}
                value={icone}
                onChangeText={setIcone}
                maxLength={4}
              />
            </View>

            {/* SUGESTÕES DE EMOJIS */}
            <View style={styles.gradeEmojis}>
              {EMOJIS_SUGESTOES.map((em, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.btnEmoji, icone === em && styles.btnEmojiAtivo]}
                  onPress={() => setIcone(em)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 20 }}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CATEGORIA */}
            <Text style={[styles.label, { marginTop: 12 }]}>Categoria:</Text>
            <View style={styles.tiposGrid}>
              {TIPOS.map((t) => {
                const ativo = tipo === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.btnTipo,
                      { borderColor: t.cor },
                      ativo && { backgroundColor: t.cor },
                    ]}
                    onPress={() => setTipo(t.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tipoTextoEmoji}>{t.icone}</Text>
                    <Text
                      style={[
                        styles.tipoTexto,
                        ativo ? styles.tipoTextoAtivo : { color: t.cor },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* HORÁRIOS */}
            <View style={styles.horariosRow}>
              <View style={styles.horarioItem}>
                <Text style={styles.label}>Horário Início:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00:00"
                  placeholderTextColor={colors.textMuted}
                  value={ini}
                  onChangeText={setIni}
                />
              </View>
              <View style={styles.horarioItem}>
                <Text style={styles.label}>Horário Fim:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00:00"
                  placeholderTextColor={colors.textMuted}
                  value={fim}
                  onChangeText={setFim}
                />
              </View>
            </View>

            {/* SWITCH PARA SALVAR COMO PADRÃO */}
            <View style={styles.linhaSwitch}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.labelSwitch}>Salvar como rotina padrão</Text>
                <Text style={styles.sublabelSwitch}>
                  Aparecerá automaticamente nos próximos dias
                </Text>
              </View>
              <Switch
                value={aplicarPadrao}
                onValueChange={setAplicarPadrao}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>
          </ScrollView>

          {/* BOTÕES DE AÇÃO */}
          <View style={styles.rodapeAcoes}>
            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={handleSalvar}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSalvarTexto}>
                {eNovo ? 'Adicionar Atividade' : 'Salvar Alterações'}
              </Text>
            </TouchableOpacity>

            {!eNovo && (
              <TouchableOpacity
                style={styles.btnExcluir}
                onPress={handleExcluir}
                activeOpacity={0.7}
              >
                <Text style={styles.btnExcluirTexto}>Excluir Atividade</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  btnFechar: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  btnFecharTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  conteudo: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 10,
  },
  emojiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  emojiPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gradeEmojis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  btnEmoji: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEmojiAtivo: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  tiposGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  btnTipo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 5,
  },
  tipoTextoEmoji: {
    fontSize: 14,
  },
  tipoTexto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipoTextoAtivo: {
    color: colors.white,
  },
  horariosRow: {
    flexDirection: 'row',
    gap: 10,
  },
  horarioItem: {
    flex: 1,
  },
  linhaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  labelSwitch: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  sublabelSwitch: {
    fontSize: 11,
    color: colors.textMuted,
  },
  rodapeAcoes: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  btnSalvar: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: 'center',
  },
  btnSalvarTexto: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnExcluir: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnExcluirTexto: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
