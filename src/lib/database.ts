import { supabase, isSupabaseAvailable } from './supabase';
import type { EncryptedFile, FileRecipient } from '../types';

export class DatabaseService {
  // Helper function to convert Uint8Array to Base64 in chunks to avoid call stack overflow
  private static uint8ArrayToBase64(uint8Array: Uint8Array): string {
    const chunkSize = 8192; // Process in 8KB chunks
    let result = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      result += String.fromCharCode(...chunk);
    }
    
    return btoa(result);
  }

  // 暗号化ファイルをデータベースに保存
  static async saveEncryptedFile(fileData: {
    encryptedData: Uint8Array;
    salt: Uint8Array;
    iv: Uint8Array;
    originalName: string;
    mimeType: string;
    size: number;
  }, recipients: string[], expiryDays: number, message?: string, requireVerification: boolean = true): Promise<{ fileId: string; accessTokens: { [email: string]: string } }> {
    // Supabaseが利用できない場合はエラーを投げる
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('データベースサービスが利用できません。環境変数を確認してください。');
    }

    try {
      // ArrayBufferをBase64に変換
      const encryptedBase64 = this.uint8ArrayToBase64(fileData.encryptedData);
      const saltBase64 = this.uint8ArrayToBase64(fileData.salt);
      const ivBase64 = this.uint8ArrayToBase64(fileData.iv);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // ファイル情報をデータベースに保存
      const { data: fileRecord, error: fileError } = await supabase
        .from('encrypted_files')
        .insert({
          original_name: fileData.originalName,
          file_size: fileData.size,
          mime_type: fileData.mimeType,
          encrypted_data: encryptedBase64,
          salt: saltBase64,
          iv: ivBase64,
          expires_at: expiresAt.toISOString(),
          message: message || null,
          download_count: 0,
          require_verification: requireVerification
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // アクセストークンを生成
      const accessTokens: { [email: string]: string } = {};
      
      // 受信者情報を保存
      const recipientRecords = recipients.map(email => {
        const accessToken = this.generateAccessToken();
        accessTokens[email] = accessToken;
        
        return {
          file_id: fileRecord.id,
          email: email,
          encrypted_key: btoa(email), // 簡素化版（実際はより強固な暗号化が必要）
          access_token: accessToken,
          access_count: 0
        };
      });

      const { error: recipientError } = await supabase
        .from('file_recipients')
        .insert(recipientRecords);

      if (recipientError) throw recipientError;

      return { 
        fileId: fileRecord.id, 
        accessTokens: accessTokens 
      };
    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('ファイルの保存に失敗しました');
    }
  }

  // アクセストークン生成
  private static generateAccessToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }

  // ファイル情報取得
  static async getFileById(fileId: string): Promise<any | null> {
    // Supabase設定の厳密なチェック
    if (!supabase || !isSupabaseAvailable()) {
      console.info('Supabase設定が無効または未設定のため、getFileByIdをスキップします。');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('encrypted_files')
        .select(`
          *,
          file_recipients (*)
        `)
        .eq('id', fileId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('File fetch error:', error);
      return null;
    }
  }

  // アクセストークンでファイル取得
  static async getFileByToken(token: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('file_recipients')
        .select(`
          *,
          encrypted_files (*)
        `)
        .eq('access_token', token)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Token fetch error:', error);
      return null;
    }
  }

  // ユーザーのファイル一覧取得
  static async getUserFiles(userId?: string): Promise<any[]> {
    if (!isSupabaseAvailable() || !supabase) {
      console.info('Supabaseが利用できません。空のファイル一覧を返します。');
      return [];
    }

    try {
      // デモ版では全ファイルを取得（実際はユーザーIDでフィルタ）
      const { data, error } = await supabase
        .from('encrypted_files')
        .select(`
          *,
          file_recipients (email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Files fetch error:', error);
      return [];
    }
  }

  // ファイル削除
  static async deleteFile(fileId: string): Promise<boolean> {
    if (!isSupabaseAvailable() || !supabase) {
      console.warn('Supabaseが利用できません。deleteFileをスキップします。');
      return false;
    }

    try {
      const { error } = await supabase
        .from('encrypted_files')
        .delete()
        .eq('id', fileId);

      return !error;
    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  }

  // ダウンロード数更新
  static async incrementDownloadCount(fileId: string): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) {
      console.warn('Supabaseが利用できません。incrementDownloadCountをスキップします。');
      return;
    }

    try {
      await supabase.rpc('increment_download_count', { file_id: fileId });
    } catch (error) {
      console.error('Download count update error:', error);
    }
  }
}