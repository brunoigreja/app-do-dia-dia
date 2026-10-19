import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { BLOCOS_PADRAO } from '../constants/routine';
import BlocoItem from './BlocoItem';
import ModalEditarBloco from './ModalEditarBloco';

export default function RotinaCard({
  blocos = BLOCOS_PADRAO,
  dadosDia,
  onAlternarBloco,
  onEditarBloco,
  onSalvarBloco,
  onRemoverBloco,
}) {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [blocoParaEditar, setBlocoParaEditar] = useState(null);

  const abrirAdicionar = () => {
    setBlocoParaEditar(null);
    setModalVisivel(true);
  };

  const abrirEditar = (bloco) => {
    setBlocoParaEditar(bloco);
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setBlocoParaEditar(null);
  };

  return (
    <View style={styles.cartao}>
      {/* CABEÇALHO DO CARD COM BOTÃO DE NOVA ATIVIDADE */}
      <View style={styles.topoCard}>
        <Text style={styles.cartaoTitulo}>Rotina do dia</Text>
        <TouchableOpacity
          style={styles.btnAdicionarTopo}
          onPress={abrirAdicionar}
          activeOpacity={0.7}
        >
          <Text style={styles.btnAdicionarTexto}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE ATIVIDADES */}
      {blocos.map((bloco) => {
        const dadosBloco = dadosDia?.blocos?.[bloco.id] || {};
        return (
          <BlocoItem
            key={bloco.id}
            bloco={bloco}
            dadosBloco={dadosBloco}
            onAlternar={onAlternarBloco}
            onEditar={onEditarBloco}
            onEditarAtividade={abrirEditar}
          />
        );
      })}

      {/* BOTÃO ADICIONAL NO FINAL DA LISTA */}
      <TouchableOpacity
        style={styles.btnAdicionarRodape}
        onPress={abrirAdicionar}
        activeOpacity={0.7}
      >
        <Text style={styles.btnAdicionarRodapeTexto}>➕ Adicionar atividade</Text>
      </TouchableOpacity>

      {/* MODAL DE EDIÇÃO / CRIAÇÃO DE ATIVIDADE */}
      <ModalEditarBloco
        visivel={modalVisivel}
        blocoParaEditar={blocoParaEditar}
        onSalvar={(bloco, aplicarPadrao) => {
          if (onSalvarBloco) onSalvarBloco(bloco, aplicarPadrao);
        }}
        onExcluir={(id, aplicarPadrao) => {
          if (onRemoverBloco) onRemoverBloco(id, aplicarPadrao);
        }}
        onFechar={fecharModal}
      />
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
    marginBottom: 12,
  },
  cartaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  btnAdicionarTopo: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  btnAdicionarTexto: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnAdicionarRodape: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAdicionarRodapeTexto: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
