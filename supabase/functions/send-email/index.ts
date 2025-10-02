// Supabase Edge Function for sending emails
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 メール送信リクエストを受信しました');
    const { to, subject, html, senderName } = await req.json()
    
    if (!to || !subject || !html) {
      throw new Error('必須パラメータが不足しています: to, subject, html')
    }
    
    console.log(`📧 メール送信先: ${to}`);
    console.log(`📧 件名: ${subject}`);

    // 実際のメール送信処理
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
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
      )
    }

    console.log('📧 Resend APIでメール送信中...');
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName || 'カギエース'} <noreply@kagisuru.com>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      console.error('❌ Resend API エラー:', error);
      throw new Error(`Resend API error: ${error}`)
    }

    const result = await emailResponse.json()
    console.log(`✅ メール送信成功: ${to} (ID: ${result.id})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.id,
        message: 'Email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ メール送信エラー:', error)
    
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
    )
  }
})