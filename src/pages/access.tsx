import React, { useState, useEffect } from 'react';
import { FileInfo } from '../components/access/file-info';
import { AuthMethodSelector } from '../components/access/auth-method-selector';
import { Download } from 'lucide-react';
import { WebAuthnAuth, FileEncryption } from '../lib/crypto';
import { DatabaseService } from '../lib/database';

export function AccessPage() {
  const token = new URLSearchParams(window.location.search).get('token');
  
  const [fileData, setFileData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      DatabaseService.getFileByToken(token).then(data => {
        if (data && data.encrypted_files) {
          setFileData({
            ...data.encrypted_files,
            recipientEmail: data.email
          });
        } else {
          setError('ファイルが見つかりません');
        }
      }).catch(() => {
        setError('無効なアクセストークンです');
      });
    } else {
      setError('アクセストークンが必要です');
    }
  }, [token]);

  const handleWebAuthn = async () => {
    setAuthLoading(true);
    setError('');

    try {
      const challenge = WebAuthnAuth.generateChallenge();
      const result = await WebAuthnAuth.authenticateRecipient(
        fileData.recipientEmail,
        challenge
      );

      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setError('認証に失敗しました');
      }
    } catch (error) {
      setError('WebAuthn認証でエラーが発生しました');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailOTP = async () => {
    setAuthLoading(true);
    setError('');

    try {
      // OTP送信のシミュレーション
      alert(`${fileData.recipientEmail} にOTPコードを送信しました（デモ版では自動認証されます）`);
      
      // デモ用: 自動的に認証成功
      setTimeout(() => {
        setIsAuthenticated(true);
        setAuthLoading(false);
      }, 1000);
    } catch (error) {
      setError('OTP送信でエラーが発生しました');
      setAuthLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileData || !isAuthenticated) return;

    setIsDecrypting(true);
    try {
      // 暗号化データの復元
      const encryptedData = new Uint8Array(atob(fileData.encryptedData).split('').map(c => c.charCodeAt(0)));
      const salt = new Uint8Array(atob(fileData.salt).split('').map(c => c.charCodeAt(0)));
      const iv = new Uint8Array(atob(fileData.iv).split('').map(c => c.charCodeAt(0)));

      // デモ用固定パスワード（実際の実装では受信者用鍵から復号）
      const password = 'demo-password-for-decryption';
      
      const decryptedData = await FileEncryption.decryptFile(
        encryptedData,
        password,
        salt,
        iv,
        (progress) => console.log('Decryption progress:', progress)
      );

      // ファイルダウンロード
      const blob = new Blob([decryptedData], { type: fileData.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      setError('ファイルの復号に失敗しました');
    } finally {
      setIsDecrypting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            アクセスエラー
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ファイル情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <FileInfo
          fileName={fileData.originalName}
          size={fileData.size}
          expiresAt={fileData.expiresAt}
          senderMessage={fileData.message}
        />

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <AuthMethodSelector
              onWebAuthn={handleWebAuthn}
              onEmailOTP={handleEmailOTP}
              loading={authLoading}
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                認証完了！
              </h2>
              <p className="text-gray-600">
                ファイルをダウンロードできます
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDecrypting}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>{isDecrypting ? '復号中...' : 'ファイルをダウンロード'}</span>
            </button>

            <div className="mt-4 text-xs text-gray-500">
              <p>ファイルはブラウザ内で復号されます</p>
              <p>復号されたデータは一時的にのみ保持されます</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}