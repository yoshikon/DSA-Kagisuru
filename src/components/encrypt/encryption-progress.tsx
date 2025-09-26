import React from 'react';
import { Lock, Upload, Check, AlertCircle } from 'lucide-react';
import { ProgressBar } from '../ui/progress-bar';
import type { EncryptionProgress } from '../../types';

interface EncryptionProgressProps {
  progress: EncryptionProgress;
}

export function EncryptionProgressModal({ progress }: EncryptionProgressProps) {
  const getIcon = () => {
    switch (progress.step) {
      case 'preparing':
        return <Upload className="h-8 w-8 text-blue-600 animate-pulse" />;
      case 'encrypting':
        return <Lock className="h-8 w-8 text-orange-600 animate-pulse" />;
      case 'uploading':
        return <Upload className="h-8 w-8 text-blue-600 animate-pulse" />;
      case 'complete':
        return <Check className="h-8 w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Lock className="h-8 w-8 text-gray-600" />;
    }
  };

  const getColor = (): 'blue' | 'green' | 'red' | 'orange' => {
    switch (progress.step) {
      case 'encrypting':
        return 'orange';
      case 'complete':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            {getIcon()}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {progress.step === 'complete' ? '暗号化完了！' : 'ファイルを暗号化中...'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            {progress.message}
          </p>

          {progress.step !== 'complete' && progress.step !== 'error' && (
            <ProgressBar
              progress={progress.progress}
              color={getColor()}
              size="lg"
            />
          )}

          {progress.step === 'complete' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                受信者にメールを送信しました。ファイルは指定した有効期限まで利用可能です。
              </p>
            </div>
          )}

          {progress.step === 'error' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                暗号化に失敗しました。もう一度お試しください。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}