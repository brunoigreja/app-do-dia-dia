import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/colors';
import { useDiario } from '../hooks/useDiario';

import Header from '../components/Header';
import ResumoCard from '../components/ResumoCard';
import RotinaCard from '../components/RotinaCard';
import CuidadosCard from '../components/CuidadosCard';
import MenteCard from '../components/MenteCard';
import SemanaGraficoCard from '../components/SemanaGraficoCard';
import AcoesCard from '../components/AcoesCard';

export default function HomeScreen() {
  const {
    dataAtual,
    setDataAtual,
    dias,
    diaAtualDados,
    mostrarDatePicker,
    setMostrarDatePicker,
    atualizarDiaAtual,
    alternarBloco,
    editarBloco,
    mudarAgua,
    escolherHumor,
    limparDiaAtual,
    copiarResumoDia,
  } = useDiario();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CABEÇALHO E NAVEGAÇÃO DE DATAS */}
        <Header
          dataAtual={dataAtual}
          onMudarData={setDataAtual}
          mostrarDatePicker={mostrarDatePicker}
          setMostrarDatePicker={setMostrarDatePicker}
        />

        {/* RESUMO GERAL DO DIA */}
        <ResumoCard dadosDia={diaAtualDados} />

        {/* ROTINA / BLOCOS DO DIA */}
        <RotinaCard
          dadosDia={diaAtualDados}
          onAlternarBloco={alternarBloco}
          onEditarBloco={editarBloco}
        />

        {/* CUIDADOS PESSOAIS (Água, Sono, Humor, Remédios) */}
        <CuidadosCard
          dadosDia={diaAtualDados}
          onMudarAgua={mudarAgua}
          onAtualizarDia={atualizarDiaAtual}
          onEscolherHumor={escolherHumor}
        />

        {/* CABEÇA E CORAÇÃO (Prioridades, Gratidão, Notas) */}
        <MenteCard
          dadosDia={diaAtualDados}
          onAtualizarDia={atualizarDiaAtual}
        />

        {/* HISTÓRICO / GRÁFICO DOS ÚLTIMOS 7 DIAS */}
        <SemanaGraficoCard
          dataAtual={dataAtual}
          dias={dias}
          onSelecionarData={setDataAtual}
        />

        {/* BOTÕES DE AÇÃO E RODAPÉ */}
        <AcoesCard
          onCopiarResumo={copiarResumoDia}
          onLimparDia={limparDiaAtual}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
