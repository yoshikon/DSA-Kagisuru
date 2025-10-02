import React from 'react';
import { Clock, MessageCircle, Download, Shield, Settings } from 'lucide-react';

interface EncryptionOptionsProps {
  expiryDays: number;
  maxDownloads: number | null;
  message: string;
  requireVerification: boolean;
  onExpiryChange: (days: number) => void;
  onMaxDownloadsChange: (maxDownloads: number | null) => void;
  onMessageChange: (message: string) => void;
  onVerificationChange: (required: boolean) => void;
  disabled?: boolean;
  onAdvancedPermissions?: () => void;
}

export function EncryptionOptions({
  expiryDays,
  maxDownloads,
  message,
  requireVerification,
  onExpiryChange,
  onMaxDownloadsChange,
  onMessageChange,
  onVerificationChange,
  disabled = false,
  onAdvancedPermissions
}: EncryptionOptionsProps) {
  const expiryOptions = [
    { value: 1, label: '1日' },
    { value: 3, label: '3日' },
    { value: 7, label: '7日' },
    { value: 14, label: '14日' },
    { value: 30, label: '30日' }
  ];

  const downloadOptions = [
    { value: 1, label: '1回' },
    { value: 3, label: '3回' },
    { value: 5, label: '5回' },
    { value: 10, label: '10回' },
    { value: null, label: '無制限' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-8">
      {/* 基本設定ヘッダー */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">基本設定</h3>
      </div>

      <div className="space-y-6">
        {/* 有効期限 */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <Clock className="h-4 w-4" />
            <span>有効期限</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {expiryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onExpiryChange(option.value)}
                disabled={disabled}
                className={`
                  px-3 py-3 text-sm font-medium rounded-lg border transition-colors
                  ${expiryDays === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            選択した期限後にファイルは自動的に削除されます
          </p>
        </div>

        {/* ダウンロード制限 */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <Download className="h-4 w-4" />
            <span>ダウンロード制限</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {downloadOptions.map((option) => (
              <button
                key={option.value || 'unlimited'}
                type="button"
                onClick={() => onMaxDownloadsChange(option.value)}
                disabled={disabled}
                className={`
                  px-3 py-3 text-sm font-medium rounded-lg border transition-colors
                  ${maxDownloads === option.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            指定回数ダウンロードされると自動的にアクセスが無効になります
          </p>
        </div>

        {/* 受信者認証 */}
        <div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requireVerification}
              onChange={(e) => onVerificationChange(e.target.checked)}
              disabled={disabled}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                受信者認証を有効にする
              </span>
              <p className="text-sm text-gray-600 mt-1">
                指定した受信者のメールアドレスでのみファイルにアクセス可能になります
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 詳細なアクセス権限設定ボタン */}
      {onAdvancedPermissions && (
        <div className="pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onAdvancedPermissions}
            disabled={disabled}
            className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-purple-800 focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-purple-500/25 hover:transform hover:scale-105 space-x-3 text-lg"
          >
            <Settings className="h-6 w-6" />
            <span>詳細なアクセス権限を設定</span>
          </button>
          <p className="mt-2 text-sm text-gray-500 text-center">
            各受信者に対して個別の権限を設定できます
          </p>
        </div>
      )}

      {/* メッセージ */}
      <div className="pt-6 border-t border-gray-200">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <MessageCircle className="h-4 w-4" />
            <span>メッセージ（任意）</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="受信者へのメッセージを入力してください"
            rows={3}
            maxLength={500}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {message.length}/500文字
          </p>
        </div>
      </div>
    </div>
  );
}