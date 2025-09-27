import React, { useState } from 'react';
import { Unlock, Upload } from 'lucide-react';
import { FileUploadZone } from '../ui/file-upload-zone';

export function FileUnlockPage() {
  const [files, setFiles] = useState<File[]>([]);

  const handleUnlock = () => {
    if (files.length === 0) {
      alert('解錠するファイルを選択してください');
      return;
    }
    
    // ファイル解錠処理
    alert('ファイルの解錠処理を開始します');
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Unlock className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ファイル解錠</h1>
        </div>
        <p className="text-lg text-gray-600">
          施錠済みファイルを解錠できます。あなたが受取人に指定された施錠済みファイルを持っている場合のみ、ファイルを解錠できます。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
        {/* ファイルアップロード */}
        <div>
          <FileUploadZone
            onFileSelect={setFiles}
            maxFiles={1}
            maxSizeBytes={100 * 1024 * 1024}
            accept=".encrypted,.lock"
          />
        </div>

        {/* 解錠ボタン */}
        <div className="flex justify-center">
          <button
            onClick={handleUnlock}
            disabled={files.length === 0}
            className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
          >
            <Unlock className="h-5 w-5" />
            <span>解錠する</span>
          </button>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ファイルを選択すると自動的に解錠処理が開始されます。相手から解錠用リンクを受け取っている場合は、そちらを優先して使用してください。
          </p>
        </div>
      </div>
    </div>
  );
}