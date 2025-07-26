import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          name: string;
          image: string;
          user_id: string;
          created_at: string;
          products_count: number;
        };
        Insert: {
          id?: string;
          name: string;
          image?: string;
          user_id: string;
          created_at?: string;
          products_count?: number;
        };
        Update: {
          id?: string;
          name?: string;
          image?: string;
          user_id?: string;
          created_at?: string;
          products_count?: number;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          image: string;
          reference: string;
          category: string;
          etsy_link: string;
          dropshipping_link: string;
          status: 'active' | 'draft' | 'inactive';
          shop_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price: number;
          image?: string;
          reference: string;
          category?: string;
          etsy_link?: string;
          dropshipping_link?: string;
          status?: 'active' | 'draft' | 'inactive';
          shop_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          image?: string;
          reference?: string;
          category?: string;
          etsy_link?: string;
          dropshipping_link?: string;
          status?: 'active' | 'draft' | 'inactive';
          shop_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Client typé
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 