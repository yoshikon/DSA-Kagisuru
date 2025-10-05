/*
  # ユーザー追跡機能の追加

  1. 変更内容
    - `encrypted_files` テーブルに `user_id` カラムを追加（ファイル送信者の追跡）
    - `file_recipients` テーブルに `sender_id` カラムを追加（送信者の追跡）
    - 既存データへの影響を最小限に（NULL許可）

  2. セキュリティ
    - RLSポリシーは既に設定済み
    - ユーザーは自分が送信したファイルのみ閲覧可能
*/

-- encrypted_files テーブルに user_id を追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encrypted_files' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE encrypted_files ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_encrypted_files_user_id ON encrypted_files(user_id);
  END IF;
END $$;

-- file_recipients テーブルに sender_id を追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'file_recipients' AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE file_recipients ADD COLUMN sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_file_recipients_sender_id ON file_recipients(sender_id);
  END IF;
END $$;

-- access_logs テーブルに user_id を追加（ファイル所有者）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_logs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE access_logs ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
  END IF;
END $$;