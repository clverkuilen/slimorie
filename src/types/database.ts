// Generated from the live Supabase schema via the Supabase MCP
// `generate_typescript_types` tool. Regenerate after every migration:
//   supabase gen types typescript --project-id rhkhktjhzqyvntbacscv > src/types/database.ts
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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          condition: Json
          created_at: string
          description: string
          icon: string | null
          id: string
          key: string
          name: string
          sort_order: number
        }
        Insert: {
          condition: Json
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          key: string
          name: string
          sort_order?: number
        }
        Update: {
          condition?: Json
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          key?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          calories: number
          carbs_g: number
          entry_count: number
          fat_g: number
          fiber_g: number
          log_date: string
          protein_g: number
          sugar_g: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          entry_count?: number
          fat_g?: number
          fiber_g?: number
          log_date: string
          protein_g?: number
          sugar_g?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          entry_count?: number
          fat_g?: number
          fiber_g?: number
          log_date?: string
          protein_g?: number
          sugar_g?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_foods: {
        Row: {
          created_at: string
          food_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_log_entries: {
        Row: {
          brand_snapshot: string | null
          created_at: string
          food_id: string | null
          food_name_snapshot: string
          grams_equivalent: number
          id: string
          log_date: string
          logged_at: string
          meal_category: string
          note: string | null
          nutrition_snapshot: Json
          quantity: number
          source_type_snapshot: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_snapshot?: string | null
          created_at?: string
          food_id?: string | null
          food_name_snapshot: string
          grams_equivalent: number
          id?: string
          log_date: string
          logged_at?: string
          meal_category: string
          note?: string | null
          nutrition_snapshot: Json
          quantity: number
          source_type_snapshot?: string | null
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_snapshot?: string | null
          created_at?: string
          food_id?: string | null
          food_name_snapshot?: string
          grams_equivalent?: number
          id?: string
          log_date?: string
          logged_at?: string
          meal_category?: string
          note?: string | null
          nutrition_snapshot?: Json
          quantity?: number
          source_type_snapshot?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_log_entries_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_nutrients: {
        Row: {
          amount_per_100: number
          food_id: string
          nutrient_key: string
        }
        Insert: {
          amount_per_100: number
          food_id: string
          nutrient_key: string
        }
        Update: {
          amount_per_100?: number
          food_id?: string
          nutrient_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_nutrients_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_nutrients_nutrient_key_fkey"
            columns: ["nutrient_key"]
            isOneToOne: false
            referencedRelation: "nutrients"
            referencedColumns: ["key"]
          },
        ]
      }
      food_servings: {
        Row: {
          created_at: string
          food_id: string
          grams_equivalent: number
          id: string
          is_default: boolean
          label: string | null
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string
          food_id: string
          grams_equivalent: number
          id?: string
          is_default?: boolean
          label?: string | null
          quantity?: number
          unit: string
        }
        Update: {
          created_at?: string
          food_id?: string
          grams_equivalent?: number
          id?: string
          is_default?: boolean
          label?: string | null
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_servings_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_sources: {
        Row: {
          food_id: string
          source_id: string | null
          source_last_updated: string | null
          source_type: string
          source_url: string | null
        }
        Insert: {
          food_id: string
          source_id?: string | null
          source_last_updated?: string | null
          source_type: string
          source_url?: string | null
        }
        Update: {
          food_id?: string
          source_id?: string | null
          source_last_updated?: string | null
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_sources_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: true
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          barcode: string | null
          basis_unit: string
          brand: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          dietary_flags: string[]
          id: string
          ingredients_text: string | null
          name: string
          owner_user_id: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          basis_unit?: string
          brand?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          dietary_flags?: string[]
          id?: string
          ingredients_text?: string | null
          name: string
          owner_user_id?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          basis_unit?: string
          brand?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          dietary_flags?: string[]
          id?: string
          ingredients_text?: string | null
          name?: string
          owner_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          calorie_goal: number
          carbs_g_goal: number | null
          created_at: string
          effective_date: string
          fat_g_goal: number | null
          fiber_g_goal: number | null
          id: string
          protein_g_goal: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calorie_goal: number
          carbs_g_goal?: number | null
          created_at?: string
          effective_date?: string
          fat_g_goal?: number | null
          fiber_g_goal?: number | null
          id?: string
          protein_g_goal?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calorie_goal?: number
          carbs_g_goal?: number | null
          created_at?: string
          effective_date?: string
          fat_g_goal?: number | null
          fiber_g_goal?: number | null
          id?: string
          protein_g_goal?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrients: {
        Row: {
          category: string
          display_name: string
          key: string
          sort_order: number
          unit: string
        }
        Insert: {
          category: string
          display_name: string
          key: string
          sort_order?: number
          unit: string
        }
        Update: {
          category?: string
          display_name?: string
          key?: string
          sort_order?: number
          unit?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          level: number
          timezone: string
          updated_at: string
          weight_unit_pref: string
          xp_total: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          level?: number
          timezone?: string
          updated_at?: string
          weight_unit_pref?: string
          xp_total?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          timezone?: string
          updated_at?: string
          weight_unit_pref?: string
          xp_total?: number
        }
        Relationships: []
      }
      recipe_items: {
        Row: {
          food_id: string
          id: string
          quantity: number
          recipe_id: string
          sort_order: number
          unit: string
        }
        Insert: {
          food_id: string
          id?: string
          quantity: number
          recipe_id: string
          sort_order?: number
          unit: string
        }
        Update: {
          food_id?: string
          id?: string
          quantity?: number
          recipe_id?: string
          sort_order?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          name: string
          notes: string | null
          servings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          name: string
          notes?: string | null
          servings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          name?: string
          notes?: string | null
          servings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_meal_items: {
        Row: {
          food_id: string
          id: string
          quantity: number
          saved_meal_id: string
          sort_order: number
          unit: string
        }
        Insert: {
          food_id: string
          id?: string
          quantity: number
          saved_meal_id: string
          sort_order?: number
          unit: string
        }
        Update: {
          food_id?: string
          id?: string
          quantity?: number
          saved_meal_id?: string
          sort_order?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_meal_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_meal_items_saved_meal_id_fkey"
            columns: ["saved_meal_id"]
            isOneToOne: false
            referencedRelation: "saved_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_meals: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          current_count: number
          id: string
          last_active_date: string | null
          longest_count: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_count?: number
          id?: string
          last_active_date?: string | null
          longest_count?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_count?: number
          id?: string
          last_active_date?: string | null
          longest_count?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          note: string | null
          unit: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          note?: string | null
          unit: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          note?: string | null
          unit?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          action_key: string
          created_at: string
          id: string
          occurred_on: string
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          action_key: string
          created_at?: string
          id?: string
          occurred_on?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          action_key?: string
          created_at?: string
          id?: string
          occurred_on?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_action_key_fkey"
            columns: ["action_key"]
            isOneToOne: false
            referencedRelation: "xp_rules"
            referencedColumns: ["action_key"]
          },
        ]
      }
      xp_rules: {
        Row: {
          action_key: string
          description: string | null
          updated_at: string
          xp_amount: number
        }
        Insert: {
          action_key: string
          description?: string | null
          updated_at?: string
          xp_amount: number
        }
        Update: {
          action_key?: string
          description?: string | null
          updated_at?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      recompute_daily_summary: {
        Args: { p_log_date: string; p_user_id: string }
        Returns: undefined
      }
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
