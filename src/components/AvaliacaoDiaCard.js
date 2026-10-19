import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { calcularScoreDia, obterClassificacaoScore } from '../utils/calculations';
import { META_AGUA, BLOCOS_PADRAO } from '../constants/routine';

export default function AvaliacaoDiaCard({ dadosDia, onAvaliarDia, blocos }) {
  const avaliacao = dadosDia?.avaliacao || {};
  const notaSelecionada = avaliacao?.notaPessoal || 0;
  const reflexao = avaliacao?.reflexao || '';

  const listaBlocos = blocos || dadosDia?.blocosLista || BLOCOS_PADRAO;

  // Cálculo do score e classificação
  const score = calcularScoreDia(dadosDia, listaBlocos);
  const classificacao = obterClassificacaoScore(score);

  // Detalhamento dos pontos para o usuário entender o cálculo
  const concluidas = listaBlocos.filter((b) => dadosDia?.blocos?.[b.id]?.feito).length;
  const ptsRotina = Math.round(
    listaBlocos.length > 0 ? (concluidas / listaBlocos.length) * 50 : 0
  );
  const agua = dadosDia?.agua || 0;
  const ptsAgua = Math.round(Math.min(1, agua / META_AGUA) * 20);
  const sonoNum = parseFloat(dadosDia?.sono) || 0;
  const ptsSono = sonoNum >= 7 ? 15 : sonoNum >= 6 ? 10 : sonoNum > 0 ? 5 : 0;
  const ptsRemedios = dadosDia?.remedios ? 10 : 0;
  const ptsMente =
    !!dadosDia?.gratidao?.trim() || (dadosDia?.prioridades || []).some((p) => !!p?.trim())
      ? 5
      : 0;

  // Frase de incentivo conforme a nota pessoal escolhida
  const obterFraseNota = (nota) => {
    if (nota === 10) return 'Perfeito! Um dia memorável! 🌟';
    if (nota >= 8) return 'Excelente dia! Parabéns pela dedicação! 🚀';
    if (nota >= 6) return 'Bom dia! Muitas vitórias conquistadas. 👍';
    if (nota >= 4) return 'Dia desafiador, mas você esteve presente! ⚡';
    if (nota > 0) return 'Dias difíceis também trazem aprendizados. Força! 🌱';
    return 'Toque em um número para avaliar o seu dia';
  };

  const selecionarNota = (n) => {
    const novaNota = notaSelecionada === n ? 0 : n;
    onAvaliarDia(novaNota, reflexao);
  };

  return (
    <View style={styles.cartao}>
      <View style={styles.topoCard}>
        <Text style={styles.cartaoTitulo}>⭐ Fechamento do Dia</Text>
        <View style={[styles.badgeClassificacao, { backgroundColor: classificacao.cor }]}>
          <Text style={styles.badgeTexto}>
            {classificacao.emoji} {classificacao.label}
          </Text>
        </View>
      </View>

      {/* BLOCO DO SCORE AUTOMÁTICO */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCirculo}>
          <Text style={styles.scoreValor}>{score}</Text>
          <Text style={styles.scoreTotal}>/100</Text>
          <Text style={styles.scoreSubtitulo}>Score do dia</Text>
        </View>

        <View style={styles.metasResumo}>
          <View style={styles.metaLinha}>
            <Text style={styles.metaNome}>🎯 Rotina ({concluidas}/{listaBlocos.length})</Text>
            <Text style={styles.metaPontos}>+{ptsRotina} pts</Text>
          </View>
          <View style={styles.metaLinha}>
            <Text style={styles.metaNome}>💧 Água ({agua}/{META_AGUA})</Text>
            <Text style={styles.metaPontos}>+{ptsAgua} pts</Text>
          </View>
          <View style={styles.metaLinha}>
            <Text style={styles.metaNome}>😴 Sono ({sonoNum ? `${sonoNum}h` : '—'})</Text>
            <Text style={styles.metaPontos}>+{ptsSono} pts</Text>
          </View>
          <View style={styles.metaLinha}>
            <Text style={styles.metaNome}>💊 Remédios</Text>
            <Text style={styles.metaPontos}>+{ptsRemedios} pts</Text>
          </View>
          <View style={styles.metaLinha}>
            <Text style={styles.metaNome}>🧘 Mente / Gratidão</Text>
            <Text style={styles.metaPontos}>+{ptsMente} pts</Text>
          </View>
        </View>
      </View>

      {/* SEÇÃO DA AVALIAÇÃO PESSOAL (1 a 10) */}
      <View style={styles.secaoAvaliacao}>
        <Text style={styles.subtituloSecao}>Sua nota pessoal para hoje (1 a 10):</Text>
        <Text style={styles.fraseNota}>{obterFraseNota(notaSelecionada)}</Text>

        <View style={styles.gradeNotas}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const estaAtivo = notaSelecionada === num;
            return (
              <TouchableOpacity
                key={num}
                style={[styles.btnNota, estaAtivo && styles.btnNotaAtivo]}
                onPress={() => selecionarNota(num)}
                activeOpacity={0.7}
              >
                <Text style={[styles.textoNota, estaAtivo && styles.textoNotaAtivo]}>
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* CAMPO DE REFLEXÃO FINAL */}
      <View style={styles.secaoReflexao}>
        <Text style={styles.labelReflexao}>Reflexão ou aprendizado do dia:</Text>
        <TextInput
          style={styles.inputReflexao}
          multiline
          placeholder="O que funcionou bem hoje? O que pode melhorar amanhã?"
          placeholderTextColor={colors.textMuted}
          value={reflexao}
          onChangeText={(texto) => onAvaliarDia(notaSelecionada, texto)}
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
  topoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cartaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  badgeClassificacao: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeTexto: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Score automático
  scoreContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCirculo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  scoreValor: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 30,
  },
  scoreTotal: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: -2,
  },
  scoreSubtitulo: {
    fontSize: 9,
    color: colors.textLight,
    fontWeight: '600',
  },
  metasResumo: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  metaLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaNome: {
    fontSize: 11,
    color: colors.textDark,
  },
  metaPontos: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Avaliação Pessoal
  secaoAvaliacao: {
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
    paddingTop: 14,
    marginBottom: 12,
  },
  subtituloSecao: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  fraseNota: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  gradeNotas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  btnNota: {
    width: '18%',
    aspectRatio: 1.1,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  btnNotaAtivo: {
    backgroundColor: colors.primary,
  },
  textoNota: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  textoNotaAtivo: {
    color: colors.white,
  },

  // Reflexão
  secaoReflexao: {
    marginTop: 4,
  },
  labelReflexao: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 6,
  },
  inputReflexao: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textDark,
    height: 70,
    textAlignVertical: 'top',
  },
});
