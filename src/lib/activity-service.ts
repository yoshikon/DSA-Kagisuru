import { supabase } from './supabase';

export interface Activity {
  id: string;
  type: 'file_sent' | 'file_received' | 'file_accessed' | 'file_downloaded' | 'auth_failed';
  title: string;
  description: string;
  icon: 'send' | 'inbox' | 'eye' | 'download' | 'alert';
  timestamp: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    recipientEmail?: string;
    senderEmail?: string;
    accessCount?: number;
  };
}

export interface FileHistory {
  id: string;
  fileName: string;
  fileSize: number;
  recipientEmail: string;
  status: 'active' | 'expired' | 'downloaded';
  sentAt: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads?: number;
  accessToken: string;
}

export class ActivityService {
  static async getRecentActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    const activities: Activity[] = [];

    try {
      const [sentFiles, receivedFiles, accessLogs] = await Promise.all([
        this.getSentFilesActivity(userId, limit),
        this.getReceivedFilesActivity(userId, limit),
        this.getAccessLogsActivity(userId, limit),
      ]);

      activities.push(...sentFiles, ...receivedFiles, ...accessLogs);

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent activities:', error);
      return [];
    }
  }

  private static async getSentFilesActivity(userId: string, limit: number): Promise<Activity[]> {
    const { data: files, error } = await supabase
      .from('encrypted_files')
      .select(`
        id,
        original_name,
        file_size,
        created_at,
        file_recipients (
          email,
          access_count,
          last_accessed_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !files) {
      console.error('Error fetching sent files:', error);
      return [];
    }

    return files.map(file => {
      const recipients = Array.isArray(file.file_recipients) ? file.file_recipients : [file.file_recipients];
      const recipientEmail = recipients[0]?.email || '不明';
      const accessCount = recipients.reduce((sum, r) => sum + (r.access_count || 0), 0);

      return {
        id: `sent-${file.id}`,
        type: 'file_sent' as const,
        title: 'ファイルを送信しました',
        description: `${file.original_name} を ${recipientEmail} に送信`,
        icon: 'send' as const,
        timestamp: file.created_at,
        metadata: {
          fileName: file.original_name,
          fileSize: file.file_size,
          recipientEmail,
          accessCount,
        },
      };
    });
  }

  private static async getReceivedFilesActivity(userId: string, limit: number): Promise<Activity[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return [];

    const { data: recipients, error } = await supabase
      .from('file_recipients')
      .select(`
        id,
        email,
        created_at,
        access_count,
        encrypted_files (
          original_name,
          file_size
        )
      `)
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !recipients) {
      console.error('Error fetching received files:', error);
      return [];
    }

    return recipients.map(recipient => {
      const file = recipient.encrypted_files as any;
      return {
        id: `received-${recipient.id}`,
        type: 'file_received' as const,
        title: 'ファイルを受信しました',
        description: `${file?.original_name || '不明なファイル'} を受信`,
        icon: 'inbox' as const,
        timestamp: recipient.created_at,
        metadata: {
          fileName: file?.original_name,
          fileSize: file?.file_size,
          accessCount: recipient.access_count || 0,
        },
      };
    });
  }

  private static async getAccessLogsActivity(userId: string, limit: number): Promise<Activity[]> {
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select(`
        id,
        action,
        recipient_email,
        success,
        created_at,
        encrypted_files (
          original_name,
          user_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !logs) {
      console.error('Error fetching access logs:', error);
      return [];
    }

    return logs.map(log => {
      const file = log.encrypted_files as any;
      let title = '';
      let icon: 'eye' | 'download' | 'alert' = 'eye';
      let type: Activity['type'] = 'file_accessed';

      if (log.action === 'download') {
        title = 'ファイルがダウンロードされました';
        icon = 'download';
        type = 'file_downloaded';
      } else if (log.action === 'view') {
        title = 'ファイルが閲覧されました';
        icon = 'eye';
        type = 'file_accessed';
      } else if (log.action === 'failed_auth') {
        title = '認証に失敗しました';
        icon = 'alert';
        type = 'auth_failed';
      }

      return {
        id: `log-${log.id}`,
        type,
        title,
        description: `${log.recipient_email || '不明'} が ${file?.original_name || 'ファイル'} にアクセス`,
        icon,
        timestamp: log.created_at,
        metadata: {
          fileName: file?.original_name,
          recipientEmail: log.recipient_email || undefined,
        },
      };
    });
  }

  static async getFileHistory(userId: string, limit: number = 20): Promise<FileHistory[]> {
    try {
      const { data: files, error } = await supabase
        .from('encrypted_files')
        .select(`
          id,
          original_name,
          file_size,
          created_at,
          expires_at,
          max_downloads,
          download_count,
          file_recipients (
            email,
            access_count,
            access_token
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !files) {
        console.error('Error fetching file history:', error);
        return [];
      }

      return files.map(file => {
        const recipients = Array.isArray(file.file_recipients) ? file.file_recipients : [file.file_recipients];
        const recipient = recipients[0] || { email: '不明', access_count: 0, access_token: '' };

        const now = new Date();
        const expiresAt = new Date(file.expires_at);
        const isExpired = now > expiresAt;
        const isDownloaded = file.max_downloads && file.download_count >= file.max_downloads;

        let status: 'active' | 'expired' | 'downloaded' = 'active';
        if (isExpired) status = 'expired';
        else if (isDownloaded) status = 'downloaded';

        return {
          id: file.id,
          fileName: file.original_name,
          fileSize: file.file_size,
          recipientEmail: recipient.email,
          status,
          sentAt: file.created_at,
          expiresAt: file.expires_at,
          downloadCount: file.download_count || 0,
          maxDownloads: file.max_downloads || undefined,
          accessToken: recipient.access_token,
        };
      });
    } catch (error) {
      console.error('Failed to get file history:', error);
      return [];
    }
  }

  static async logFileAccess(
    fileId: string,
    recipientEmail: string,
    action: 'view' | 'download' | 'failed_auth',
    success: boolean = true,
    userId?: string
  ): Promise<void> {
    try {
      await supabase.from('access_logs').insert({
        file_id: fileId,
        recipient_email: recipientEmail,
        action,
        success,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log file access:', error);
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  static formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
