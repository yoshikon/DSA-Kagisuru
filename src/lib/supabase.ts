import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// 環境変数が適切に設定されているかチェック
export const isValidSupabaseConfig = (url: string, key: string): boolean => {
  // より厳密な検証
  if (!url || !key) return false;
  
  // プレースホルダー値をチェック
  const placeholders = [
    'your-supabase-url',
    'your-supabase-anon-key',
    'undefined',
    'null',
    ''
  ];
  
  if (placeholders.includes(url) || placeholders.includes(key)) {
    return false;
  }
  
  // URL形式の検証
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return false;
  }
  
  // キー長の検証（Supabaseの匿名キーは通常100文字以上）
  if (key.length < 100) {
    return false;
  }
  
  return true;
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