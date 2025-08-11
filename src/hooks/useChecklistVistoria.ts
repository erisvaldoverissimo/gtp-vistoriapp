import { useState, useMemo } from 'react';

export interface ManifestacaoPatologica {
  id: string;
  codigo: string;
  descricao: string;
}

export interface ElementoSistema {
  id: string;
  nome: string;
  tipos: string[];
  manifestacoes: ManifestacaoPatologica[];
}

export interface SistemaVistoria {
  id: string;
  nome: string;
  elementos: ElementoSistema[];
}

const DADOS_CHECKLIST: SistemaVistoria[] = [
  {
    id: '1',
    nome: 'SISTEMAS DE ELEMENTOS ESTRUTURAIS PASSÍVEIS DE VERIFICAÇÃO VISUAL',
    elementos: [
      {
        id: '1.1',
        nome: 'Pilares',
        tipos: ['Concreto armado', 'Blocos cimentícios', 'Metálico', 'Madeira', 'Alvenaria de pedra', 'Tijolos cerâmicos maciços', 'Pré-moldados', 'Gabião', 'Alvenaria', 'Vidro', 'Outro'],
        manifestacoes: [
          { id: '1.1.1', codigo: '1.1.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais' },
          { id: '1.1.2', codigo: '1.1.2', descricao: 'Irregularidades geométricas, falhas de concretagem' },
          { id: '1.1.3', codigo: '1.1.3', descricao: 'Armadura exposta' },
          { id: '1.1.4', codigo: '1.1.4', descricao: 'Deformações' },
          { id: '1.1.5', codigo: '1.1.5', descricao: 'Deterioração de materiais, destacamento, desagregação' },
          { id: '1.1.6', codigo: '1.1.6', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '1.1.7', codigo: '1.1.7', descricao: 'Segregação do concreto (bicheira, ninhos)' },
          { id: '1.1.8', codigo: '1.1.8', descricao: 'Infiltrações' },
          { id: '1.1.9', codigo: '1.1.9', descricao: 'Recalques' },
          { id: '1.1.10', codigo: '1.1.10', descricao: 'Colapso do solo' },
          { id: '1.1.11', codigo: '1.1.11', descricao: 'Corrosão metálica' },
          { id: '1.1.12', codigo: '1.1.12', descricao: 'Outro' }
        ]
      },
      {
        id: '1.2',
        nome: 'Vigas',
        tipos: ['Concreto armado', 'Blocos cimentícios', 'Metálico', 'Madeira', 'Alvenaria de pedra', 'Tijolos cerâmicos maciços', 'Pré-moldados', 'Gabião', 'Alvenaria', 'Vidro', 'Outro'],
        manifestacoes: [
          { id: '1.2.1', codigo: '1.2.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais' },
          { id: '1.2.2', codigo: '1.2.2', descricao: 'Irregularidades geométricas, falhas de concretagem' },
          { id: '1.2.3', codigo: '1.2.3', descricao: 'Armadura exposta' },
          { id: '1.2.4', codigo: '1.2.4', descricao: 'Deformações' },
          { id: '1.2.5', codigo: '1.2.5', descricao: 'Deterioração de materiais, destacamento, desagregação' },
          { id: '1.2.6', codigo: '1.2.6', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '1.2.7', codigo: '1.2.7', descricao: 'Segregação do concreto (bicheira, ninhos)' },
          { id: '1.2.8', codigo: '1.2.8', descricao: 'Infiltrações' },
          { id: '1.2.9', codigo: '1.2.9', descricao: 'Recalques' },
          { id: '1.2.10', codigo: '1.2.10', descricao: 'Colapso do solo' },
          { id: '1.2.11', codigo: '1.2.11', descricao: 'Corrosão metálica' },
          { id: '1.2.12', codigo: '1.2.12', descricao: 'Outro' }
        ]
      },
      {
        id: '1.3',
        nome: 'Lajes',
        tipos: ['Concreto armado', 'Blocos cimentícios', 'Metálico', 'Madeira', 'Alvenaria de pedra', 'Tijolos cerâmicos maciços', 'Pré-moldados', 'Gabião', 'Alvenaria', 'Vidro', 'Outro'],
        manifestacoes: [
          { id: '1.3.1', codigo: '1.3.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais' },
          { id: '1.3.2', codigo: '1.3.2', descricao: 'Irregularidades geométricas, falhas de concretagem' },
          { id: '1.3.3', codigo: '1.3.3', descricao: 'Armadura exposta' },
          { id: '1.3.4', codigo: '1.3.4', descricao: 'Deformações' },
          { id: '1.3.5', codigo: '1.3.5', descricao: 'Deterioração de materiais, destacamento, desagregação' },
          { id: '1.3.6', codigo: '1.3.6', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '1.3.7', codigo: '1.3.7', descricao: 'Segregação do concreto (bicheira, ninhos)' },
          { id: '1.3.8', codigo: '1.3.8', descricao: 'Infiltrações' },
          { id: '1.3.9', codigo: '1.3.9', descricao: 'Recalques' },
          { id: '1.3.10', codigo: '1.3.10', descricao: 'Colapso do solo' },
          { id: '1.3.11', codigo: '1.3.11', descricao: 'Corrosão metálica' },
          { id: '1.3.12', codigo: '1.3.12', descricao: 'Outro' }
        ]
      },
      {
        id: '1.4',
        nome: 'Marquises',
        tipos: ['Concreto armado', 'Blocos cimentícios', 'Metálico', 'Madeira', 'Alvenaria de pedra', 'Tijolos cerâmicos maciços', 'Pré-moldados', 'Gabião', 'Alvenaria', 'Vidro', 'Outro'],
        manifestacoes: [
          { id: '1.4.1', codigo: '1.4.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais' },
          { id: '1.4.2', codigo: '1.4.2', descricao: 'Irregularidades geométricas, falhas de concretagem' },
          { id: '1.4.3', codigo: '1.4.3', descricao: 'Armadura exposta' },
          { id: '1.4.4', codigo: '1.4.4', descricao: 'Deformações' },
          { id: '1.4.5', codigo: '1.4.5', descricao: 'Deterioração de materiais, destacamento, desagregação' },
          { id: '1.4.6', codigo: '1.4.6', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '1.4.7', codigo: '1.4.7', descricao: 'Segregação do concreto (bicheira, ninhos)' },
          { id: '1.4.8', codigo: '1.4.8', descricao: 'Infiltrações' },
          { id: '1.4.9', codigo: '1.4.9', descricao: 'Recalques' },
          { id: '1.4.10', codigo: '1.4.10', descricao: 'Colapso do solo' },
          { id: '1.4.11', codigo: '1.4.11', descricao: 'Corrosão metálica' },
          { id: '1.4.12', codigo: '1.4.12', descricao: 'Outro' }
        ]
      },
      {
        id: '1.5',
        nome: 'Contensões e arrimos',
        tipos: ['Concreto armado', 'Blocos cimentícios', 'Metálico', 'Madeira', 'Alvenaria de pedra', 'Tijolos cerâmicos maciços', 'Pré-moldados', 'Gabião', 'Alvenaria', 'Vidro', 'Outro'],
        manifestacoes: [
          { id: '1.5.1', codigo: '1.5.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais' },
          { id: '1.5.2', codigo: '1.5.2', descricao: 'Irregularidades geométricas, falhas de concretagem' },
          { id: '1.5.3', codigo: '1.5.3', descricao: 'Armadura exposta' },
          { id: '1.5.4', codigo: '1.5.4', descricao: 'Deformações' },
          { id: '1.5.5', codigo: '1.5.5', descricao: 'Deterioração de materiais, destacamento, desagregação' },
          { id: '1.5.6', codigo: '1.5.6', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '1.5.7', codigo: '1.5.7', descricao: 'Segregação do concreto (bicheira, ninhos)' },
          { id: '1.5.8', codigo: '1.5.8', descricao: 'Infiltrações' },
          { id: '1.5.9', codigo: '1.5.9', descricao: 'Recalques' },
          { id: '1.5.10', codigo: '1.5.10', descricao: 'Colapso do solo' },
          { id: '1.5.11', codigo: '1.5.11', descricao: 'Corrosão metálica' },
          { id: '1.5.12', codigo: '1.5.12', descricao: 'Outro' }
        ]
      },
      {
        id: '1.6',
        nome: 'Muros',
        tipos: ['Concreto armado', 'Blocos cimentícios', 'Metálico', 'Madeira', 'Alvenaria de pedra', 'Tijolos cerâmicos maciços', 'Pré-moldados', 'Gabião', 'Alvenaria', 'Vidro', 'Outro'],
        manifestacoes: [
          { id: '1.6.1', codigo: '1.6.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais' },
          { id: '1.6.2', codigo: '1.6.2', descricao: 'Irregularidades geométricas, falhas de concretagem' },
          { id: '1.6.3', codigo: '1.6.3', descricao: 'Armadura exposta' },
          { id: '1.6.4', codigo: '1.6.4', descricao: 'Deformações' },
          { id: '1.6.5', codigo: '1.6.5', descricao: 'Deterioração de materiais, destacamento, desagregação' },
          { id: '1.6.6', codigo: '1.6.6', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '1.6.7', codigo: '1.6.7', descricao: 'Segregação do concreto (bicheira, ninhos)' },
          { id: '1.6.8', codigo: '1.6.8', descricao: 'Infiltrações' },
          { id: '1.6.9', codigo: '1.6.9', descricao: 'Recalques' },
          { id: '1.6.10', codigo: '1.6.10', descricao: 'Colapso do solo' },
          { id: '1.6.11', codigo: '1.6.11', descricao: 'Corrosão metálica' },
          { id: '1.6.12', codigo: '1.6.12', descricao: 'Outro' }
        ]
      }
    ]
  },
  {
    id: '2',
    nome: 'SISTEMAS DE VEDAÇÃO E REVESTIMENTOS',
    elementos: [
      {
        id: '2.1',
        nome: 'Paredes externas e internas',
        tipos: ['Concreto armado', 'Alvenaria', 'Blocos cimentícios', 'Madeira', 'Placa cimentícia', 'Pano de vidro', 'Gesso acartonado', 'Pedra', 'Substrato de reboco', 'Elemento cerâmico', 'Película de pintura', 'Outro'],
        manifestacoes: [
          { id: '2.1.1', codigo: '2.1.1', descricao: 'Formação de fissuras por sobrecargas, movimentações estruturais ou higrotérmicas, reações químicas, falhas construtivas' },
          { id: '2.1.2', codigo: '2.1.2', descricao: 'Infiltração de umidade' },
          { id: '2.1.3', codigo: '2.1.3', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '2.1.4', codigo: '2.1.4', descricao: 'Deterioração dos materiais, destacamento, empolamento, pulverulência' },
          { id: '2.1.5', codigo: '2.1.5', descricao: 'Irregularidades geométricas, fora de prumo/nível' },
          { id: '2.1.6', codigo: '2.1.6', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '2.1.7', codigo: '2.1.7', descricao: 'Manchamento, vesículas, descoloração da pintura, sujidades' },
          { id: '2.1.8', codigo: '2.1.8', descricao: 'Ineficiência no rejuntamento/emendas' },
          { id: '2.1.9', codigo: '2.1.9', descricao: 'Outro' }
        ]
      },
      {
        id: '2.3',
        nome: 'Pisos',
        tipos: ['Cerâmico', 'Laminado', 'Pedra', 'Cimento queimado', 'Concreto armado', 'Madeira', 'PVC', 'Outro'],
        manifestacoes: [
          { id: '2.3.1', codigo: '2.3.1', descricao: 'Formação de fissuras por sobrecargas, movimentações estruturais ou higrotérmicas, reações químicas, falhas construtivas' },
          { id: '2.3.2', codigo: '2.3.2', descricao: 'Infiltração de umidade' },
          { id: '2.3.3', codigo: '2.3.3', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '2.3.4', codigo: '2.3.4', descricao: 'Deterioração dos materiais, destacamento, empolamento, pulverulência' },
          { id: '2.3.5', codigo: '2.3.5', descricao: 'Irregularidades geométricas, fora de prumo/nível' },
          { id: '2.3.6', codigo: '2.3.6', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '2.3.7', codigo: '2.3.7', descricao: 'Manchamento, vesículas, descoloração da pintura, sujidades' },
          { id: '2.3.8', codigo: '2.3.8', descricao: 'Ineficiência no rejuntamento/emendas' },
          { id: '2.3.9', codigo: '2.3.9', descricao: 'Outro' }
        ]
      },
      {
        id: '2.4',
        nome: 'Forros',
        tipos: ['Gesso', 'PVC', 'Placa cimentícia', 'Madeira', 'Concreto armado', 'Outro'],
        manifestacoes: [
          { id: '2.4.1', codigo: '2.4.1', descricao: 'Formação de fissuras por sobrecargas, movimentações estruturais ou higrotérmicas, reações químicas, falhas construtivas' },
          { id: '2.4.2', codigo: '2.4.2', descricao: 'Infiltração de umidade' },
          { id: '2.4.3', codigo: '2.4.3', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '2.4.4', codigo: '2.4.4', descricao: 'Deterioração dos materiais, destacamento, empolamento, pulverulência' },
          { id: '2.4.5', codigo: '2.4.5', descricao: 'Irregularidades geométricas, fora de prumo/nível' },
          { id: '2.4.6', codigo: '2.4.6', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '2.4.7', codigo: '2.4.7', descricao: 'Manchamento, vesículas, descoloração da pintura, sujidades' },
          { id: '2.4.8', codigo: '2.4.8', descricao: 'Ineficiência no rejuntamento/emendas' },
          { id: '2.4.9', codigo: '2.4.9', descricao: 'Outro' }
        ]
      }
    ]
  },
  {
    id: '3',
    nome: 'SISTEMAS DE ESQUADRIAS',
    elementos: [
      {
        id: '3.1',
        nome: 'Janelas',
        tipos: ['Alumínio', 'PVC', 'Madeira', 'Vidro temperado', 'Metálica', 'Outro'],
        manifestacoes: [
          { id: '3.1.1', codigo: '3.1.1', descricao: 'Vedação deficiente' },
          { id: '3.1.2', codigo: '3.1.2', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '3.1.3', codigo: '3.1.3', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '3.1.4', codigo: '3.1.4', descricao: 'Ineficiência no deslizamento/abertura, trincos/fechamento' },
          { id: '3.1.5', codigo: '3.1.5', descricao: 'Fixação deficiente' },
          { id: '3.1.6', codigo: '3.1.6', descricao: 'Vibração' },
          { id: '3.1.7', codigo: '3.1.7', descricao: 'Irregularidades geométricas, fora de prumo/nível/esquadro' },
          { id: '3.1.8', codigo: '3.1.8', descricao: 'Manchamento, sujidades' }
        ]
      },
      {
        id: '3.2',
        nome: 'Portas, portões e guarda-corpos',
        tipos: ['Alumínio', 'PVC', 'Madeira', 'Vidro temperado', 'Metálica', 'Outro'],
        manifestacoes: [
          { id: '3.2.1', codigo: '3.2.1', descricao: 'Vedação deficiente' },
          { id: '3.2.2', codigo: '3.2.2', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '3.2.3', codigo: '3.2.3', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '3.2.4', codigo: '3.2.4', descricao: 'Ineficiência no deslizamento/abertura, trincos/fechamento' },
          { id: '3.2.5', codigo: '3.2.5', descricao: 'Fixação deficiente' },
          { id: '3.2.6', codigo: '3.2.6', descricao: 'Vibração' },
          { id: '3.2.7', codigo: '3.2.7', descricao: 'Irregularidades geométricas, fora de prumo/nível/esquadro' },
          { id: '3.2.8', codigo: '3.2.8', descricao: 'Manchamento, sujidades' }
        ]
      }
    ]
  }
  // ... continuar com os demais sistemas
];

export const useChecklistVistoria = () => {
  const [sistemasSelecionados, setSistemasSelecionados] = useState<string[]>([]);
  
  const sistemasDisponiveis = useMemo(() => DADOS_CHECKLIST, []);
  
  const obterElementosPorSistema = (sistemaId: string): ElementoSistema[] => {
    const sistema = DADOS_CHECKLIST.find(s => s.id === sistemaId);
    return sistema?.elementos || [];
  };
  
  const obterManifestacoesPorElemento = (sistemaId: string, elementoId: string): ManifestacaoPatologica[] => {
    const sistema = DADOS_CHECKLIST.find(s => s.id === sistemaId);
    const elemento = sistema?.elementos.find(e => e.id === elementoId);
    return elemento?.manifestacoes || [];
  };
  
  const obterTiposPorElemento = (sistemaId: string, elementoId: string): string[] => {
    const sistema = DADOS_CHECKLIST.find(s => s.id === sistemaId);
    const elemento = sistema?.elementos.find(e => e.id === elementoId);
    return elemento?.tipos || [];
  };
  
  return {
    sistemasDisponiveis,
    sistemasSelecionados,
    setSistemasSelecionados,
    obterElementosPorSistema,
    obterManifestacoesPorElemento,
    obterTiposPorElemento
  };
};