import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// 環境変数が適切に設定されているかチェック
const isValidSupabaseConfig = (url: string, key: string): boolean => {
  return url && 
         key && 
         url !== 'your-supabase-url' && 
         key !== 'your-supabase-anon-key' &&
         url.startsWith('https://') &&
         key.length > 20;
};

// Supabaseクライアントの初期化（環境変数が設定されている場合のみ）
export const supabase = isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Supabaseが利用可能かチェック
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

// サーバーサイド用（Service Role Key使用）
export const supabaseAdmin = isValidSupabaseConfig(supabaseUrl, supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;