import React, { useState, useEffect } from 'react';
import { Fingerprint, Mail, Shield } from 'lucide-react';
import { WebAuthnAuth } from '../../lib/crypto';

interface AuthMethodSelectorProps {
  onWebAuthn: () => Promise<void>;
  onEmailOTP: () => Promise<void>;
  loading?: boolean;
}

export function AuthMethodSelector({ onWebAuthn, onEmailOTP, loading = false }: AuthMethodSelectorProps) {
  const [webauthnSupported, setWebauthnSupported] = useState(false);

  useEffect(() => {
    setWebauthnSupported(WebAuthnAuth.isSupported());
  }, []);

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

      <div className="space-y-3">
        {webauthnSupported && (
          <button
            onClick={onWebAuthn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Fingerprint className="h-5 w-5" />
            <span className="font-medium">パスキー・生体認証でアクセス</span>
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">推奨</span>
          </button>
        )}

        <button
          onClick={onEmailOTP}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Mail className="h-5 w-5" />
          <span className="font-medium">メール認証コードでアクセス</span>
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
        <p>この認証はファイル送信者が設定したセキュリティ要件です</p>
        <p>認証情報は暗号化の解除にのみ使用され、保存されません</p>
      </div>
    </div>
  );
}