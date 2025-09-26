import React from 'react';
import { Clock, MessageCircle } from 'lucide-react';

interface EncryptionOptionsProps {
  expiryDays: number;
  message: string;
  onExpiryChange: (days: number) => void;
  onMessageChange: (message: string) => void;
  disabled?: boolean;
}

export function EncryptionOptions({
  expiryDays,
  message,
  onExpiryChange,
  onMessageChange,
  disabled = false
}: EncryptionOptionsProps) {
  const expiryOptions = [
    { value: 1, label: '1日' },
    { value: 3, label: '3日' },
    { value: 7, label: '7日' },
    { value: 14, label: '14日' },
    { value: 30, label: '30日' }
  ];

  return (
    <div className="space-y-6">
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
                px-3 py-2 text-sm font-medium rounded-lg border transition-colors
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
  );
}