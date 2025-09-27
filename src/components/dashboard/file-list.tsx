import React from 'react';
import { File as FileIcon, Download, Trash2, Eye, Clock, Check } from 'lucide-react';

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
  selectedFiles: string[];
  onFileSelect: (fileId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDelete: (fileId: string) => void;
  onBulkDelete: (fileIds: string[]) => void;
  onViewDetails: (fileId: string) => void;
}

export function FileList({ 
  files, 
  selectedFiles, 
  onFileSelect, 
  onSelectAll, 
  onDelete, 
  onBulkDelete, 
  onViewDetails 
}: FileListProps) {
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

  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const someSelected = selectedFiles.length > 0;

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">送信済みファイル ({files.length}件)</h2>
        
        {someSelected && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedFiles.length}件選択中
            </span>
            <button
              onClick={() => onBulkDelete(selectedFiles)}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>選択したファイルを削除</span>
            </button>
          </div>
        )}
      </div>

      {files.length > 1 && (
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">すべて選択</span>
          </label>
        </div>
      )}
      
      <div className="space-y-3">
        {files.map((file) => {
          const daysLeft = getDaysUntilExpiry(file.expiresAt);
          const isExpiring = daysLeft <= 3 && daysLeft > 0;
          const isExpired = daysLeft <= 0;

          return (
            <div
              key={file.id}
              className={`bg-gradient-to-r from-white to-gray-50 border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] ${
                selectedFiles.includes(file.id) 
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg shadow-blue-500/25' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => onFileSelect(file.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <FileIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
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
                    <div className="flex items-center text-sm font-medium">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className={`font-medium ${
                        isExpired ? 'text-red-600' : 
                        isExpiring ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {isExpired ? '期限切れ' : 
                         daysLeft === 1 ? '残り1日' : `残り${daysLeft}日`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatDate(file.createdAt)}作成
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(file.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:transform hover:scale-110"
                      title="詳細を表示"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:transform hover:scale-110"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 受信者一覧 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 ml-12">
                  {file.recipients.map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
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