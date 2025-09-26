import { supabase } from './supabase';

export class EmailService {
  // メール送信（Supabase Edge Functionsを使用）
  static async sendFileNotification(
    recipients: string[],
    fileId: string,
    fileName: string,
    senderMessage?: string
  ): Promise<boolean> {
    try {
      // 各受信者のアクセストークンを取得
      const { data: recipientData, error } = await supabase
        .from('file_recipients')
        .select('email, access_token')
        .eq('file_id', fileId);

      if (error) throw error;

      // 各受信者にメール送信
      for (const recipient of recipientData || []) {
        const accessUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/access?token=${recipient.access_token}`;
        
        await this.sendEmail({
          to: recipient.email,
          subject: `【カギスル】暗号化ファイル「${fileName}」が共有されました`,
          html: this.generateEmailTemplate(fileName, accessUrl, senderMessage)
        });
      }

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('メール送信に失敗しました');
    }
  }

  // 実際のメール送信（Supabase Edge Function経由）
  private static async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) throw error;
    } catch (error) {
      console.error('Supabase function error:', error);
      // フォールバック: コンソールログ（開発用）
      console.log('📧 メール送信（デモ）:', emailData);
    }
  }

  // メールテンプレート生成
  private static generateEmailTemplate(
    fileName: string,
    accessUrl: string,
    senderMessage?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>カギスル - 暗号化ファイル共有</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .file-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .access-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .message { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .security-note { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 カギスル</h1>
            <p>セキュアファイル共有サービス</p>
          </div>
          
          <div class="content">
            <h2>暗号化ファイルが共有されました</h2>
            
            <div class="file-info">
              <h3>📁 ${fileName}</h3>
              <p>このファイルはAES-256暗号化により保護されています。</p>
            </div>

            ${senderMessage ? `
              <div class="message">
                <h4>💬 送信者からのメッセージ:</h4>
                <p>${senderMessage}</p>
              </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="${accessUrl}" class="access-button">
                🔓 ファイルにアクセス
              </a>
            </div>

            <div class="security-note">
              <h4>🛡️ セキュリティについて</h4>
              <ul>
                <li>ファイルは軍用レベルのAES-256暗号化で保護されています</li>
                <li>アクセスには生体認証またはワンタイムパスワードが必要です</li>
                <li>ファイルは指定期限後に自動削除されます</li>
                <li>このリンクは他の人と共有しないでください</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>このメールは カギスル（https://kagisuru.com）から送信されました</p>
            <p>心当たりがない場合は、このメールを削除してください</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // OTP送信
  static async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      await this.sendEmail({
        to: email,
        subject: '【カギスル】認証コード',
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2>🔐 認証コード</h2>
            <p>ファイルアクセスのための認証コードです：</p>
            <div style="background: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #3B82F6;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">このコードは10分間有効です。</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('OTP send error:', error);
      return false;
    }
  }
}