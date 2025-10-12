export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      link_members: {
        Row: {
          created_at: string | null;
          link_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          link_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          link_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'link_members_link_id_fkey1';
            columns: ['link_id'];
            isOneToOne: false;
            referencedRelation: 'links';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'link_members_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      link_post_media: {
        Row: {
          created_at: string | null;
          duration_seconds: number | null;
          id: string;
          mime: string;
          path: string;
          post_id: string;
          type: Database['public']['Enums']['media_type'];
        };
        Insert: {
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          mime: string;
          path: string;
          post_id: string;
          type: Database['public']['Enums']['media_type'];
        };
        Update: {
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          mime?: string;
          path?: string;
          post_id?: string;
          type?: Database['public']['Enums']['media_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'link_post_media_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'link_posts';
            referencedColumns: ['id'];
          },
        ];
      };
      link_posts: {
        Row: {
          created_at: string | null;
          id: string;
          link_id: string;
          owner_id: string;
          text: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          link_id: string;
          owner_id: string;
          text?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          link_id?: string;
          owner_id?: string;
          text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'link_posts_link_id_fkey1';
            columns: ['link_id'];
            isOneToOne: false;
            referencedRelation: 'links';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'link_posts_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      links: {
        Row: {
          created_at: string | null;
          end_time: string | null;
          id: string;
          name: string;
          owner_id: string;
          party_id: string;
        };
        Insert: {
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          party_id: string;
        };
        Update: {
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          party_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'links_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'links_party_id_fkey1';
            columns: ['party_id'];
            isOneToOne: false;
            referencedRelation: 'parties';
            referencedColumns: ['id'];
          },
        ];
      };
      'old-link_members': {
        Row: {
          joined_at: string | null;
          link_id: string;
          user_id: string;
        };
        Insert: {
          joined_at?: string | null;
          link_id?: string;
          user_id: string;
        };
        Update: {
          joined_at?: string | null;
          link_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'link_members_link_id_fkey';
            columns: ['link_id'];
            isOneToOne: false;
            referencedRelation: 'old-links';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'link_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'old-users';
            referencedColumns: ['id'];
          },
        ];
      };
      'old-link_posts': {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          image_paths: string[];
          link_id: string;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          image_paths?: string[];
          link_id: string;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          image_paths?: string[];
          link_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'link_posts_link_id_fkey';
            columns: ['link_id'];
            isOneToOne: false;
            referencedRelation: 'old-links';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'link_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'old-users';
            referencedColumns: ['id'];
          },
        ];
      };
      'old-links': {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          is_active: boolean;
          location: string;
          name: string;
          party_id: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          is_active?: boolean;
          location?: string;
          name: string;
          party_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          is_active?: boolean;
          location?: string;
          name?: string;
          party_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'links_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'old-users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'links_party_id_fkey';
            columns: ['party_id'];
            isOneToOne: false;
            referencedRelation: 'old-parties';
            referencedColumns: ['id'];
          },
        ];
      };
      'old-parties': {
        Row: {
          avatar_url: string;
          banner_url: string;
          created_at: string | null;
          created_by: string | null;
          id: string;
          name: string;
        };
        Insert: {
          avatar_url: string;
          banner_url: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          avatar_url?: string;
          banner_url?: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parties_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'old-users';
            referencedColumns: ['id'];
          },
        ];
      };
      'old-party_members': {
        Row: {
          joined_at: string;
          party_id: string;
          user_id: string;
        };
        Insert: {
          joined_at?: string;
          party_id: string;
          user_id: string;
        };
        Update: {
          joined_at?: string;
          party_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'party_members_party_id_fkey';
            columns: ['party_id'];
            isOneToOne: false;
            referencedRelation: 'old-parties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'party_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'old-users';
            referencedColumns: ['id'];
          },
        ];
      };
      'old-users': {
        Row: {
          avatar_url: string;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
        };
        Insert: {
          avatar_url: string;
          created_at?: string;
          email?: string | null;
          id: string;
          name: string;
        };
        Update: {
          avatar_url?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      parties: {
        Row: {
          avatar_path: string | null;
          banner_path: string | null;
          created_at: string | null;
          id: string;
          name: string;
          owner_id: string;
        };
        Insert: {
          avatar_path?: string | null;
          banner_path?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          owner_id: string;
        };
        Update: {
          avatar_path?: string | null;
          banner_path?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parties_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      party_members: {
        Row: {
          created_at: string | null;
          party_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          party_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          party_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'party_members_party_id_fkey1';
            columns: ['party_id'];
            isOneToOne: false;
            referencedRelation: 'parties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'party_members_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          id: string;
          name: string | null;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      media_type: 'image' | 'video';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      media_type: ['image', 'video'],
    },
  },
} as const;
