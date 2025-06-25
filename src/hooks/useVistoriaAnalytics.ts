
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';

export interface VistoriaAnalytics {
  totalVistorias: number;
  vistoriasPorCondominio: { [key: string]: number };
  vistoriasPorStatus: { [key: string]: number };
  vistoriasPorMes: { [key: string]: number };
  problemasFrequentes: { item: string; count: number }[];
  condominiosAtivos: { id: string; nome: string; totalVistorias: number }[];
}

export const useVistoriaAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const obterEstatisticasGerais = async (): Promise<VistoriaAnalytics | null> => {
    try {
      setLoading(true);
      console.log('Obtendo estatísticas gerais de vistorias...');

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar todas as vistorias do usuário
      const { data: vistorias, error: vistoriasError } = await supabase
        .from('vistorias')
        .select(`
          *,
          condominio:condominios(id, nome),
          grupos_vistoria(
            ambiente,
            grupo,
            item,
            status,
            parecer
          )
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (vistoriasError) {
        console.error('Erro ao buscar vistorias:', vistoriasError);
        throw vistoriasError;
      }

      console.log('Vistorias encontradas:', vistorias?.length || 0);

      if (!vistorias || vistorias.length === 0) {
        return {
          totalVistorias: 0,
          vistoriasPorCondominio: {},
          vistoriasPorStatus: {},
          vistoriasPorMes: {},
          problemasFrequentes: [],
          condominiosAtivos: []
        };
      }

      // Total de vistorias
      const totalVistorias = vistorias.length;

      // Vistorias por condomínio
      const vistoriasPorCondominio: { [key: string]: number } = {};
      const condominiosMap: { [key: string]: { nome: string; count: number } } = {};

      vistorias.forEach(vistoria => {
        const condominioNome = vistoria.condominio?.nome || 'Não informado';
        vistoriasPorCondominio[condominioNome] = (vistoriasPorCondominio[condominioNome] || 0) + 1;
        
        if (vistoria.condominio) {
          condominiosMap[vistoria.condominio.id] = {
            nome: condominioNome,
            count: (condominiosMap[vistoria.condominio.id]?.count || 0) + 1
          };
        }
      });

      // Vistorias por status
      const vistoriasPorStatus: { [key: string]: number } = {};
      vistorias.forEach(vistoria => {
        vistoriasPorStatus[vistoria.status] = (vistoriasPorStatus[vistoria.status] || 0) + 1;
      });

      // Vistorias por mês
      const vistoriasPorMes: { [key: string]: number } = {};
      vistorias.forEach(vistoria => {
        const data = new Date(vistoria.data_vistoria);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        vistoriasPorMes[mesAno] = (vistoriasPorMes[mesAno] || 0) + 1;
      });

      // Problemas frequentes (baseado nos grupos de vistoria)
      const problemasCount: { [key: string]: number } = {};
      vistorias.forEach(vistoria => {
        vistoria.grupos_vistoria?.forEach(grupo => {
          if (grupo.status !== 'Conforme') {
            const problema = `${grupo.ambiente} - ${grupo.item}`;
            problemasCount[problema] = (problemasCount[problema] || 0) + 1;
          }
        });
      });

      const problemasFrequentes = Object.entries(problemasCount)
        .map(([item, count]) => ({ item, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Condomínios ativos
      const condominiosAtivos = Object.entries(condominiosMap)
        .map(([id, data]) => ({
          id,
          nome: data.nome,
          totalVistorias: data.count
        }))
        .sort((a, b) => b.totalVistorias - a.totalVistorias);

      const analytics: VistoriaAnalytics = {
        totalVistorias,
        vistoriasPorCondominio,
        vistoriasPorStatus,
        vistoriasPorMes,
        problemasFrequentes,
        condominiosAtivos
      };

      console.log('Analytics geradas:', analytics);
      return analytics;

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter as estatísticas.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buscarVistoriasPorFiltro = async (filtro: {
    condominio?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
    problema?: string;
  }): Promise<VistoriaSupabase[]> => {
    try {
      setLoading(true);
      console.log('Buscando vistorias com filtro:', filtro);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('vistorias')
        .select(`
          *,
          condominio:condominios(id, nome),
          grupos_vistoria(
            *,
            fotos_vistoria(*)
          )
        `)
        .eq('user_id', userData.user.id);

      // Aplicar filtros
      if (filtro.status) {
        query = query.eq('status', filtro.status);
      }

      if (filtro.dataInicio) {
        query = query.gte('data_vistoria', filtro.dataInicio);
      }

      if (filtro.dataFim) {
        query = query.lte('data_vistoria', filtro.dataFim);
      }

      const { data: vistorias, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vistorias filtradas:', error);
        throw error;
      }

      let resultados = vistorias || [];

      // Filtrar por condomínio (nome parcial)
      if (filtro.condominio) {
        resultados = resultados.filter(v => 
          v.condominio?.nome.toLowerCase().includes(filtro.condominio!.toLowerCase())
        );
      }

      // Filtrar por problema (item ou ambiente)
      if (filtro.problema) {
        resultados = resultados.filter(v =>
          v.grupos_vistoria?.some(g => 
            g.item.toLowerCase().includes(filtro.problema!.toLowerCase()) ||
            g.ambiente.toLowerCase().includes(filtro.problema!.toLowerCase()) ||
            g.parecer?.toLowerCase().includes(filtro.problema!.toLowerCase())
          )
        );
      }

      // Transformar para o formato esperado
      const vistoriasFormatadas: VistoriaSupabase[] = resultados.map(vistoria => ({
        id: vistoria.id,
        condominio_id: vistoria.condominio_id,
        user_id: vistoria.user_id,
        numero_interno: vistoria.numero_interno,
        id_sequencial: vistoria.id_sequencial,
        data_vistoria: vistoria.data_vistoria,
        observacoes_gerais: vistoria.observacoes_gerais,
        responsavel: vistoria.responsavel,
        status: vistoria.status,
        created_at: vistoria.created_at,
        updated_at: vistoria.updated_at,
        condominio: Array.isArray(vistoria.condominio) ? vistoria.condominio[0] : vistoria.condominio,
        grupos: (vistoria.grupos_vistoria || []).map(grupo => ({
          id: grupo.id,
          vistoria_id: grupo.vistoria_id,
          ambiente: grupo.ambiente,
          grupo: grupo.grupo,
          item: grupo.item,
          status: grupo.status,
          parecer: grupo.parecer || '',
          ordem: grupo.ordem || 0,
          fotos: grupo.fotos_vistoria || []
        }))
      }));

      console.log('Vistorias filtradas encontradas:', vistoriasFormatadas.length);
      return vistoriasFormatadas;

    } catch (error) {
      console.error('Erro ao buscar vistorias filtradas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar as vistorias.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    obterEstatisticasGerais,
    buscarVistoriasPorFiltro
  };
};
