import React from 'react';
import { File as FileIcon, Download, Trash2, Eye, Clock } from 'lucide-react';

interface FileData {
  id: string;
  originalName: string;
  size: number;
  recipients: string[];
  downloadCount: number;
  createdAt: string;
  expiresAt: string;
}

interface FileListProps {
  files: FileData[];
  onDelete: (fileId: string) => void;
  onViewDetails: (fileId: string) => void;
}

export function FileList({ files, onDelete, onViewDetails }: FileListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiresAt: string): number => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          まだファイルがありません
        </h3>
        <p className="text-gray-500 mb-6">
          最初のファイルを暗号化して共有しましょう
        </p>
        <button
          onClick={() => window.location.href = '/encrypt'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ファイルを暗号化
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">送信済みファイル</h2>
      
      <div className="space-y-3">
        {files.map((file) => {
          const daysLeft = getDaysUntilExpiry(file.expiresAt);
          const isExpiring = daysLeft <= 3 && daysLeft > 0;
          const isExpired = daysLeft <= 0;

          return (
            <div
              key={file.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>受信者: {file.recipients.length}名</span>
                      <span className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        {file.downloadCount}回
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className={`font-medium ${
                        isExpired ? 'text-red-600' : 
                        isExpiring ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {isExpired ? '期限切れ' : 
                         daysLeft === 1 ? '残り1日' : `残り${daysLeft}日`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(file.createdAt)}作成
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(file.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="詳細を表示"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 受信者一覧 */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {file.recipients.map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}