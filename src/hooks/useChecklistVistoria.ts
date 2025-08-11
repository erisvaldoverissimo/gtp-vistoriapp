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
  },
  {
    id: '4',
    nome: 'SISTEMAS DE COBERTURA',
    elementos: [
      {
        id: '4.1',
        nome: 'Telhamento',
        tipos: ['Cerâmico', 'Fibrocimento', 'Metálico', 'Vidro temperado', 'Madeira', 'PVC', 'Concreto', 'Alumínio', 'Fibra de vidro', 'Pré-moldada', 'Outro'],
        manifestacoes: [
          { id: '4.1.1', codigo: '4.1.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais, assentamento plástico' },
          { id: '4.1.2', codigo: '4.1.2', descricao: 'Irregularidades geométricas, deformações excessivas' },
          { id: '4.1.3', codigo: '4.1.3', descricao: 'Falha nos elementos de fixação' },
          { id: '4.1.4', codigo: '4.1.4', descricao: 'Desagregação de elementos, partes soltas, partes quebradas, trincas' },
          { id: '4.1.5', codigo: '4.1.5', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '4.1.6', codigo: '4.1.6', descricao: 'Degradação do material, oxidação/corrosão, apodrecimento' },
          { id: '4.1.7', codigo: '4.1.7', descricao: 'Perda de estanqueidade, porosidade excessiva' },
          { id: '4.1.8', codigo: '4.1.8', descricao: 'Manchamento, sujidades' },
          { id: '4.1.9', codigo: '4.1.9', descricao: 'Deterioração do concreto, destacamento, desagregação, segregação' },
          { id: '4.1.10', codigo: '4.1.10', descricao: 'Ataque de pragas biológicas' },
          { id: '4.1.11', codigo: '4.1.11', descricao: 'Ineficiência nas emendas' },
          { id: '4.1.12', codigo: '4.1.12', descricao: 'Impermeabilização ineficiente, infiltrações' },
          { id: '4.1.13', codigo: '4.1.13', descricao: 'Subdimensionamento' },
          { id: '4.1.14', codigo: '4.1.14', descricao: 'Obstrução por sujidades' },
          { id: '4.1.15', codigo: '4.1.15', descricao: 'Outro' }
        ]
      },
      {
        id: '4.2',
        nome: 'Estrutura do telhamento',
        tipos: ['Madeira', 'Metálico', 'Concreto', 'Pré-moldada', 'Outro'],
        manifestacoes: [
          { id: '4.2.1', codigo: '4.2.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais, assentamento plástico' },
          { id: '4.2.2', codigo: '4.2.2', descricao: 'Irregularidades geométricas, deformações excessivas' },
          { id: '4.2.3', codigo: '4.2.3', descricao: 'Falha nos elementos de fixação' },
          { id: '4.2.4', codigo: '4.2.4', descricao: 'Desagregação de elementos, partes soltas, partes quebradas, trincas' },
          { id: '4.2.5', codigo: '4.2.5', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '4.2.6', codigo: '4.2.6', descricao: 'Degradação do material, oxidação/corrosão, apodrecimento' },
          { id: '4.2.7', codigo: '4.2.7', descricao: 'Deterioração do concreto, destacamento, desagregação, segregação' },
          { id: '4.2.8', codigo: '4.2.8', descricao: 'Ataque de pragas biológicas' },
          { id: '4.2.9', codigo: '4.2.9', descricao: 'Outro' }
        ]
      },
      {
        id: '4.3',
        nome: 'Rufos e calhas',
        tipos: ['Alumínio', 'Metálico', 'PVC', 'Concreto', 'Fibrocimento', 'Outro'],
        manifestacoes: [
          { id: '4.3.1', codigo: '4.3.1', descricao: 'Degradação do material, oxidação/corrosão' },
          { id: '4.3.2', codigo: '4.3.2', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '4.3.3', codigo: '4.3.3', descricao: 'Perda de estanqueidade, infiltrações' },
          { id: '4.3.4', codigo: '4.3.4', descricao: 'Subdimensionamento' },
          { id: '4.3.5', codigo: '4.3.5', descricao: 'Obstrução por sujidades' },
          { id: '4.3.6', codigo: '4.3.6', descricao: 'Ineficiência nas emendas' },
          { id: '4.3.7', codigo: '4.3.7', descricao: 'Outro' }
        ]
      },
      {
        id: '4.4',
        nome: 'Lajes impermeabilizadas',
        tipos: ['Concreto armado', 'Pré-moldada', 'Outro'],
        manifestacoes: [
          { id: '4.4.1', codigo: '4.4.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais' },
          { id: '4.4.2', codigo: '4.4.2', descricao: 'Deterioração do concreto, destacamento, desagregação, segregação' },
          { id: '4.4.3', codigo: '4.4.3', descricao: 'Impermeabilização ineficiente, infiltrações' },
          { id: '4.4.4', codigo: '4.4.4', descricao: 'Eflorescência, desenvolvimento de organismos biológicos' },
          { id: '4.4.5', codigo: '4.4.5', descricao: 'Irregularidades geométricas, deformações excessivas' },
          { id: '4.4.6', codigo: '4.4.6', descricao: 'Outro' }
        ]
      }
    ]
  },
  {
    id: '5',
    nome: 'SISTEMAS DE RESERVATÓRIOS',
    elementos: [
      {
        id: '5.1',
        nome: 'Caixas d\'água e cisternas',
        tipos: ['Concreto armado', 'Metálico', 'Polietileno', 'Fibrocimento', 'Fibra de vidro', 'Outro'],
        manifestacoes: [
          { id: '5.1.1', codigo: '5.1.1', descricao: 'Formação de fissuras por sobrecargas, falhas de armaduras, movimentações estruturais, assentamento plástico, recalques' },
          { id: '5.1.2', codigo: '5.1.2', descricao: 'Deterioração do concreto, destacamento, desagregação, segregação' },
          { id: '5.1.3', codigo: '5.1.3', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '5.1.4', codigo: '5.1.4', descricao: 'Eflorescência, desenvolvimento de microorganismos biológicos' },
          { id: '5.1.5', codigo: '5.1.5', descricao: 'Irregularidades geométricas, falhas de concretagem' },
          { id: '5.1.6', codigo: '5.1.6', descricao: 'Armadura exposta' },
          { id: '5.1.7', codigo: '5.1.7', descricao: 'Vazamento/infiltrações de umidade' },
          { id: '5.1.8', codigo: '5.1.8', descricao: 'Colapso do solo' },
          { id: '5.1.9', codigo: '5.1.9', descricao: 'Ausência/ineficiência de tampa dos reservatórios' },
          { id: '5.1.10', codigo: '5.1.10', descricao: 'Outro' }
        ]
      }
    ]
  },
  {
    id: '6',
    nome: 'SISTEMAS DE INSTALAÇÕES PASSÍVEIS DE VERIFICAÇÃO VISUAL',
    elementos: [
      {
        id: '6.1',
        nome: 'Hidrossanitárias',
        tipos: ['PVC', 'Metálico', 'PPR', 'Ferro fundido', 'Cerâmico', 'Concreto', 'Outro'],
        manifestacoes: [
          { id: '6.1.1', codigo: '6.1.1', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '6.1.2', codigo: '6.1.2', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '6.1.3', codigo: '6.1.3', descricao: 'Entupimentos' },
          { id: '6.1.4', codigo: '6.1.4', descricao: 'Vazamentos e infiltrações' },
          { id: '6.1.5', codigo: '6.1.5', descricao: 'Não conformidade na pintura das tubulações' },
          { id: '6.1.6', codigo: '6.1.6', descricao: 'Irregularidades geométricas, deformações excessivas' },
          { id: '6.1.7', codigo: '6.1.7', descricao: 'Sujidades ou materiais indevidos depositados no interior' },
          { id: '6.1.8', codigo: '6.1.8', descricao: 'Ineficiência na abertura/fechamento, trincos e fechaduras' },
          { id: '6.1.9', codigo: '6.1.9', descricao: 'Outro' }
        ]
      },
      {
        id: '6.2',
        nome: 'Elétricas',
        tipos: ['Metálico', 'PVC', 'Fibrocimento', 'Outro'],
        manifestacoes: [
          { id: '6.2.1', codigo: '6.2.1', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '6.2.2', codigo: '6.2.2', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '6.2.3', codigo: '6.2.3', descricao: 'Ausência de cordoalhas de aterramento entre portas e corpo dos quadros elétricos' },
          { id: '6.2.4', codigo: '6.2.4', descricao: 'Ineficiência de funcionamento (abertura, acendimento)' },
          { id: '6.2.5', codigo: '6.2.5', descricao: 'Lâmpadas queimadas ou ausência' },
          { id: '6.2.6', codigo: '6.2.6', descricao: 'Risco de descarga elétrica' },
          { id: '6.2.7', codigo: '6.2.7', descricao: 'Outro' }
        ]
      },
      {
        id: '6.3',
        nome: 'Casa de gás',
        tipos: ['Metálico', 'Concreto', 'Alvenaria', 'Outro'],
        manifestacoes: [
          { id: '6.3.1', codigo: '6.3.1', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '6.3.2', codigo: '6.3.2', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '6.3.3', codigo: '6.3.3', descricao: 'Indícios de vazamentos de gás' },
          { id: '6.3.4', codigo: '6.3.4', descricao: 'Ausência/inadequação do certificado de manutenção' },
          { id: '6.3.5', codigo: '6.3.5', descricao: 'Ineficiência na abertura/fechamento, trincos e fechaduras' },
          { id: '6.3.6', codigo: '6.3.6', descricao: 'Outro' }
        ]
      }
    ]
  },
  {
    id: '7',
    nome: 'EQUIPAMENTOS',
    elementos: [
      {
        id: '7.1',
        nome: 'Elevadores',
        tipos: ['Elétrico', 'Hidráulico', 'Outro'],
        manifestacoes: [
          { id: '7.1.1', codigo: '7.1.1', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '7.1.2', codigo: '7.1.2', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '7.1.3', codigo: '7.1.3', descricao: 'Sujidades ou materiais indevidos no interior' },
          { id: '7.1.4', codigo: '7.1.4', descricao: 'Infiltrações de umidade' },
          { id: '7.1.5', codigo: '7.1.5', descricao: 'Fosso com infiltração de água' },
          { id: '7.1.6', codigo: '7.1.6', descricao: 'Falhas de funcionamento' },
          { id: '7.1.7', codigo: '7.1.7', descricao: 'Ausência/inadequação do certificado de manutenção' },
          { id: '7.1.8', codigo: '7.1.8', descricao: 'Outro' }
        ]
      },
      {
        id: '7.2',
        nome: 'Outros equipamentos com manutenção própria',
        tipos: ['Portão automático', 'Sistema de CCTV', 'Interfone', 'Bomba d\'água', 'Gerador', 'Outro'],
        manifestacoes: [
          { id: '7.2.1', codigo: '7.2.1', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '7.2.2', codigo: '7.2.2', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '7.2.3', codigo: '7.2.3', descricao: 'Falhas de funcionamento' },
          { id: '7.2.4', codigo: '7.2.4', descricao: 'Ausência/inadequação do certificado de manutenção' },
          { id: '7.2.5', codigo: '7.2.5', descricao: 'Infiltrações de umidade' },
          { id: '7.2.6', codigo: '7.2.6', descricao: 'Outro' }
        ]
      }
    ]
  },
  {
    id: '8',
    nome: 'SISTEMAS DE PREVENÇÃO CONTRA INCÊNDIO',
    elementos: [
      {
        id: '8.1',
        nome: 'Extintores, hidrantes, para-raios, iluminação de emergência, portas corta-fogo',
        tipos: ['Extintor pó químico', 'Extintor CO2', 'Extintor água', 'Hidrante', 'Para-raios', 'Iluminação emergência', 'Porta corta-fogo', 'Outro'],
        manifestacoes: [
          { id: '8.1.1', codigo: '8.1.1', descricao: 'Degradação/desgaste do material, oxidação, corrosão' },
          { id: '8.1.2', codigo: '8.1.2', descricao: 'Desagregação de elementos, partes soltas, partes quebradas' },
          { id: '8.1.3', codigo: '8.1.3', descricao: 'Sujidades ou materiais indevidos no interior' },
          { id: '8.1.4', codigo: '8.1.4', descricao: 'Infiltrações de umidade' },
          { id: '8.1.5', codigo: '8.1.5', descricao: 'Ineficiência na abertura/fechamento, trincos e fechaduras' },
          { id: '8.1.6', codigo: '8.1.6', descricao: 'Falhas no desempenho do sistema' },
          { id: '8.1.7', codigo: '8.1.7', descricao: 'Falha na sinalização' },
          { id: '8.1.8', codigo: '8.1.8', descricao: 'Obstrução de acessos' },
          { id: '8.1.9', codigo: '8.1.9', descricao: 'Ausência/inadequação do alvará anual do CBM' },
          { id: '8.1.10', codigo: '8.1.10', descricao: 'Ausência/inadequação do certificado de manutenção/validade de extintores' },
          { id: '8.1.11', codigo: '8.1.11', descricao: 'Outro' }
        ]
      }
    ]
  },
  {
    id: '9',
    nome: 'MANUTENÇÃO',
    elementos: [
      {
        id: '9.1',
        nome: 'Limpeza e plano de manutenções',
        tipos: ['Plano de manutenção', 'Limpeza', 'Outro'],
        manifestacoes: [
          { id: '9.1.1', codigo: '9.1.1', descricao: 'Há plano de manutenção?' },
          { id: '9.1.2', codigo: '9.1.2', descricao: 'Está coerente com normas técnicas?' },
          { id: '9.1.3', codigo: '9.1.3', descricao: 'Rotinas estão adequadas?' },
          { id: '9.1.4', codigo: '9.1.4', descricao: 'Existe acesso aos equipamentos?' },
          { id: '9.1.5', codigo: '9.1.5', descricao: 'Há condições de segurança para a realização da manutenção?' },
          { id: '9.1.6', codigo: '9.1.6', descricao: 'Os ambientes estão limpos?' },
          { id: '9.1.7', codigo: '9.1.7', descricao: 'Há registros gerados pelas atividades de manutenção?' },
          { id: '9.1.8', codigo: '9.1.8', descricao: 'Os registros estão organizados e disponíveis?' },
          { id: '9.1.9', codigo: '9.1.9', descricao: 'Outro' }
        ]
      }
    ]
  }
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