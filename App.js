import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';

// Configuração padrão da rotina
const BLOCOS_PADRAO = [
  { id: 'academia', nome: 'Academia', icone: '🏋️', tipo: 'treino', ini: '06:00', fim: '07:00' },
  { id: 'cafe', nome: 'Café da manhã', icone: '🥣', tipo: 'refeicao', ini: '07:15', fim: '07:45' },
  { id: 'trab1', nome: 'Trabalho (manhã)', icone: '💼', tipo: 'foco', ini: '08:00', fim: '12:00' },
  { id: 'almoco', nome: 'Almoço', icone: '🍽️', tipo: 'refeicao', ini: '12:00', fim: '13:00' },
  { id: 'trab2', nome: 'Trabalho (tarde)', icone: '💼', tipo: 'foco', ini: '13:00', fim: '17:00' },
  { id: 'pilates', nome: 'Pilates', icone: '🧘', tipo: 'treino', ini: '17:30', fim: '18:30' },
  { id: 'jantar', nome: 'Jantar', icone: '🍲', tipo: 'refeicao', ini: '19:00', fim: '20:00' },
  { id: 'devclub', nome: 'Estudo de programação', icone: '💻', tipo: 'foco', ini: '20:00', fim: '22:00' },
  { id: 'dormir', nome: 'Hora de dormir', icone: '🌙', tipo: 'descanso', ini: '22:30', fim: '' },
];

const META_AGUA = 8;
const HUMORES = [
  { emoji: '😞', label: 'Muito mal' },
  { emoji: '🙁', label: 'Mal' },
  { emoji: '😐', label: 'Mais ou menos' },
  { emoji: '🙂', label: 'Bem' },
  { emoji: '😄', label: 'Muito bem' },
];

// Funções utilitárias de data e hora
function paraTexto(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

function hoje() {
  return paraTexto(new Date());
}

function paraData(texto) {
  const p = texto.split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function somarDias(texto, n) {
  const d = paraData(texto);
  d.setDate(d.getDate() + n);
  return paraTexto(d);
}

function dataBonita(texto) {
  return paraData(texto).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function minutos(hhmm) {
  if (!hhmm) return null;
  const p = hhmm.split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}

function duracaoMin(ini, fim) {
  const a = minutos(ini), b = minutos(fim);
  if (a === null || b === null || b <= a) return 0;
  return b - a;
}

function formatarHoras(min) {
  if (!min) return '—';
  const hh = Math.floor(min / 60);
  const mm = min % 60;
  return `${hh}h${mm ? String(mm).padStart(2, '0') : ''}`;
}

function criarDiaVazio() {
  const d = { blocos: {}, agua: 0, sono: '', humor: 0, remedios: false, prioridades: ['', '', ''], gratidao: '', notas: '' };
  BLOCOS_PADRAO.forEach((b) => {
    d.blocos[b.id] = { feito: false, ini: b.ini, fim: b.fim, nota: '' };
  });
  return d;
}

export default function App() {
  const [dias, setDias] = useState({});
  const [dataAtual, setDataAtual] = useState(hoje());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem('@diario_do_dia');
        if (json) setDias(JSON.parse(json));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Salvar sempre que "dias" mudar
  const salvarDados = async (novosDias) => {
    setDias(novosDias);
    try {
      await AsyncStorage.setItem('@diario_do_dia', JSON.stringify(novosDias));
    } catch (e) {
      console.error(e);
    }
  };

  const diaAtualDados = dias[dataAtual] || criarDiaVazio();

  const atualizarDiaAtual = (novosAtributos) => {
    const atualizado = { ...diaAtualDados, ...novosAtributos };
    salvarDados({ ...dias, [dataAtual]: atualizado });
  };

  // Cálculos de progresso
  const calcularPorcentagem = (dadosDia) => {
    if (!dadosDia || !dadosDia.blocos) return 0;
    const feitos = BLOCOS_PADRAO.filter((b) => dadosDia.blocos[b.id]?.feito).length;
    return Math.round((feitos / BLOCOS_PADRAO.length) * 100);
  };

  const somaTipo = (tipo, soConcluidos) => {
    return BLOCOS_PADRAO.filter((b) => b.tipo === tipo).reduce((soma, b) => {
      const x = diaAtualDados.blocos[b.id];
      if (!x) return soma;
      if (soConcluidos && !x.feito) return soma;
      return soma + duracaoMin(x.ini, x.fim);
    }, 0);
  };

  // Ações
  const alternarBloco = (id) => {
    const blocosAtualizados = {
      ...diaAtualDados.blocos,
      [id]: { ...diaAtualDados.blocos[id], feito: !diaAtualDados.blocos[id]?.feito },
    };
    atualizarDiaAtual({ blocos: blocosAtualizados });
  };

  const editarBloco = (id, campo, valor) => {
    const blocosAtualizados = {
      ...diaAtualDados.blocos,
      [id]: { ...diaAtualDados.blocos[id], [campo]: valor },
    };
    atualizarDiaAtual({ blocos: blocosAtualizados });
  };

  const mudarAgua = (delta) => {
    const novaAgua = Math.max(0, Math.min(20, (diaAtualDados.agua || 0) + delta));
    atualizarDiaAtual({ agua: novaAgua });
  };

  const escolherHumor = (n) => {
    const novoHumor = diaAtualDados.humor === n ? 0 : n;
    atualizarDiaAtual({ humor: novoHumor });
  };

  const limparDia = () => {
    Alert.alert('Limpar dia', 'Tem certeza que deseja apagar todos os registros deste dia?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: () => {
          const novosDias = { ...dias };
          delete novosDias[dataAtual];
          salvarDados(novosDias);
        },
      },
    ]);
  };

  const copiarResumo = async () => {
    const pct = calcularPorcentagem(diaAtualDados);
    let linhas = [`Diário do dia — ${dataBonita(dataAtual)}`, `Concluído: ${pct}% da rotina`, ''];

    BLOCOS_PADRAO.forEach((b) => {
      const x = diaAtualDados.blocos[b.id] || {};
      const horario = x.ini + (x.fim ? `–${x.fim}` : '');
      linhas.push(`${x.feito ? '✔ ' : '✘ '}${b.nome} (${horario})${x.nota ? ' — ' + x.nota : ''}`);
    });

    linhas.push('');
    linhas.push(
      `Água: ${diaAtualDados.agua || 0} copos | Sono: ${diaAtualDados.sono ? diaAtualDados.sono + 'h' : '—'} | Humor: ${
        diaAtualDados.humor ? HUMORES[diaAtualDados.humor - 1].emoji : '—'
      }`
    );

    const prio = (diaAtualDados.prioridades || []).filter(Boolean);
    if (prio.length) linhas.push(`Prioridades: ${prio.join(' / ')}`);
    if (diaAtualDados.gratidao) linhas.push(`Gratidão: ${diaAtualDados.gratidao}`);
    if (diaAtualDados.notas) linhas.push(`Notas: ${diaAtualDados.notas}`);

    await Clipboard.setStringAsync(linhas.join('\n'));
    Alert.alert('Copiado!', 'O resumo do dia foi copiado para a área de transferência.');
  };

  const pctAtual = calcularPorcentagem(diaAtualDados);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitulo}>📓 Diário do dia</Text>
          <Text style={styles.headerSubtitulo}>Planeje, marque e acompanhe seu dia.</Text>

          <View style={styles.navDatas}>
            <TouchableOpacity style={styles.btnNav} onPress={() => setDataAtual(somarDias(dataAtual, -1))}>
              <Text style={styles.btnNavTexto}>◀ Ant.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDataPicker} onPress={() => setMostrarDatePicker(true)}>
              <Text style={styles.btnDataTexto}>{dataAtual}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnNav} onPress={() => setDataAtual(hoje())}>
              <Text style={styles.btnNavTexto}>Hoje</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnNav} onPress={() => setDataAtual(somarDias(dataAtual, 1))}>
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
                if (selectedDate) setDataAtual(paraTexto(selectedDate));
              }}
            />
          )}
        </View>

        {/* RESUMO */}
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Resumo do dia</Text>

          <View style={styles.numerosGrid}>
            <View style={styles.numeroBox}>
              <Text style={styles.numeroDestaque}>
                {BLOCOS_PADRAO.filter((b) => diaAtualDados.blocos[b.id]?.feito).length}/{BLOCOS_PADRAO.length}
              </Text>
              <Text style={styles.numeroRotulo}>concluídas</Text>
            </View>

            <View style={styles.numeroBox}>
              <Text style={styles.numeroDestaque}>{formatarHoras(somaTipo('foco', true))}</Text>
              <Text style={styles.numeroRotulo}>de foco ({formatarHoras(somaTipo('foco', false))})</Text>
            </View>

            <View style={styles.numeroBox}>
              <Text style={styles.numeroDestaque}>{formatarHoras(somaTipo('treino', true))}</Text>
              <Text style={styles.numeroRotulo}>de treino ({formatarHoras(somaTipo('treino', false))})</Text>
            </View>
          </View>

          {/* Barra de Progresso */}
          <View style={styles.barraFundo}>
            <View style={[styles.barraProgresso, { width: `${pctAtual}%` }]} />
          </View>
          <Text style={styles.fraseStatus}>
            {pctAtual === 100
              ? '🎉 Dia completo! Você cumpriu toda a rotina.'
              : pctAtual >= 60
              ? 'Muito bem, você está na reta final do dia.'
              : pctAtual > 0
              ? 'Você já começou, e cada passo conta.'
              : 'Marque as atividades conforme for concluindo.'}
          </Text>
        </View>

        {/* ROTINA / BLOCOS */}
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Rotina do dia</Text>

          {BLOCOS_PADRAO.map((b) => {
            const x = diaAtualDados.blocos[b.id] || {};
            const estaFeito = x.feito;
            const duracao = duracaoMin(x.ini, x.fim);

            return (
              <View
                key={b.id}
                style={[
                  styles.blocoCard,
                  styles[`tipo_${b.tipo}`],
                  estaFeito && styles.blocoFeito,
                ]}
              >
                <TouchableOpacity style={styles.blocoTopo} onPress={() => alternarBloco(b.id)}>
                  <Text style={styles.checkboxEmoji}>{estaFeito ? '✅' : '⬜'}</Text>
                  <Text style={[styles.blocoNome, estaFeito && styles.textoRiscado]}>
                    {b.icone} {b.nome}
                  </Text>
                  {duracao > 0 && <Text style={styles.duracaoBadge}>{formatarHoras(duracao)}</Text>}
                </TouchableOpacity>

                <View style={styles.horariosRow}>
                  <View style={styles.horarioInputWrap}>
                    <Text style={styles.labelPequeno}>Início</Text>
                    <TextInput
                      style={styles.inputHora}
                      value={x.ini}
                      placeholder="00:00"
                      onChangeText={(v) => editarBloco(b.id, 'ini', v)}
                    />
                  </View>
                  <View style={styles.horarioInputWrap}>
                    <Text style={styles.labelPequeno}>Fim</Text>
                    <TextInput
                      style={styles.inputHora}
                      value={x.fim}
                      placeholder="00:00"
                      onChangeText={(v) => editarBloco(b.id, 'fim', v)}
                    />
                  </View>
                </View>

                <TextInput
                  style={styles.inputAnotacao}
                  placeholder="Anotação (opcional)"
                  value={x.nota}
                  onChangeText={(v) => editarBloco(b.id, 'nota', v)}
                />
              </View>
            );
          })}
        </View>

        {/* CUIDADOS COM VOCÊ */}
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Cuidados com você</Text>

          {/* Água */}
          <View style={styles.linhaFlex}>
            <Text style={styles.labelBold}>💧 Água:</Text>
            <TouchableOpacity style={styles.btnContador} onPress={() => mudarAgua(-1)}>
              <Text style={styles.btnContadorTexto}>−</Text>
            </TouchableOpacity>
            <Text style={styles.valorContador}>
              {diaAtualDados.agua || 0} / {META_AGUA} copos
            </Text>
            <TouchableOpacity style={styles.btnContador} onPress={() => mudarAgua(1)}>
              <Text style={styles.btnContadorTexto}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Sono */}
          <View style={styles.linhaFlex}>
            <Text style={styles.labelBold}>😴 Horas de sono:</Text>
            <TextInput
              style={[styles.inputTexto, { width: 80, textAlign: 'center' }]}
              keyboardType="numeric"
              placeholder="Ex.: 7"
              value={String(diaAtualDados.sono || '')}
              onChangeText={(v) => atualizarDiaAtual({ sono: v })}
            />
          </View>

          {/* Humor */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.labelBold}>Humor:</Text>
            <View style={styles.humorRow}>
              {HUMORES.map((hm, idx) => {
                const n = idx + 1;
                const selecionado = diaAtualDados.humor === n;
                return (
                  <TouchableOpacity
                    key={n}
                    style={[styles.btnHumor, selecionado && styles.btnHumorAtivo]}
                    onPress={() => escolherHumor(n)}
                  >
                    <Text style={{ fontSize: 24 }}>{hm.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Remédios */}
          <View style={[styles.linhaFlex, { marginTop: 15 }]}>
            <Text style={styles.labelBold}>💊 Remédios e vitaminas:</Text>
            <Switch
              value={!!diaAtualDados.remedios}
              onValueChange={(val) => atualizarDiaAtual({ remedios: val })}
              trackColor={{ false: '#767577', true: '#1E3A6B' }}
            />
          </View>
        </View>

        {/* CABEÇA E CORAÇÃO */}
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Cabeça e coração</Text>

          <Text style={styles.labelBold}>Prioridades de hoje:</Text>
          {[0, 1, 2].map((idx) => (
            <TextInput
              key={idx}
              style={[styles.inputTexto, { marginBottom: 6 }]}
              placeholder={`${idx + 1}ª prioridade`}
              value={(diaAtualDados.prioridades || [])[idx] || ''}
              onChangeText={(v) => {
                const p = [...(diaAtualDados.prioridades || ['', '', ''])];
                p[idx] = v;
                atualizarDiaAtual({ prioridades: p });
              }}
            />
          ))}

          <Text style={[styles.labelBold, { marginTop: 10 }]}>Pelo que sou grato hoje:</Text>
          <TextInput
            style={styles.inputTexto}
            placeholder="Sua gratidão de hoje..."
            value={diaAtualDados.gratidao || ''}
            onChangeText={(v) => atualizarDiaAtual({ gratidao: v })}
          />

          <Text style={[styles.labelBold, { marginTop: 10 }]}>Anotações do dia:</Text>
          <TextInput
            style={[styles.inputTexto, { height: 80, textAlignVertical: 'top' }]}
            multiline
            placeholder="Anotações gerais..."
            value={diaAtualDados.notas || ''}
            onChangeText={(v) => atualizarDiaAtual({ notas: v })}
          />
        </View>

        {/* ÚLTIMOS 7 DIAS (GRÁFICO) */}
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Últimos 7 dias</Text>
          <View style={styles.semanaGrafico}>
            {[6, 5, 4, 3, 2, 1, 0].map((i) => {
              const t = somarDias(dataAtual, -i);
              const pct = calcularPorcentagem(dias[t]);
              const eAtual = t === dataAtual;
              const nomeDia = paraData(t).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

              return (
                <TouchableOpacity
                  key={t}
                  style={styles.colunaGraficoWrap}
                  onPress={() => setDataAtual(t)}
                >
                  <Text style={styles.pctColunaText}>{pct}%</Text>
                  <View style={styles.colunaFundoBarra}>
                    <View
                      style={[
                        styles.colunaPreenchimento,
                        { height: `${Math.max(pct, 5)}%` },
                        eAtual && styles.colunaAtual,
                      ]}
                    />
                  </View>
                  <Text style={[styles.nomeDiaText, eAtual && styles.nomeDiaAtual]}>{nomeDia}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* BOTÕES DE AÇÃO */}
        <View style={styles.acoesContainer}>
          <TouchableOpacity style={styles.btnAcaoPrincipal} onPress={copiarResumo}>
            <Text style={styles.btnAcaoTexto}>Copiar resumo do dia</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnAcaoDiscreto} onPress={limparDia}>
            <Text style={styles.btnAcaoDiscretoTexto}>Limpar este dia</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.rodape}>
          Seus dados ficam salvos offline no próprio aparelho.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F6FB' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Header
  header: {
    backgroundColor: '#1E3A6B',
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  headerTitulo: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitulo: { fontSize: 13, color: '#DCE6F3', marginBottom: 14 },
  navDatas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnNav: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btnNavTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  btnDataPicker: { backgroundColor: '#FFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  btnDataTexto: { color: '#1E3A6B', fontWeight: 'bold' },

  // Cartões
  cartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cartaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1E3A6B', marginBottom: 12 },

  // Resumo
  numerosGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  numeroBox: { flex: 1, backgroundColor: '#DCE6F3', borderRadius: 10, padding: 8, alignItems: 'center', marginHorizontal: 3 },
  numeroDestaque: { fontSize: 16, fontWeight: 'bold', color: '#12254A' },
  numeroRotulo: { fontSize: 10, color: '#14233C', textAlign: 'center' },
  barraFundo: { height: 12, backgroundColor: '#DCE6F3', borderRadius: 6, overflow: 'hidden' },
  barraProgresso: { height: '100%', backgroundColor: '#1E3A6B' },
  fraseStatus: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#14233C' },

  // Blocos da Rotina
  blocoCard: {
    backgroundColor: '#F2F6FB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#1E3A6B',
  },
  tipo_treino: { borderLeftColor: '#2E7D6B' },
  tipo_foco: { borderLeftColor: '#1E3A6B' },
  tipo_refeicao: { borderLeftColor: '#D9962B' },
  tipo_descanso: { borderLeftColor: '#6B5FA8' },
  blocoFeito: { backgroundColor: '#E6F2EE' },
  blocoTopo: { flexDirection: 'row', alignItems: 'center' },
  checkboxEmoji: { fontSize: 18, marginRight: 8 },
  blocoNome: { flex: 1, fontSize: 15, fontWeight: 'bold', color: '#14233C' },
  textoRiscado: { textDecorationLine: 'line-through', opacity: 0.6 },
  duracaoBadge: { backgroundColor: '#DCE6F3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 11, fontWeight: 'bold' },

  horariosRow: { flexDirection: 'row', marginTop: 8, gap: 10 },
  horarioInputWrap: { flex: 1 },
  labelPequeno: { fontSize: 10, color: '#666', marginBottom: 2 },
  inputHora: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#9FB4CF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
  inputAnotacao: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#9FB4CF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, marginTop: 8 },

  // Cuidados & Campos
  linhaFlex: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, justifyContent: 'space-between' },
  labelBold: { fontSize: 14, fontWeight: 'bold', color: '#14233C' },
  btnContador: { backgroundColor: '#DCE6F3', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnContadorTexto: { fontSize: 18, fontWeight: 'bold', color: '#1E3A6B' },
  valorContador: { fontSize: 14, fontWeight: 'bold' },

  humorRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  btnHumor: { backgroundColor: '#DCE6F3', padding: 8, borderRadius: 10 },
  btnHumorAtivo: { backgroundColor: '#E9B44C' },

  inputTexto: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#9FB4CF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: '#14233C' },

  // Gráfico Semana
  semanaGrafico: { flexDirection: 'row', height: 130, alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 10 },
  colunaGraficoWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  pctColunaText: { fontSize: 9, color: '#666', marginBottom: 2 },
  colunaFundoBarra: { width: 14, flex: 1, justifyContent: 'flex-end', backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' },
  colunaPreenchimento: { width: '100%', backgroundColor: '#8DB7E3', borderRadius: 6 },
  colunaAtual: { backgroundColor: '#1E3A6B' },
  nomeDiaText: { fontSize: 10, color: '#666', marginTop: 4 },
  nomeDiaAtual: { fontWeight: 'bold', color: '#1E3A6B' },

  // Ações
  acoesContainer: { gap: 10, marginVertical: 10 },
  btnAcaoPrincipal: { backgroundColor: '#1E3A6B', paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  btnAcaoTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnAcaoDiscreto: { borderBottomWidth: 1, borderBottomColor: '#8A3B3B', paddingVertical: 8, alignItems: 'center' },
  btnAcaoDiscretoTexto: { color: '#8A3B3B', fontWeight: 'bold', fontSize: 13 },
  rodape: { textAlign: 'center', fontSize: 11, color: '#777', marginTop: 10 },
});