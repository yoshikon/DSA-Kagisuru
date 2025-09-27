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
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileIcon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          まだファイルがありません
        </h3>
        <p className="text-slate-400 text-lg mb-8">
          最初のファイルを暗号化して共有しましょう
        </p>
        <button
          onClick={() => window.location.href = '/encrypt'}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:transform hover:scale-105 font-medium"
        >
          ファイルを暗号化
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">送信済みファイル ({files.length}件)</h2>
        
        {someSelected && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-400">
              {selectedFiles.length}件選択中
            </span>
            <button
              onClick={() => onBulkDelete(selectedFiles)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:transform hover:scale-105 space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>選択したファイルを削除</span>
            </button>
          </div>
        )}
      </div>

      {files.length > 1 && (
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-600">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded border-slate-500 bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">すべて選択</span>
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
              className={`bg-gradient-to-r from-slate-800 to-slate-700 border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] ${
                selectedFiles.includes(file.id) 
                  ? 'border-blue-500 bg-gradient-to-r from-blue-900/50 to-blue-800/50 shadow-lg shadow-blue-500/25' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => onFileSelect(file.id, e.target.checked)}
                      className="rounded border-slate-500 bg-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <FileIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate text-lg">
                      {file.originalName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
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
                        isExpired ? 'text-red-400' : 
                        isExpiring ? 'text-orange-400' : 'text-slate-400'
                      }`}>
                        {isExpired ? '期限切れ' : 
                         daysLeft === 1 ? '残り1日' : `残り${daysLeft}日`}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDate(file.createdAt)}作成
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(file.id)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-600 rounded-xl transition-all duration-200 hover:transform hover:scale-110"
                      title="詳細を表示"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded-xl transition-all duration-200 hover:transform hover:scale-110"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 受信者一覧 */}
              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="flex flex-wrap gap-2 ml-12">
                  {file.recipients.map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-300 border border-blue-500/30"
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