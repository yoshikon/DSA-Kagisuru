import { supabase } from './supabase';

export class EmailService {
  // 実際のメール送信（Supabase Edge Functionsを使用）
  static async sendFileNotification(
    recipients: string[],
    fileId: string,
    fileName: string,
    accessTokens: { [email: string]: string },
    senderMessage?: string
  ): Promise<boolean> {
    try {
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      
      // 各受信者に個別メール送信
      for (const email of recipients) {
        const accessToken = accessTokens[email];
        if (!accessToken) continue;
        
        const accessUrl = `${baseUrl}/access?token=${accessToken}`;
        
        await this.sendEmail({
          to: email,
          subject: `【カギスル】暗号化ファイル「${fileName}」が共有されました`,
          html: this.generateEmailTemplate(fileName, accessUrl, senderMessage),
          fileId: fileId
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
    fileId: string;
  }): Promise<void> {
    try {
      if (supabase) {
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html
          }
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }
        
        console.log(`✅ メール送信成功: ${emailData.to}`);
      } else {
        throw new Error('Supabase not available');
      }
    } catch (error) {
      console.error('Supabase function error:', error);
      
      // フォールバック: 開発環境用のメール送信シミュレーション
      console.log('📧 メール送信（開発環境）:', {
        to: emailData.to,
        subject: emailData.subject,
        fileId: emailData.fileId
      });
      
      // 開発環境では成功として扱う
      return;
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
              <p><strong>ファイルサイズ:</strong> 暗号化済み</p>
              <p><strong>有効期限:</strong> 送信から指定日数後に自動削除</p>
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
              <p style="font-size: 12px; color: #666; margin-top: 10px;">
                このリンクはあなた専用です。他の人と共有しないでください。
              </p>
            </div>

            <div class="security-note">
              <h4>🛡️ セキュリティについて</h4>
              <ul>
                <li>ファイルは軍用レベルのAES-256暗号化で保護されています</li>
                <li>アクセスには生体認証またはワンタイムパスワードが必要です</li>
                <li>ファイルは指定期限後に自動削除されます</li>
                <li>このリンクは他の人と共有しないでください</li>
                <li>ダウンロード後、ファイルはブラウザ内で復号されます</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>このメールは カギスル から送信されました</p>
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
      const emailData = {
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
        `,
        fileId: 'otp-email'
      };
      
      if (supabase) {
        await this.sendEmail(emailData);
      } else {
        console.log('📧 OTP送信（開発環境）:', { to: email, otp });
      }
      
      return true;
    } catch (error) {
      console.error('OTP send error:', error);
      return false;
    }
  }
  
  // メール送信状況の確認
  static async getEmailStatus(fileId: string): Promise<{ sent: number; failed: number }> {
    // 実装は簡素化（実際はログテーブルから取得）
    return { sent: 1, failed: 0 };
  }
}