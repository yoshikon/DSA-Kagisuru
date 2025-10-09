/*
  # ユーザープロファイルにマスターパスワード機能を追加

  1. 変更内容
    - `user_profiles` テーブルに `master_password_hash` カラムを追加
    - マスターパスワードのハッシュを保存（暗号化キーの派生に使用）
    - パスワードの生ハッシュではなく、暗号化キーの派生情報を保存

  2. セキュリティ
    - パスワードは直接保存せず、ハッシュ化して保存
    - RLSポリシーにより、ユーザー本人のみがアクセス可能
*/

-- user_profiles テーブルに master_password_hash を追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'master_password_hash'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN master_password_hash text;
  END IF;
END $$;

-- master_password_salt を追加（パスワード派生用のソルト）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'master_password_salt'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN master_password_salt text;
  END IF;
END $$;