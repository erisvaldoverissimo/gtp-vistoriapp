export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
      grupos_vistoria: {
        Row: {
          ambiente: string
          created_at: string | null
          grupo: string
          id: string
          item: string
          ordem: number | null
          parecer: string | null
          status: string
          updated_at: string | null
          vistoria_id: string
        }
        Insert: {
          ambiente: string
          created_at?: string | null
          grupo: string
          id?: string
          item: string
          ordem?: number | null
          parecer?: string | null
          status: string
          updated_at?: string | null
          vistoria_id: string
        }
        Update: {
          ambiente?: string
          created_at?: string | null
          grupo?: string
          id?: string
          item?: string
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
      profiles: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vistorias: {
        Row: {
          condominio_id: string
          created_at: string | null
          data_vistoria: string
          id: string
          id_sequencial: number
          numero_interno: string
          observacoes_gerais: string | null
          responsavel: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          condominio_id: string
          created_at?: string | null
          data_vistoria: string
          id?: string
          id_sequencial: number
          numero_interno: string
          observacoes_gerais?: string | null
          responsavel: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          condominio_id?: string
          created_at?: string | null
          data_vistoria?: string
          id?: string
          id_sequencial?: number
          numero_interno?: string
          observacoes_gerais?: string | null
          responsavel?: string
          status?: string
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
