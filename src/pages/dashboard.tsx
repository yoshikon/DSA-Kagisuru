import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/header';
import { FileList } from '../components/dashboard/file-list';
import { ServiceOverview } from '../components/dashboard/service-overview';
import { FileLockPage } from '../components/dashboard/file-lock-page';
import { FileUnlockPage } from '../components/dashboard/file-unlock-page';
import { AddressBookPage } from '../components/dashboard/address-book-page';
import { DatabaseService } from '../lib/database';
import { FileStorage } from '../lib/storage';
import { BarChart3, Shield, Users, HardDrive, Lock, Unlock, BookOpen, Grid3x3 as Grid3X3 } from 'lucide-react';

export function DashboardPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'files' | 'lock' | 'unlock' | 'addressbook'>('overview');
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
      
      // FileListコンポーネントが期待する形式にデータを変換
      const fileData = allFiles.map(file => ({
        id: file.id,
        originalName: file.original_name || file.originalName,
        size: file.file_size || file.size,
        recipients: file.file_recipients 
          ? file.file_recipients.map(r => r.email)
          : (file.recipients || []),
        createdAt: file.created_at || file.createdAt,
        downloadCount: file.download_count || file.downloadCount || 0,
        message: file.message,
        expiresAt: file.expires_at || file.expiresAt
      }));
      
      setFiles(fileData);
      
      // 統計計算
      const totalFiles = fileData.length;
      const totalRecipients = fileData.reduce((sum, file) => 
        sum + (file.recipients?.length || 0), 0
      );
      const totalDownloads = fileData.reduce((sum, file) => 
        sum + (file.downloadCount || 0), 0
      );
      const storageUsed = fileData.reduce((sum, file) => 
        sum + (file.size || 0), 0
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
      try {
        // データベースから削除を試行
        const dbSuccess = await DatabaseService.deleteFile(fileId);
        
        // ローカルストレージからも削除
        const localSuccess = FileStorage.deleteFile(fileId);
        
        if (dbSuccess || localSuccess) {
          // 選択状態からも削除
          setSelectedFiles(prev => prev.filter(id => id !== fileId));
          loadFiles(); // リロード
        } else {
          alert('削除に失敗しました');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('削除中にエラーが発生しました');
      }
    }
  };

  const handleBulkDelete = async (fileIds: string[]) => {
    if (confirm(`選択した${fileIds.length}件のファイルを削除しますか？受信者はアクセスできなくなります。`)) {
      try {
        let successCount = 0;
        
        for (const fileId of fileIds) {
          // データベースから削除を試行
          const dbSuccess = await DatabaseService.deleteFile(fileId);
          
          // ローカルストレージからも削除
          const localSuccess = FileStorage.deleteFile(fileId);
          
          if (dbSuccess || localSuccess) {
            successCount++;
          }
        }
        
        if (successCount > 0) {
          setSelectedFiles([]); // 選択状態をクリア
          loadFiles(); // リロード
          
          if (successCount === fileIds.length) {
            alert(`${successCount}件のファイルを削除しました`);
          } else {
            alert(`${successCount}/${fileIds.length}件のファイルを削除しました`);
          }
        } else {
          alert('削除に失敗しました');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('削除中にエラーが発生しました');
      }
    }
  };

  const handleFileSelect = (fileId: string, selected: boolean) => {
    setSelectedFiles(prev => {
      if (selected) {
        return [...prev, fileId];
      } else {
        return prev.filter(id => id !== fileId);
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedFiles(files.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleViewDetails = (fileId: string) => {
    // 詳細表示の実装（簡素化）
    DatabaseService.getFileById(fileId).then(file => {
      if (file) {
        const recipients = file.file_recipients?.map(r => r.email).join(', ') || '';
        alert(`ファイル詳細:\n名前: ${file.original_name}\nサイズ: ${formatFileSize(file.file_size)}\n受信者: ${recipients}\n作成日: ${new Date(file.created_at).toLocaleString('ja-JP')}`);
      } else {
        // ローカルストレージから取得を試行
        const localFile = files.find(f => f.id === fileId);
        if (localFile) {
          const recipients = localFile.recipients?.join(', ') || '';
          alert(`ファイル詳細:\n名前: ${localFile.originalName}\nサイズ: ${formatFileSize(localFile.size)}\n受信者: ${recipients}\n作成日: ${new Date(localFile.createdAt).toLocaleString('ja-JP')}`);
        } else {
          alert('ファイル詳細を取得できませんでした');
        }
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
        {/* サイドバーナビゲーション */}
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">メニュー</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView('overview')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'overview' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                  <span>サービス一覧</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('files')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'files' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>ファイル履歴</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('lock')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'lock' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Lock className="h-5 w-5" />
                  <span>ファイル施錠</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('unlock')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'unlock' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Unlock className="h-5 w-5" />
                  <span>ファイル解錠</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('addressbook')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'addressbook' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>アドレス帳</span>
                </button>
              </div>
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1">
            {currentView === 'overview' && <ServiceOverview />}
            {currentView === 'files' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">ファイル履歴</h1>
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
                    selectedFiles={selectedFiles}
                    onFileSelect={handleFileSelect}
                    onSelectAll={handleSelectAll}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              </div>
            )}
            {currentView === 'lock' && <FileLockPage />}
            {currentView === 'unlock' && <FileUnlockPage />}
            {currentView === 'addressbook' && <AddressBookPage />}
          </div>
        </div>
      </main>
    </div>
  );
}