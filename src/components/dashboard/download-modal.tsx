import React, { useState, useEffect } from 'react';
import { Download, X, FolderOpen, CreditCard as Edit3, Check, Folder, Save } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileName: string, saveLocation?: string) => void;
  originalFileName: string;
  fileSize?: number;
  fileData?: Uint8Array;
}

export function DownloadModal({ 
  isOpen, 
  onClose, 
  onDownload, 
  originalFileName,
  fileSize = 0,
  fileData
}: DownloadModalProps) {
  const [fileName, setFileName] = useState('');
  const [saveLocation, setSaveLocation] = useState('');
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // デフォルトのファイル名を設定
      const defaultName = originalFileName.includes('【施錠済み】') 
        ? originalFileName 
        : `【施錠済み】${originalFileName}.kgsr`;
      setFileName(defaultName);
      setSaveLocation(''); // 初期状態は未選択
    }
  }, [isOpen, originalFileName]);

  const handleSave = async () => {
    setIsSaving(true);
    
    if (fileHandle) {
      // File System Access APIを使用してファイルを保存
      await handleFileSystemSave();
    } else {
      // 保存先が選択されていない場合はSave Asダイアログを表示
      await handleSaveAsDialog();
    }
    
    setIsSaving(false);
  };

  const handleFileSystemSave = async () => {
    if (!fileHandle) return;
    
    // Check if fileData exists
    if (!fileData) {
      console.error('No file data available for saving');
      onDownload(fileName, saveLocation);
      onClose();
      return;
    }
    
    try {
      const writable = await fileHandle.createWritable();
      
      const blob = new Blob([fileData], { type: 'application/octet-stream' });
      await writable.write(blob);
      await writable.close();
      
      // 成功時の処理
      onDownload(fileName, fileHandle.name || saveLocation);
      onClose();
    } catch (error) {
      console.error('File save error:', error);
      // エラー時はフォールバック
      handleFallbackDownload();
    }
  };

  const handleFallbackDownload = () => {
    // フォールバック: 通常のダウンロード
    onDownload(fileName, saveLocation || 'ダウンロード');
    onClose();
  };

  const handleSaveAsDialog = async () => {
    // ブラウザのFile System Access APIを使用（対応ブラウザのみ）
    if ('showSaveFilePicker' in window) {
      try {
        // @ts-ignore - File System Access API
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Encrypted files',
            accept: { 'application/octet-stream': ['.kgsr'] }
          }]
        });
        
        setFileHandle(handle);
        setSaveLocation(handle.name);
        
        // 即座にファイルを保存
        await handleFileSystemSave();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Save dialog error:', error);
          handleFallbackDownload();
        }
      }
    } else {
      handleFallbackDownload();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Download className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              ファイルをダウンロード
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* ファイル情報 */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">施錠済みファイル</p>
                {fileSize > 0 && (
                  <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
                )}
              </div>
            </div>
          </div>

          {/* ファイル名編集 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ファイル名
            </label>
            <div className="relative">
              {isEditingName ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="ファイル名を入力"
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                  <span className="text-sm text-gray-900 truncate flex-1 mr-2">
                    {fileName}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              .kgsr拡張子が自動的に追加されます
            </p>
          </div>

          {/* 保存先選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              保存先を選択してファイルを保存
            </label>
            <div className="space-y-4">
              <button
                onClick={handleSave}
                disabled={!fileName.trim() || isSaving}
                className="w-full flex items-center justify-center border-2 border-dashed border-blue-300 rounded-xl px-4 py-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Save className="h-8 w-8 text-blue-600 mr-2" />
                    <FolderOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    {isSaving ? '保存中...' : (saveLocation || 'Save As... で保存先を選択して保存')}
                  </p>
                  <p className="text-xs text-blue-700">
                    {isSaving ? 'ファイルを保存しています' : 'クリックして保存ダイアログを開く'}
                  </p>
                </div>
              </button>
              
              {saveLocation && !isSaving && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">
                      保存完了: {saveLocation}
                    </p>
                  </div>
                </p>
                </div>
              )}
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start space-x-2">
              <div className="p-1 bg-yellow-200 rounded-lg mt-0.5">
                <Download className="h-3 w-3 text-yellow-700" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">重要</h4>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• このファイルは指定された受取人のみが解錠できます</li>
                  <li>• ファイルを安全な場所に保管してください</li>
                  <li>• 受取人にファイルを送信する前に保存することをお勧めします</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            {isSaving ? '保存中...' : 'キャンセル'}
          </button>
          
          <div className="text-sm text-gray-500">
            {saveLocation ? '保存が完了しました' : 'ファイル名を編集して保存先を選択してください'}
          </div>
        </div>
      </div>
    </div>
  );
}