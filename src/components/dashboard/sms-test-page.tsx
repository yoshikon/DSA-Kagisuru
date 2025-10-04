import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { MFAService } from '../../lib/mfa-service';
import { ProfileService } from '../../lib/profile-service';
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  Shield
} from 'lucide-react';

export const SMSTestPage = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadPhoneNumber();
    }
  }, [user]);

  useEffect(() => {
    if (codeSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [codeSent, timeLeft]);

  const loadPhoneNumber = async () => {
    if (!user) return;

    try {
      const profile = await ProfileService.getProfile(user.id);
      if (profile?.phone_number) {
        setPhoneNumber(profile.phone_number);
      }
    } catch (error) {
      console.error('Failed to load phone number:', error);
    }
  };

  const handleSendCode = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'ログインが必要です' });
      return;
    }

    if (!phoneNumber) {
      setMessage({ type: 'error', text: '電話番号を入力してください' });
      return;
    }

    setSendingCode(true);
    setMessage(null);

    try {
      await MFAService.sendVerificationCode(user.id, phoneNumber);
      setCodeSent(true);
      setTimeLeft(600);
      setMessage({
        type: 'success',
        text: `認証コードを ${phoneNumber} に送信しました！SMSをご確認ください。`
      });
    } catch (error: any) {
      console.error('Failed to send SMS:', error);
      setMessage({
        type: 'error',
        text: `SMS送信に失敗しました: ${error.message || '不明なエラー'}`
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'ログインが必要です' });
      return;
    }

    if (verificationCode.length !== 6) {
      setMessage({ type: 'error', text: '6桁の認証コードを入力してください' });
      return;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const isValid = await MFAService.verifyCode(user.id, verificationCode);
      if (isValid) {
        setMessage({
          type: 'success',
          text: '認証に成功しました！SMS認証システムは正常に動作しています。'
        });
        setVerificationCode('');
        setCodeSent(false);
      } else {
        setMessage({
          type: 'error',
          text: '認証コードが正しくないか、有効期限が切れています'
        });
      }
    } catch (error: any) {
      console.error('Failed to verify code:', error);
      setMessage({
        type: 'error',
        text: `認証に失敗しました: ${error.message || '不明なエラー'}`
      });
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <MessageSquare className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">SMS認証テスト</h1>
        </div>
        <p className="text-gray-600">実際にSMSを送信して認証機能をテストします</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">SMS認証テストについて</p>
              <ul className="space-y-1 ml-4">
                <li>• Twilioを使用して実際のSMSが送信されます</li>
                <li>• 6桁の認証コードが携帯電話に届きます</li>
                <li>• コードの有効期限は10分間です</li>
                <li>• テスト送信にも通信料が発生する場合があります</li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              電話番号
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+81 90-1234-5678"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={sendingCode || codeSent}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              国際形式（+81から始まる）または日本国内形式で入力してください
            </p>
          </div>

          <button
            onClick={handleSendCode}
            disabled={sendingCode || !phoneNumber || (codeSent && timeLeft > 540)}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
          >
            {sendingCode ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>送信中...</span>
              </>
            ) : codeSent && timeLeft > 540 ? (
              <>
                <Send className="w-5 h-5" />
                <span>再送信可能まであと {formatTime(timeLeft - 540)}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{codeSent ? 'コードを再送信' : 'SMS認証コードを送信'}</span>
              </>
            )}
          </button>

          {codeSent && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  認証コード（6桁）
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-3xl tracking-widest font-mono"
                  disabled={verifying}
                />

                {timeLeft > 0 && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      コードの有効期限: <span className="font-medium text-green-600">{formatTime(timeLeft)}</span>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleVerify}
                disabled={verifying || verificationCode.length !== 6}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>認証中...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>認証コードを検証</span>
                  </>
                )}
              </button>
            </>
          )}

          {message && (
            <div
              className={`p-4 rounded-lg border flex items-start space-x-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : message.type === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : message.type === 'error' ? (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === 'success'
                    ? 'text-green-800'
                    : message.type === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>トラブルシューティング</span>
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <p className="font-medium">SMSが届かない場合:</p>
            <ul className="ml-4 mt-1 space-y-1 text-gray-600">
              <li>• 電話番号の形式を確認してください（+81から始まる国際形式）</li>
              <li>• 迷惑メッセージフォルダを確認してください</li>
              <li>• 電波状況を確認してください</li>
              <li>• 数分待ってから再送信してください</li>
            </ul>
          </div>
          <div className="mt-3">
            <p className="font-medium">Twilio設定の確認:</p>
            <ul className="ml-4 mt-1 space-y-1 text-gray-600">
              <li>• TWILIO_ACCOUNT_SID が正しく設定されているか</li>
              <li>• TWILIO_AUTH_TOKEN が正しく設定されているか</li>
              <li>• TWILIO_PHONE_NUMBER が正しく設定されているか</li>
              <li>• Twilioアカウントに十分な残高があるか</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
