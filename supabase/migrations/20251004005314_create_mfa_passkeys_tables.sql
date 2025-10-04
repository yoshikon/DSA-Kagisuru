/*
  # 二段階認証とパスキーテーブルの作成

  1. 新しいテーブル
    - `user_mfa_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `mfa_enabled` (boolean) - 二段階認証の有効/無効
      - `phone_verified` (boolean) - 電話番号認証済みか
      - `verification_code` (text) - 認証コード（一時的）
      - `code_expires_at` (timestamptz) - 認証コードの有効期限
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_passkeys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `device_name` (text) - デバイス名
      - `credential_id` (text) - パスキーの資格情報ID
      - `public_key` (text) - 公開鍵
      - `counter` (bigint) - 使用カウンター
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)

  2. セキュリティ
    - 両テーブルでRLSを有効化
    - ユーザーは自分のデータのみアクセス可能
*/

-- user_mfa_settings テーブルの作成
CREATE TABLE IF NOT EXISTS user_mfa_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mfa_enabled boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  verification_code text,
  code_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- user_passkeys テーブルの作成
CREATE TABLE IF NOT EXISTS user_passkeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name text NOT NULL,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  counter bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passkeys ENABLE ROW LEVEL SECURITY;

-- user_mfa_settings のポリシー
CREATE POLICY "Users can view own MFA settings"
  ON user_mfa_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MFA settings"
  ON user_mfa_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MFA settings"
  ON user_mfa_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own MFA settings"
  ON user_mfa_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- user_passkeys のポリシー
CREATE POLICY "Users can view own passkeys"
  ON user_passkeys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passkeys"
  ON user_passkeys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passkeys"
  ON user_passkeys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passkeys"
  ON user_passkeys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_user_id ON user_mfa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON user_passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_credential_id ON user_passkeys(credential_id);
