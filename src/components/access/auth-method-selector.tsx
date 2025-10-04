import React, { useState, useEffect } from 'react';
import { Fingerprint, Mail, Shield, AlertTriangle, Smartphone } from 'lucide-react';
import { WebAuthnAuth } from '../../lib/crypto';

interface AuthMethodSelectorProps {
  recipientEmail: string;
  requiredEmail?: string;
  requireVerification?: boolean;
  onWebAuthn: () => Promise<void>;
  onEmailOTP: () => Promise<void>;
  onSMSOTP?: () => Promise<void>;
  loading?: boolean;
  smsAvailable?: boolean;
}

export function AuthMethodSelector({
  recipientEmail,
  requiredEmail,
  requireVerification = false,
  onWebAuthn,
  onEmailOTP,
  onSMSOTP,
  loading = false,
  smsAvailable = false
}: AuthMethodSelectorProps) {
  const [webauthnSupported, setWebauthnSupported] = useState(false);

  useEffect(() => {
    setWebauthnSupported(WebAuthnAuth.isSupported());
  }, []);

  // 受信者認証チェック
  const isAuthorizedRecipient = !requireVerification || 
    (requiredEmail && recipientEmail.toLowerCase() === requiredEmail.toLowerCase());
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ファイルにアクセスするための認証
        </h2>
        <p className="text-sm text-gray-600">
          セキュリティのため、認証が必要です
        </p>
      </div>

      {/* 受信者認証エラー */}
      {requireVerification && !isAuthorizedRecipient && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 mb-2">
                アクセス権限がありません
              </h3>
              <p className="text-sm text-red-800 mb-2">
                このファイルは特定の受信者のみがアクセス可能に設定されています。
              </p>
              <p className="text-xs text-red-700">
                現在のメール: <code className="bg-red-100 px-1 rounded">{recipientEmail}</code><br/>
                許可されたメール: <code className="bg-red-100 px-1 rounded">{requiredEmail}</code>
              </p>
              <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                <p className="text-xs text-red-800 font-medium">
                  🔒 送り間違え防止機能により、指定された受信者以外はファイルにアクセスできません。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 認証成功時の表示 */}
      {requireVerification && isAuthorizedRecipient && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              受信者認証: 承認済み
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {webauthnSupported && (
          <button
            onClick={onWebAuthn}
            disabled={loading || !isAuthorizedRecipient}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Fingerprint className="h-5 w-5" />
            <span className="font-medium">パスキー・生体認証でアクセス</span>
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">推奨</span>
          </button>
        )}

        <button
          onClick={onEmailOTP}
          disabled={loading || !isAuthorizedRecipient}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Mail className="h-5 w-5" />
          <span className="font-medium">メール認証コードでアクセス</span>
        </button>

        {smsAvailable && onSMSOTP && (
          <button
            onClick={onSMSOTP}
            disabled={loading || !isAuthorizedRecipient}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Smartphone className="h-5 w-5" />
            <span className="font-medium">SMS認証コードでアクセス</span>
          </button>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
        <p>この認証はファイル送信者が設定したセキュリティ要件です</p>
        <p>認証情報は暗号化の解除にのみ使用され、保存されません</p>
        {requireVerification && (
          <p className="text-green-600 font-medium">
            🔒 受信者認証により、指定された方のみアクセス可能です
          </p>
        )}
      </div>
    </div>
  );
}