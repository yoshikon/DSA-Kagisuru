import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  // CORS対応
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('📧 メール送信リクエストを受信しました');
    const { to, subject, html, senderName } = await req.json();
    
    if (!to || !subject || !html) {
      throw new Error('必須パラメータが不足しています: to, subject, html');
    }
    
    console.log(`📧 メール送信先: ${to}`);
    console.log(`📧 件名: ${subject}`);

    // Resend APIキーを取得
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY が設定されていません。開発環境用のシミュレーションを実行します。');
      
      // 開発環境用のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ メール送信完了（シミュレーション）: ${to}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: `sim_${Date.now()}`,
          message: 'Email sent successfully (simulation mode)'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    console.log('📧 Resend SDKでメール送信中...');
    
    // Resend SDKを使用してメール送信
    const resend = new Resend(resendApiKey);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: html,
      reply_to: senderName ? `${senderName} <noreply@resend.dev>` : undefined,
    });

    if (error) {
      console.error('❌ Resend SDK エラー:', error);
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    console.log(`✅ メール送信成功: ${to} (ID: ${data?.id})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: data?.id,
        message: 'Email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('❌ メール送信エラー:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Email sending failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});