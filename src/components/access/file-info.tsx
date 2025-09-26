import React from 'react';
import { File as FileIcon, Clock, User, HardDrive } from 'lucide-react';

interface FileInfoProps {
  fileName: string;
  size: number;
  expiresAt: string;
  senderMessage?: string;
}

export function FileInfo({ fileName, size, expiresAt, senderMessage }: FileInfoProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatExpiryDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return '期限切れ';
    } else if (diffDays === 1) {
      return '残り1日';
    } else {
      return `残り${diffDays}日`;
    }
  };

  const isExpired = new Date(expiresAt) <= new Date();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <FileIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          暗号化ファイルが共有されました
        </h1>
        <p className="text-sm text-gray-600">
          以下のファイルにアクセスするには認証が必要です
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <FileIcon className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{fileName}</p>
            <p className="text-sm text-gray-500">{formatFileSize(size)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Clock className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">有効期限</p>
            <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
              {formatExpiryDate(expiresAt)}
            </p>
          </div>
        </div>

        {senderMessage && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <User className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  送信者からのメッセージ:
                </p>
                <p className="text-sm text-blue-800">
                  {senderMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isExpired && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ このファイルは有効期限が切れています
          </p>
        </div>
      )}
    </div>
  );
}