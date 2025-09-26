import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabaseクライアントの初期化（環境変数が設定されている場合のみ）
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Supabaseが利用可能かチェック
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

// サーバーサイド用（Service Role Key使用）
export const supabaseAdmin = supabaseUrl && import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
  : null;