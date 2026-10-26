import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/colors';
import { useDiario } from '../hooks/useDiario';

import Header from '../components/Header';
import ResumoCard from '../components/ResumoCard';
import RotinaCard from '../components/RotinaCard';
import CuidadosCard from '../components/CuidadosCard';
import MenteCard from '../components/MenteCard';
import AvaliacaoDiaCard from '../components/AvaliacaoDiaCard';
import SemanaGraficoCard from '../components/SemanaGraficoCard';
import AcoesCard from '../components/AcoesCard';
import NavigationBar from '../components/NavigationBar';

export default function HomeScreen({ usuario }) {
  const [abaAtiva, setAbaAtiva] = useState('rotina');

  const {
    dataAtual,
    setDataAtual,
    dias,
    diaAtualDados,
    blocosAtuais,
    salvarBloco,
    removerBloco,
    mostrarDatePicker,
    setMostrarDatePicker,
    atualizarDiaAtual,
    alternarBloco,
    editarBloco,
    mudarAgua,
    escolherHumor,
    avaliarDia,
    limparDiaAtual,
    copiarResumoDia,
  } = useDiario(usuario?.uid);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primary} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CABEÇALHO E NAVEGAÇÃO DE DATAS */}
        <Header
          usuario={usuario}
          dataAtual={dataAtual}
          onMudarData={setDataAtual}
          mostrarDatePicker={mostrarDatePicker}
          setMostrarDatePicker={setMostrarDatePicker}
        />

        {/* ABA 1: ROTINA */}
        {abaAtiva === 'rotina' && (
          <View>
            <ResumoCard dadosDia={diaAtualDados} blocos={blocosAtuais} />
            <RotinaCard
              blocos={blocosAtuais}
              dadosDia={diaAtualDados}
              onAlternarBloco={alternarBloco}
              onEditarBloco={editarBloco}
              onSalvarBloco={salvarBloco}
              onRemoverBloco={removerBloco}
            />
            <AcoesCard
              onCopiarResumo={copiarResumoDia}
              onLimparDia={limparDiaAtual}
            />
          </View>
        )}

        {/* ABA 2: CUIDADOS */}
        {abaAtiva === 'cuidados' && (
          <View>
            <CuidadosCard
              dadosDia={diaAtualDados}
              onMudarAgua={mudarAgua}
              onAtualizarDia={atualizarDiaAtual}
              onEscolherHumor={escolherHumor}
            />
          </View>
        )}

        {/* ABA 3: MENTE */}
        {abaAtiva === 'mente' && (
          <View>
            <MenteCard
              dadosDia={diaAtualDados}
              onAtualizarDia={atualizarDiaAtual}
            />
          </View>
        )}

        {/* ABA 4: AVALIAÇÃO */}
        {abaAtiva === 'avaliacao' && (
          <View>
            <AvaliacaoDiaCard
              dadosDia={diaAtualDados}
              onAvaliarDia={avaliarDia}
              blocos={blocosAtuais}
            />
            <SemanaGraficoCard
              dataAtual={dataAtual}
              dias={dias}
              onSelecionarData={setDataAtual}
            />
            <AcoesCard
              onCopiarResumo={copiarResumoDia}
              onLimparDia={limparDiaAtual}
            />
          </View>
        )}
      </ScrollView>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <NavigationBar
        abaAtiva={abaAtiva}
        onMudarAba={setAbaAtiva}
      />
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
    paddingBottom: 20,
  },
});

