/*
  # カギスル初期データベーススキーマ

  1. テーブル作成
    - `encrypted_files` - 暗号化ファイル情報
    - `file_recipients` - ファイル受信者情報
    - `access_logs` - アクセスログ

  2. セキュリティ
    - Row Level Security (RLS) 有効化
    - 基本的なアクセスポリシー設定

  3. 機能
    - 自動タイムスタンプ
    - カスケード削除
    - インデックス設定
*/

-- 暗号化ファイルテーブル
CREATE TABLE IF NOT EXISTS encrypted_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ファイル情報
    original_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    
    -- 暗号化データ（Base64エンコード済み）
    encrypted_data TEXT NOT NULL,
    salt TEXT NOT NULL,
    iv TEXT NOT NULL,
    
    -- 制御情報
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_downloads INTEGER DEFAULT NULL,
    download_count INTEGER DEFAULT 0,
    
    -- メタデータ
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 受信者テーブル
CREATE TABLE IF NOT EXISTS file_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES encrypted_files(id) ON DELETE CASCADE,
    
    -- 受信者情報
    email TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    
    -- アクセス制御
    access_token TEXT UNIQUE NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アクセスログテーブル
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES encrypted_files(id) ON DELETE SET NULL,
    recipient_email TEXT,
    
    -- アクション情報
    action TEXT NOT NULL CHECK (action IN ('view', 'download', 'failed_auth')),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_encrypted_files_expires_at ON encrypted_files(expires_at);
CREATE INDEX IF NOT EXISTS idx_file_recipients_access_token ON file_recipients(access_token);
CREATE INDEX IF NOT EXISTS idx_file_recipients_file_id ON file_recipients(file_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_file_id ON access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);

-- Row Level Security有効化
ALTER TABLE encrypted_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- 基本ポリシー（開発版では全アクセス許可）
CREATE POLICY "Allow all access to encrypted_files" ON encrypted_files
    FOR ALL USING (true);

CREATE POLICY "Allow all access to file_recipients" ON file_recipients
    FOR ALL USING (true);

CREATE POLICY "Allow all access to access_logs" ON access_logs
    FOR ALL USING (true);

-- ダウンロード数増加用の関数
CREATE OR REPLACE FUNCTION increment_download_count(file_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE encrypted_files 
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = file_id;
END;
$$ LANGUAGE plpgsql;

-- 期限切れファイル削除用の関数
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM encrypted_files 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;