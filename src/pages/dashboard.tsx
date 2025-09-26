import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/header';
import { FileList } from '../components/dashboard/file-list';
import { DatabaseService } from '../lib/database';
import { FileStorage } from '../lib/storage';
import { BarChart3, Shield, Users, HardDrive } from 'lucide-react';

export function DashboardPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalRecipients: 0,
    totalDownloads: 0,
    storageUsed: 0
  });

  useEffect(() => {
    loadFiles();
    
    // 5秒ごとにファイル一覧を更新（リアルタイム更新）
    const interval = setInterval(loadFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadFiles = () => {
    // ローカルストレージとデータベースの両方から取得
    Promise.all([
      DatabaseService.getUserFiles().catch(() => []),
      Promise.resolve(FileStorage.getFileList())
    ]).then(([dbFiles, localFiles]) => {
      // データベースファイルを優先し、ローカルファイルで補完
      const allFiles = [...dbFiles];
      
      // ローカルファイルでデータベースにないものを追加
      localFiles.forEach(localFile => {
        if (!allFiles.find(dbFile => dbFile.id === localFile.id)) {
          allFiles.push(localFile);
        }
      });
      
      const fileData = allFiles;
      setFiles(fileData);
      
      // 統計計算
      const totalFiles = fileData.length;
      const totalRecipients = fileData.reduce((sum, file) => 
        sum + (file.file_recipients?.length || 0), 0
      );
      const totalDownloads = fileData.reduce((sum, file) => 
        sum + (file.download_count || 0), 0
      );
      const storageUsed = fileData.reduce((sum, file) => 
        sum + (file.file_size || 0), 0
      );
      
      setStats({
        totalFiles,
        totalRecipients,
        totalDownloads,
        storageUsed
      });
    }).catch(error => {
      console.error('Failed to load files:', error);
      // フォールバック: 空のデータを設定
      setFiles([]);
      setStats({
        totalFiles: 0,
        totalRecipients: 0,
        totalDownloads: 0,
        storageUsed: 0
      });
    });
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('このファイルを削除しますか？受信者はアクセスできなくなります。')) {
      const success = await DatabaseService.deleteFile(fileId);
      if (success) {
        loadFiles(); // リロード
      } else {
        alert('削除に失敗しました');
      }
    }
  };

  const handleViewDetails = (fileId: string) => {
    // 詳細表示の実装（簡素化）
    DatabaseService.getFileById(fileId).then(file => {
      if (file) {
        const recipients = file.file_recipients?.map(r => r.email).join(', ') || '';
        alert(`ファイル詳細:\n名前: ${file.original_name}\nサイズ: ${formatFileSize(file.file_size)}\n受信者: ${recipients}\n作成日: ${new Date(file.created_at).toLocaleString('ja-JP')}`);
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPath="/dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          </div>
          <p className="text-lg text-gray-600">
            送信したファイルの管理と統計情報
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">送信ファイル</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総受信者数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecipients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ダウンロード</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">使用容量</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.storageUsed)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ファイル一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <FileList
            files={files}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        </div>

        {/* 追加アクション */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/encrypt'}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Shield className="h-5 w-5 mr-2" />
            新しいファイルを暗号化
          </button>
        </div>
      </main>
    </div>
  );
}