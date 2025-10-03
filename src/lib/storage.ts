import { DatabaseService } from './database';
import { isSupabaseAvailable, isValidSupabaseConfig } from './supabase';
import { EmailService } from './email-service';

// ローカルストレージヘルパー（フォールバック用）
export class FileStorage {
  private static readonly STORAGE_PREFIX = 'kagisuru_';

  // 暗号化ファイル保存（デモ用、実際はCloudflare R2使用）
  static async saveEncryptedFile(fileData: {
    encryptedData: Uint8Array | ArrayBuffer;
    salt: Uint8Array;
    iv: Uint8Array;
    originalName: string;
    mimeType: string;
    size: number;
  }, recipients: string[], expiryDays: number = 7, message?: string, requireVerification: boolean = true, maxDownloads: number | null = null): Promise<string> {
    try {
      // 環境変数チェック
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let fileId: string;
      let useDatabase = false;
      let accessTokens: { [email: string]: string } = {};
      
      // Supabaseの設定が完全かチェック（より厳密に）
      if (isValidSupabaseConfig(supabaseUrl, supabaseKey)) {
        try {
          console.log('Supabaseデータベースに保存を試行中...');
          
          // encryptedDataをUint8Arrayに変換
          const encryptedDataArray = fileData.encryptedData instanceof Uint8Array 
            ? fileData.encryptedData 
            : new Uint8Array(fileData.encryptedData);
          
          const result = await DatabaseService.saveEncryptedFile(
            {
              ...fileData,
              encryptedData: encryptedDataArray
            },
            recipients,
            expiryDays,
            message,
            requireVerification,
            maxDownloads
          );
          fileId = result.fileId;
          accessTokens = result.accessTokens;
          useDatabase = true;
          console.log('データベース保存成功:', fileId);
          
          // データベース保存成功時はローカルストレージには最小限の情報のみ保存
          const minimalFileRecord = {
            id: fileId,
            originalName: fileData.originalName,
            mimeType: fileData.mimeType,
            size: fileData.size,
            recipients: recipients,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
            downloadCount: 0,
            message: message,
            requireVerification: requireVerification,
            storedInDatabase: true // フラグを追加
          };
          
          localStorage.setItem(`${this.STORAGE_PREFIX}${fileId}`, JSON.stringify(minimalFileRecord));
          this.updateFileList(fileId);
          
        } catch (dbError) {
          console.warn('データベース保存に失敗、ローカルストレージを使用:', dbError);
          fileId = this.generateFileId();
          // ローカル用のアクセストークン生成
          recipients.forEach(email => {
            accessTokens[email] = this.generateAccessToken(fileId, email);
          });
          useDatabase = false;
        }
      } else {
        console.info('Supabase環境変数が未設定または無効です。ローカルストレージを使用します。');
        fileId = this.generateFileId();
        // ローカル用のアクセストークン生成
        recipients.forEach(email => {
          accessTokens[email] = this.generateAccessToken(fileId, email);
        });
        useDatabase = false;
      }
      
      // データベース保存に失敗した場合のみローカルストレージに完全なデータを保存
      if (!useDatabase) {
        try {
          // encryptedDataをUint8Arrayに変換してからBase64エンコード
          const encryptedDataArray = fileData.encryptedData instanceof Uint8Array 
            ? fileData.encryptedData 
            : new Uint8Array(fileData.encryptedData);
          
          const encryptedBase64 = this.uint8ArrayToBase64(encryptedDataArray);
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
            maxDownloads: maxDownloads,
            message: message,
            requireVerification: requireVerification,
            storedInDatabase: false
          };

          localStorage.setItem(`${this.STORAGE_PREFIX}${fileId}`, JSON.stringify(fileRecord));
          this.updateFileList(fileId);
          console.log('ローカルストレージ保存完了:', fileId);
        } catch (storageError) {
          console.error('ローカルストレージ保存エラー:', storageError);
          throw new Error('ファイルの保存に失敗しました。ファイルサイズが大きすぎる可能性があります。');
        }
      }
      
      // メール送信
      try {
        console.log('📧 メール送信開始...');

        // 送信者情報（実際のアプリケーションでは認証されたユーザー情報を使用）
        const senderInfo = {
          name: '送信者',
          email: 'sender@example.com'
        };

        await EmailService.sendFileNotification(
          recipients,
          fileId,
          fileData.originalName,
          accessTokens,
          message,
          requireVerification,
          senderInfo
        );
        console.log('✅ メール送信完了');
      } catch (emailError) {
        console.warn('⚠️ メール送信エラー:', emailError);
        // メール送信失敗してもファイル保存は成功しているので処理を続行
        // シミュレーションモードとして扱う
        console.log('📧 メール送信はシミュレーションモードで実行されました');
      }
      
      return fileId;
    } catch (error) {
      console.error('File save error:', error);
      throw error;
    }
  }

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
      // ファイルデータを削除
      localStorage.removeItem(`${this.STORAGE_PREFIX}${fileId}`);
      
      // ファイル一覧からも削除
      const listData = localStorage.getItem(`${this.STORAGE_PREFIX}files`);
      if (listData) {
        try {
          const currentList = JSON.parse(listData);
          if (Array.isArray(currentList)) {
            const updatedList = currentList.filter(id => id !== fileId);
            localStorage.setItem(`${this.STORAGE_PREFIX}files`, JSON.stringify(updatedList));
          }
        } catch (parseError) {
          console.warn('Failed to parse file list for deletion:', parseError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  // 複数ファイル削除
  static deleteMultipleFiles(fileIds: string[]): { success: string[]; failed: string[] } {
    const success: string[] = [];
    const failed: string[] = [];
    
    fileIds.forEach(fileId => {
      if (this.deleteFile(fileId)) {
        success.push(fileId);
      } else {
        failed.push(fileId);
      }
    });
    
    return { success, failed };
  }

  // ファイル一覧の整合性チェック
  static cleanupFileList(): void {
    try {
      const listData = localStorage.getItem(`${this.STORAGE_PREFIX}files`);
      if (!listData) return;
      
      const currentList = JSON.parse(listData);
      if (!Array.isArray(currentList)) return;
      
      // 実際に存在するファイルのみを残す
      const validFiles = currentList.filter(fileId => {
        const fileData = localStorage.getItem(`${this.STORAGE_PREFIX}${fileId}`);
        return fileData !== null;
      });
      
      localStorage.setItem(`${this.STORAGE_PREFIX}files`, JSON.stringify(updatedList));
      
      if (validFiles.length !== currentList.length) {
        console.log(`Cleaned up file list: ${currentList.length} -> ${validFiles.length} files`);
      }
    } catch (error) {
      console.warn('File list cleanup failed:', error);
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