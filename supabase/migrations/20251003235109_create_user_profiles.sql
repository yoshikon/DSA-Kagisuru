/*
  # ユーザープロフィール拡張テーブルの作成

  ## 説明
  ユーザーの追加情報を管理するためのテーブルを作成します。
  Supabase Authのユーザーテーブルと1対1の関係を持ちます。

  ## 新しいテーブル
  
  ### `user_profiles`
  - `id` (uuid, primary key) - auth.usersテーブルのidと同じ
  - `display_name` (text) - 表示名
  - `phone_number` (text, nullable) - 電話番号（二段階認証用）
  - `phone_verified` (boolean) - 電話番号確認済みフラグ
  - `avatar_url` (text, nullable) - アバター画像URL
  - `bio` (text, nullable) - 自己紹介
  - `two_factor_enabled` (boolean) - 二段階認証有効フラグ
  - `created_at` (timestamptz) - 作成日時
  - `updated_at` (timestamptz) - 更新日時

  ## セキュリティ
  
  1. RLS (Row Level Security) の有効化
  2. ユーザーは自分のプロフィールのみ閲覧・更新可能
  3. 新規ユーザー登録時の自動プロフィール作成トリガー

  ## インデックス
  
  - `user_profiles_phone_number_idx` - 電話番号での検索用
*/

-- user_profiles テーブルの作成
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  phone_number text,
  phone_verified boolean DEFAULT false,
  avatar_url text,
  bio text,
  two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 電話番号のインデックス
CREATE INDEX IF NOT EXISTS user_profiles_phone_number_idx ON user_profiles(phone_number);

-- RLSの有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLSポリシー: ユーザーは自分のプロフィールのみ挿入可能
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLSポリシー: ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLSポリシー: ユーザーは自分のプロフィールのみ削除可能
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 更新日時を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_profiles テーブルに更新日時トリガーを設定
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 新規ユーザー作成時に自動的にプロフィールを作成する関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users テーブルに新規ユーザートリガーを設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
