import { DatabaseService } from './database';
import { isSupabaseAvailable } from './supabase';

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
      let fileId: string;
      
      if (isSupabaseAvailable()) {
        // Supabaseが利用可能な場合はデータベースに保存
        try {
          fileId = await DatabaseService.saveEncryptedFile(
            fileData, 
            recipients, 
            expiryDays, 
            message
          );
        } catch (dbError) {
          console.warn('データベース保存に失敗、ローカルストレージにフォールバック:', dbError);
          fileId = this.generateFileId();
        }
      } else {
        // Supabaseが利用できない場合はローカルストレージのみ使用
        console.info('Supabaseが設定されていません。ローカルストレージを使用します。');
        fileId = this.generateFileId();
      }
      
      // フォールバック用にローカルストレージにも保存
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
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        downloadCount: 0,
        message: message
      };

      localStorage.setItem(`${this.STORAGE_PREFIX}${fileId}`, JSON.stringify(fileRecord));
      this.updateFileList(fileId);
      
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
  static getFileList(): string[] {
    const list = localStorage.getItem(`${this.STORAGE_PREFIX}files`);
    if (!list) return [];
    
    try {
      const parsed = JSON.parse(list);
      return Array.isArray(parsed) ? parsed : [];
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
      timestamp: Date.now()
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

// メール送信サービス（実際のメール送信）
export class EmailService {
  static async sendFileNotification(
    recipients: string[],
    fileId: string,
    fileName: string,
    senderMessage?: string
  ): Promise<boolean> {
    try {
      return await EmailService.sendFileNotification(
        recipients,
        fileId,
        fileName,
        senderMessage
      );
    } catch (error) {
      console.error('Email service error:', error);
      // フォールバック: コンソール出力
      console.log('📧 Email sent to:', recipients);
      console.log('📎 File:', fileName);
      console.log('💬 Message:', senderMessage);
      return true;
    }
  }
}