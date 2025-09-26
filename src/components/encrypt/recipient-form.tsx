import React, { useState, useCallback } from 'react';
import { Plus, X, Mail, Shield } from 'lucide-react';

interface RecipientFormProps {
  recipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
  maxRecipients?: number;
  disabled?: boolean;
  requireVerification?: boolean;
  onVerificationChange?: (required: boolean) => void;
}

export function RecipientForm({ 
  recipients, 
  onRecipientsChange, 
  maxRecipients = 5,
  disabled = false,
  requireVerification = true,
  onVerificationChange
}: RecipientFormProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addRecipient = useCallback(() => {
    const email = inputValue.trim().toLowerCase();
    
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    if (recipients.includes(email)) {
      setError('既に追加されています');
      return;
    }

    if (recipients.length >= maxRecipients) {
      setError(`最大${maxRecipients}名まで追加できます`);
      return;
    }

    onRecipientsChange([...recipients, email]);
    setInputValue('');
    setError('');
  }, [inputValue, recipients, onRecipientsChange, maxRecipients]);

  const removeRecipient = useCallback((index: number) => {
    const newRecipients = recipients.filter((_, i) => i !== index);
    onRecipientsChange(newRecipients);
  }, [recipients, onRecipientsChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  return (
    <div className="space-y-4">
      {/* 受信者認証設定 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requireVerification}
                onChange={(e) => onVerificationChange?.(e.target.checked)}
                disabled={disabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-blue-900">
                受信者認証を有効にする（推奨）
              </span>
            </label>
            <p className="text-sm text-blue-700 mt-1">
              指定した受信者のメールアドレスでのみファイルにアクセス可能になります。
              <strong>送り間違えても、指定外の人は解錠できません。</strong>
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          受信者のメールアドレス
        </label>
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="example@email.com"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            onClick={addRecipient}
            disabled={disabled || recipients.length >= maxRecipients}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>追加</span>
          </button>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
            {requireVerification && (
              <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 mb-2">
                🔒 これらのメールアドレスでのみアクセス可能です
              </div>
            )}
        <p className="mt-1 text-xs text-gray-500">
          {recipients.length}/{maxRecipients} 人が追加されています
                <div key={index} className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                  requireVerification ? 'bg-green-50 border border-green-200' : 'bg-blue-50'
                }`}>
      </div>
                    <Mail className={`h-4 w-4 ${requireVerification ? 'text-green-600' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${requireVerification ? 'text-green-900' : 'text-blue-900'}`}>
                      {email}
                    </span>
                    {requireVerification && (
                      <Shield className="h-3 w-3 text-green-600" />
                    )}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">受信者一覧:</h4>
          <div className="space-y-1">
                    className={`p-1 rounded-full transition-colors ${
                      requireVerification 
                        ? 'hover:bg-green-100' 
                        : 'hover:bg-blue-100'
                    }`}
              <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                    <X className={`h-3 w-3 ${requireVerification ? 'text-green-700' : 'text-blue-700'}`} />
                  <span className="text-sm font-medium text-blue-900">{email}</span>
                </div>
                <button
                  onClick={() => removeRecipient(index)}
                  className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                  disabled={disabled}
                >
                  <X className="h-3 w-3 text-blue-700" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}