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
      activity_events: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          id: string;
          link_id: string | null;
          metadata: Json;
          party_id: string | null;
          read_at: string | null;
          recipient_user_id: string;
          type: Database['public']['Enums']['activity_type'];
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          link_id?: string | null;
          metadata?: Json;
          party_id?: string | null;
          read_at?: string | null;
          recipient_user_id: string;
          type: Database['public']['Enums']['activity_type'];
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          link_id?: string | null;
          metadata?: Json;
          party_id?: string | null;
          read_at?: string | null;
          recipient_user_id?: string;
          type?: Database['public']['Enums']['activity_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'activity_events_actor_user_id_fkey';
            columns: ['actor_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_events_link_id_fkey';
            columns: ['link_id'];
            isOneToOne: false;
            referencedRelation: 'links';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_events_party_id_fkey';
            columns: ['party_id'];
            isOneToOne: false;
            referencedRelation: 'parties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_events_recipient_user_id_fkey';
            columns: ['recipient_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      link_members: {
        Row: {
          created_at: string | null;
          link_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          link_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          link_id?: string;
          updated_at?: string | null;
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
            referencedRelation: 'profiles';
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
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          mime: string;
          path: string;
          post_id: string;
          type: Database['public']['Enums']['media_type'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          mime?: string;
          path?: string;
          post_id?: string;
          type?: Database['public']['Enums']['media_type'];
          updated_at?: string | null;
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
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          link_id: string;
          owner_id: string;
          text?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          link_id?: string;
          owner_id?: string;
          text?: string | null;
          updated_at?: string | null;
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
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      links: {
        Row: {
          banner_crop_x: number;
          banner_crop_y: number;
          banner_path: string | null;
          created_at: string | null;
          end_time: string | null;
          id: string;
          name: string;
          owner_id: string;
          party_id: string;
          updated_at: string | null;
        };
        Insert: {
          banner_crop_x?: number;
          banner_crop_y?: number;
          banner_path?: string | null;
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          party_id: string;
          updated_at?: string | null;
        };
        Update: {
          banner_crop_x?: number;
          banner_crop_y?: number;
          banner_path?: string | null;
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          party_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'links_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
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
      parties: {
        Row: {
          banner_crop_x: number;
          banner_crop_y: number;
          banner_path: string | null;
          created_at: string | null;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string | null;
        };
        Insert: {
          banner_crop_x?: number;
          banner_crop_y?: number;
          banner_path?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          updated_at?: string | null;
        };
        Update: {
          banner_crop_x?: number;
          banner_crop_y?: number;
          banner_path?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'parties_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      party_members: {
        Row: {
          created_at: string | null;
          party_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          party_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          party_id?: string;
          updated_at?: string | null;
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
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          id: string;
          name: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_edit_link_banner: {
        Args: { link_id_text: string };
        Returns: boolean;
      };
      can_upload_to_link: { Args: { p_link_id: string }; Returns: boolean };
      create_party_with_owner: {
        Args: { party_name: string; party_owner_id: string };
        Returns: {
          banner_crop_x: number;
          banner_crop_y: number;
          banner_path: string | null;
          created_at: string | null;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'parties';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_member_of_party: { Args: { p_party_id: string }; Returns: boolean };
      is_owner_of_media: { Args: { p_post_id: string }; Returns: boolean };
      is_party_member_of_link: {
        Args: { p_link_id: string };
        Returns: boolean;
      };
      is_party_owner_of_link: { Args: { p_link_id: string }; Returns: boolean };
    };
    Enums: {
      activity_type:
        | 'link_created'
        | 'link_ended'
        | 'link_member_joined'
        | 'link_member_left'
        | 'party_member_joined'
        | 'party_member_left';
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
      activity_type: [
        'link_created',
        'link_ended',
        'link_member_joined',
        'link_member_left',
        'party_member_joined',
        'party_member_left',
      ],
      media_type: ['image', 'video'],
    },
  },
} as const;
