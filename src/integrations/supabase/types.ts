export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      base_conhecimento: {
        Row: {
          arquivo_url: string | null
          categoria: string | null
          conteudo_extraido: string
          created_at: string
          id: string
          palavras_chave: string[] | null
          tamanho_bytes: number | null
          tipo_documento: string
          titulo: string
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          arquivo_url?: string | null
          categoria?: string | null
          conteudo_extraido: string
          created_at?: string
          id?: string
          palavras_chave?: string[] | null
          tamanho_bytes?: number | null
          tipo_documento: string
          titulo: string
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          arquivo_url?: string | null
          categoria?: string | null
          conteudo_extraido?: string
          created_at?: string
          id?: string
          palavras_chave?: string[] | null
          tamanho_bytes?: number | null
          tipo_documento?: string
          titulo?: string
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      condominios: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          created_at: string | null
          email: string | null
          endereco: string
          estado: string | null
          id: string
          nome: string
          responsavel: string | null
          telefone: string | null
          telefone_responsavel: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco: string
          estado?: string | null
          id?: string
          nome: string
          responsavel?: string | null
          telefone?: string | null
          telefone_responsavel?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string
          estado?: string | null
          id?: string
          nome?: string
          responsavel?: string | null
          telefone?: string | null
          telefone_responsavel?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes_produtividade: {
        Row: {
          chave: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          valor: Json
        }
        Update: {
          chave?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          valor?: Json
        }
        Relationships: []
      }
      configuracoes_sistema: {
        Row: {
          categoria: string
          chave: string
          created_at: string | null
          descricao: string | null
          id: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          categoria?: string
          chave: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor: Json
        }
        Update: {
          categoria?: string
          chave?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Relationships: []
      }
      configuracoes_usuario: {
        Row: {
          chave: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          valor: Json
        }
        Update: {
          chave?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          valor?: Json
        }
        Relationships: []
      }
      conversas_chat: {
        Row: {
          ativa: boolean
          created_at: string
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fotos_vistoria: {
        Row: {
          arquivo_nome: string
          arquivo_url: string
          created_at: string | null
          descricao: string | null
          grupo_vistoria_id: string
          id: string
          tamanho_bytes: number | null
          tipo_mime: string | null
        }
        Insert: {
          arquivo_nome: string
          arquivo_url: string
          created_at?: string | null
          descricao?: string | null
          grupo_vistoria_id: string
          id?: string
          tamanho_bytes?: number | null
          tipo_mime?: string | null
        }
        Update: {
          arquivo_nome?: string
          arquivo_url?: string
          created_at?: string | null
          descricao?: string | null
          grupo_vistoria_id?: string
          id?: string
          tamanho_bytes?: number | null
          tipo_mime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotos_vistoria_grupo_vistoria_id_fkey"
            columns: ["grupo_vistoria_id"]
            isOneToOne: false
            referencedRelation: "grupos_vistoria"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_template: {
        Row: {
          ambiente: string
          created_at: string
          grupo: string
          id: string
          item: string
          ordem: number
          template_id: string
        }
        Insert: {
          ambiente: string
          created_at?: string
          grupo: string
          id?: string
          item: string
          ordem?: number
          template_id: string
        }
        Update: {
          ambiente?: string
          created_at?: string
          grupo?: string
          id?: string
          item?: string
          ordem?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_template_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_vistoria"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_vistoria: {
        Row: {
          ambiente: string
          checklist_tecnico: Json | null
          created_at: string | null
          grupo: string
          id: string
          item: string
          modo_checklist: boolean | null
          ordem: number | null
          parecer: string | null
          status: string
          updated_at: string | null
          vistoria_id: string
        }
        Insert: {
          ambiente: string
          checklist_tecnico?: Json | null
          created_at?: string | null
          grupo: string
          id?: string
          item: string
          modo_checklist?: boolean | null
          ordem?: number | null
          parecer?: string | null
          status: string
          updated_at?: string | null
          vistoria_id: string
        }
        Update: {
          ambiente?: string
          checklist_tecnico?: Json | null
          created_at?: string | null
          grupo?: string
          id?: string
          item?: string
          modo_checklist?: boolean | null
          ordem?: number | null
          parecer?: string | null
          status?: string
          updated_at?: string | null
          vistoria_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_vistoria_vistoria_id_fkey"
            columns: ["vistoria_id"]
            isOneToOne: false
            referencedRelation: "vistorias"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_chat: {
        Row: {
          content: string
          conversa_id: string
          created_at: string
          id: string
          role: string
          type: string | null
        }
        Insert: {
          content: string
          conversa_id: string
          created_at?: string
          id?: string
          role: string
          type?: string | null
        }
        Update: {
          content?: string
          conversa_id?: string
          created_at?: string
          id?: string
          role?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_chat_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas_chat"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_access_links: {
        Row: {
          acessado_em: string | null
          acessos_count: number | null
          created_at: string
          email_enviado_para: string
          expires_at: string
          id: string
          token: string
          updated_at: string
          vistoria_id: string
        }
        Insert: {
          acessado_em?: string | null
          acessos_count?: number | null
          created_at?: string
          email_enviado_para: string
          expires_at?: string
          id?: string
          token: string
          updated_at?: string
          vistoria_id: string
        }
        Update: {
          acessado_em?: string | null
          acessos_count?: number | null
          created_at?: string
          email_enviado_para?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string
          vistoria_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_access_links_vistoria_id_fkey"
            columns: ["vistoria_id"]
            isOneToOne: false
            referencedRelation: "vistorias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          email: string
          email_copia_1: string | null
          email_copia_2: string | null
          email_copia_3: string | null
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"] | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email: string
          email_copia_1?: string | null
          email_copia_2?: string | null
          email_copia_3?: string | null
          id: string
          nome: string
          role?: Database["public"]["Enums"]["user_role"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string
          email_copia_1?: string | null
          email_copia_2?: string | null
          email_copia_3?: string | null
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      templates_vistoria: {
        Row: {
          ativo: boolean
          condominio_id: string | null
          created_at: string
          descricao: string | null
          id: string
          is_publico: boolean
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          condominio_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_publico?: boolean
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          condominio_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_publico?: boolean
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_vistoria_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_condominios: {
        Row: {
          condominio_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          condominio_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          condominio_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_condominios_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_condominios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vistorias: {
        Row: {
          condominio_id: string
          copiado_de_vistoria_id: string | null
          created_at: string | null
          data_vistoria: string
          id: string
          id_sequencial: number
          numero_interno: string
          observacoes_gerais: string | null
          responsavel: string
          status: string
          template_usado_id: string | null
          tempo_criacao_minutos: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          condominio_id: string
          copiado_de_vistoria_id?: string | null
          created_at?: string | null
          data_vistoria: string
          id?: string
          id_sequencial: number
          numero_interno: string
          observacoes_gerais?: string | null
          responsavel: string
          status?: string
          template_usado_id?: string | null
          tempo_criacao_minutos?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          condominio_id?: string
          copiado_de_vistoria_id?: string | null
          created_at?: string | null
          data_vistoria?: string
          id?: string
          id_sequencial?: number
          numero_interno?: string
          observacoes_gerais?: string | null
          responsavel?: string
          status?: string
          template_usado_id?: string | null
          tempo_criacao_minutos?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vistorias_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vistorias_copiado_de_vistoria_id_fkey"
            columns: ["copiado_de_vistoria_id"]
            isOneToOne: false
            referencedRelation: "vistorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vistorias_template_usado_id_fkey"
            columns: ["template_usado_id"]
            isOneToOne: false
            referencedRelation: "templates_vistoria"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_pdf_links: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_condominio_access: {
        Args: { _condominio_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      obter_proximo_numero_sequencial: {
        Args: { condominio_uuid: string }
        Returns: number
      }
    }
    Enums: {
      user_role: "admin" | "sindico"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "sindico"],
    },
  },
} as const
