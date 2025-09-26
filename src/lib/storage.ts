import { DatabaseService } from './database';
import { isSupabaseAvailable } from './supabase';
import { EmailService } from './email-service';

// ローカルストレージヘルパー（フォールバック用）
export class FileStorage {
  private static readonly STORAGE_PREFIX = 'kagisuru_';

  // 暗号化ファイル保存（デモ用、実際はCloudflare R2使用）
  static async saveEncryptedFile(fileData: {
    encryptedData: Uint8Array;
    salt: Uint8Array;
    iv: Uint8Array;
    originalName: string;
    mimeType: string;
    size: number;
  }, recipients: string[], expiryDays: number = 7, message?: string): Promise<string> {
    try {
      // 環境変数チェック
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let fileId: string;
      let useDatabase = false;
      let accessTokens: { [email: string]: string } = {};
      
      // Supabaseの設定が完全かチェック（より厳密に）
      if (supabaseUrl && supabaseKey && 
          supabaseUrl !== 'your-supabase-url' && 
          supabaseKey !== 'your-supabase-anon-key' &&
          supabaseUrl.startsWith('https://') &&
          supabaseKey.length > 20) {
        try {
          console.log('Supabaseデータベースに保存を試行中...');
          const result = await DatabaseService.saveEncryptedFile(
            fileData, 
            recipients, 
            expiryDays, 
            message
          );
          fileId = result.fileId;
          accessTokens = result.accessTokens;
          useDatabase = true;
          console.log('データベース保存成功:', fileId);
        } catch (dbError) {
          console.warn('データベース保存に失敗、ローカルストレージを使用:', dbError);
          fileId = this.generateFileId();
          // ローカル用のアクセストークン生成
          recipients.forEach(email => {
            accessTokens[email] = this.generateAccessToken(fileId, email);
          });
        }
      } else {
        console.info('Supabase環境変数が未設定または無効です。ローカルストレージを使用します。');
        fileId = this.generateFileId();
        // ローカル用のアクセストークン生成
        recipients.forEach(email => {
          accessTokens[email] = this.generateAccessToken(fileId, email);
        });
      }
      
      // ローカルストレージに保存（バックアップまたはメイン）
      const encryptedBase64 = btoa(String.fromCharCode(...fileData.encryptedData));
      const saltBase64 = btoa(String.fromCharCode(...fileData.salt));
      const ivBase64 = btoa(String.fromCharCode(...fileData.iv));

      const fileRecord = {
        id: fileId,
        encryptedData: encryptedBase64,
        salt: saltBase64,
        iv: ivBase64,
        originalName: fileData.originalName,
        mimeType: fileData.mimeType,
        size: fileData.size,
        recipients: recipients,
        accessTokens: accessTokens,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        downloadCount: 0,
        message: message
      };

      localStorage.setItem(`${this.STORAGE_PREFIX}${fileId}`, JSON.stringify(fileRecord));
      this.updateFileList(fileId);
      
      if (!useDatabase) {
        console.log('ローカルストレージ保存完了:', fileId);
      }
      
      // メール送信
      try {
        console.log('📧 メール送信開始...');
        await EmailService.sendFileNotification(
          recipients,
          fileId,
          fileData.originalName,
          accessTokens,
          message
        );
        console.log('✅ メール送信完了');
      } catch (emailError) {
        console.warn('⚠️ メール送信に失敗:', emailError);
        // メール送信失敗でもファイル保存は成功として扱う
      }
      
      return fileId;
    } catch (error) {
      console.error('File save error:', error);
      throw error;
    }
  }

  // ファイルID生成
  private static generateFileId(): string {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ファイル取得
  static getFile(fileId: string): any | null {
    try {
      // まずデータベースから取得を試行
      DatabaseService.getFileById(fileId).then(dbData => {
        if (dbData) return dbData;
      });
      
      // フォールバック: ローカルストレージから取得
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${fileId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('File fetch error:', error);
      return null;
    }
  }

  // ファイル一覧取得
  static getFileList(): any[] {
    // データベースから取得を試行
    if (isSupabaseAvailable()) {
      try {
        DatabaseService.getUserFiles().then(files => {
          if (files && files.length > 0) {
            return files;
          }
        });
      } catch (error) {
        console.warn('データベースからのファイル取得に失敗:', error);
      }
    }
    
    // ローカルストレージから取得
    const list = localStorage.getItem(`${this.STORAGE_PREFIX}files`);
    if (!list) return [];
    
    try {
      const fileIds = JSON.parse(list);
      if (!Array.isArray(fileIds)) return [];
      
      // 各ファイルの詳細情報を取得
      const files = fileIds.map(fileId => {
        const fileData = this.getFile(fileId);
        if (!fileData) return null;
        
        return {
          id: fileData.id,
          original_name: fileData.originalName,
          file_size: fileData.size,
          mime_type: fileData.mimeType,
          created_at: fileData.createdAt,
          expires_at: fileData.expiresAt,
          download_count: fileData.downloadCount || 0,
          message: fileData.message,
          file_recipients: fileData.recipients?.map(email => ({ email })) || []
        };
      }).filter(Boolean);
      
      return files;
    } catch {
      return [];
    }
  }

  // ファイル一覧更新
  private static updateFileList(fileId: string) {
    const currentList = this.getFileList();
    const updatedList = [...currentList, fileId];
    localStorage.setItem(`${this.STORAGE_PREFIX}files`, JSON.stringify(updatedList));
  }

  // ファイル削除
  static deleteFile(fileId: string): boolean {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${fileId}`);
      
      // ファイル一覧からも削除
      const currentList = this.getFileList();
      const updatedList = currentList.filter(id => id !== fileId);
      localStorage.setItem(`${this.STORAGE_PREFIX}files`, JSON.stringify(updatedList));
      
      return true;
    } catch {
      return false;
    }
  }

  // アクセストークン生成
  static generateAccessToken(fileId: string, email: string): string {
    const tokenData = {
      fileId,
      email,
      timestamp: Date.now(),
      random: Math.random().toString(36).substr(2, 9)
    };
    return btoa(JSON.stringify(tokenData));
  }

  // アクセストークン検証
  static verifyAccessToken(token: string): { fileId: string; email: string } | null {
    try {
      // データベースでトークン検証
      DatabaseService.getFileByToken(token).then(data => {
        if (data) {
          return { 
            fileId: data.encrypted_files.id, 
            email: data.email 
          };
        }
      });
      
      // フォールバック: 従来の方式
      const tokenData = JSON.parse(atob(token));
      return { fileId: tokenData.fileId, email: tokenData.email };
    } catch {
      return null;
    }
  }
}
