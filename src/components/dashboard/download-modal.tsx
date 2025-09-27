import React, { useState, useEffect } from 'react';
import { Download, X, FolderOpen, Edit3, Check, Folder, Save } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileName: string, saveLocation?: string) => void;
  originalFileName: string;
  fileSize?: number;
}

export function DownloadModal({ 
  isOpen, 
  onClose, 
  onDownload, 
  originalFileName,
  fileSize = 0
}: DownloadModalProps) {
  const [fileName, setFileName] = useState('');
  const [saveLocation, setSaveLocation] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  const handleDownload = () => {
    onDownload(fileName, saveLocation);
    onClose();
  };

  const handleSaveAsDialog = () => {
    // ブラウザのFile System Access APIを使用（対応ブラウザのみ）
    if ('showSaveFilePicker' in window) {
      try {
        // @ts-ignore - File System Access API
        window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Encrypted files',
            accept: { 'application/octet-stream': ['.kgsr'] }
          }]
        }).then((fileHandle: any) => {
          setSaveLocation(fileHandle.name);
          setShowSaveDialog(false);
        }).catch((err: any) => {
          if (err.name !== 'AbortError') {
            console.error('Save dialog error:', err);
          }
        });
      } catch (error) {
        console.error('File System Access API error:', error);
        fallbackSaveDialog();
      }
    } else {
      fallbackSaveDialog();
    }
  };

  const fallbackSaveDialog = () => {
    // フォールバック: カスタム保存ダイアログを表示
    setShowSaveDialog(true);
  };

  const handleCustomSaveLocation = (location: string) => {
    setSaveLocation(location);
    setShowSaveDialog(false);
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
              保存先
            </label>
            <button
              onClick={handleSaveAsDialog}
              className="w-full flex items-center justify-center border-2 border-dashed border-blue-300 rounded-xl px-4 py-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100"
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Save className="h-8 w-8 text-blue-600 mr-2" />
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {saveLocation || 'Save As... で保存先を選択'}
                </p>
                <p className="text-xs text-blue-700">
                  クリックして保存ダイアログを開く
                </p>
              </div>
            </button>
            {saveLocation && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  保存先: {saveLocation}
                </p>
              </div>
            )}
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
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleDownload}
            disabled={!fileName.trim()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:transform hover:scale-105 space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>ダウンロード</span>
          </button>
        </div>
      </div>

      {/* カスタム保存ダイアログ（フォールバック用） */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Save className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Save As</h3>
              </div>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ファイル名
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保存場所を選択
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'デスクトップ',
                    'ダウンロード',
                    'ドキュメント',
                    'スクリーンショット'
                  ].map((location) => (
                    <button
                      key={location}
                      onClick={() => handleCustomSaveLocation(location)}
                      className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Folder className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{location}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCustomSaveLocation(saveLocation || 'ダウンロード')}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}