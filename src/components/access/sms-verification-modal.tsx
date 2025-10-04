import { useState, useEffect } from 'react';
import { X, Smartphone, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { MFAService } from '../../lib/mfa-service';

interface SMSVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  userId: string;
  phoneNumber: string;
}

export function SMSVerificationModal({
  isOpen,
  onClose,
  onVerified,
  userId,
  phoneNumber
}: SMSVerificationModalProps) {
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && !codeSent) {
      handleSendCode();
    }
  }, [isOpen]);

  useEffect(() => {
    if (codeSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [codeSent, timeLeft]);

  const handleSendCode = async () => {
    setSendingCode(true);
    setError('');
    setSuccess('');

    try {
      await MFAService.sendVerificationCode(userId, phoneNumber);
      setCodeSent(true);
      setTimeLeft(600);
      setSuccess(`認証コードを ${phoneNumber} に送信しました`);
    } catch (err: any) {
      setError('認証コードの送信に失敗しました');
      console.error('Failed to send SMS:', err);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('6桁の認証コードを入力してください');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const isValid = await MFAService.verifyCode(userId, code);
      if (isValid) {
        setSuccess('認証に成功しました');
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1000);
      } else {
        setError('認証コードが正しくないか、有効期限が切れています');
      }
    } catch (err: any) {
      setError('認証に失敗しました');
      console.error('Failed to verify code:', err);
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SMS認証</h2>
          <p className="text-sm text-gray-600">
            {phoneNumber} に送信された6桁の認証コードを入力してください
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              認証コード（6桁）
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-3xl tracking-widest font-mono"
              disabled={verifying}
            />
          </div>

          {codeSent && timeLeft > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                コードの有効期限: <span className="font-medium text-green-600">{formatTime(timeLeft)}</span>
              </p>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>認証中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>認証する</span>
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleSendCode}
              disabled={sendingCode || timeLeft > 540}
              className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingCode ? '送信中...' : 'コードを再送信'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>SMSが届かない場合:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
            <li>• 電話番号が正しいか確認してください</li>
            <li>• 迷惑メッセージフォルダを確認してください</li>
            <li>• 数分待ってから再送信してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
