import React, { useState } from 'react';
import { Unlock, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { FileUploadZone } from '../ui/file-upload-zone';
import { FileEncryption } from '../../lib/crypto';
import { ProgressBar } from '../ui/progress-bar';

export function FileUnlockPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [unlockedFile, setUnlockedFile] = useState<{
    name: string;
    data: ArrayBuffer;
    type: string;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleUnlock = async () => {
    if (files.length === 0) {
      alert('解錠するファイルを選択してください');
      return;
    }
    
    const file = files[0];
    
    // 暗号化ファイルかチェック（.kgsr拡張子または暗号化データ）
    if (!file.name.endsWith('.kgsr') && !file.name.includes('施錠済み')) {
      setError('暗号化されたファイルを選択してください（.kgsrファイルまたは施錠済みファイル）');
      return;
    }
    
    setIsUnlocking(true);
    setError('');
    setUnlockProgress(0);
    
    try {
      // ファイル読み込み
      setUnlockProgress(20);
      const fileBuffer = await file.arrayBuffer();
      
      // デモ用: 実際の暗号化データの場合は適切な復号処理を行う
      setUnlockProgress(40);
      
      // パスワード入力を求める（実際の実装では受信者認証後に取得）
      const password = prompt('解錠用パスワードを入力してください:');
      if (!password) {
        setIsUnlocking(false);
        return;
      }
      
      setUnlockProgress(60);
      
      // 暗号化データの解析（簡素化版）
      try {
        // 実際の暗号化ファイルの場合の処理
        const encryptedData = new Uint8Array(fileBuffer);
        
        // デモ用の固定値（実際は暗号化ファイルから抽出）
        const salt = new Uint8Array(16);
        const iv = new Uint8Array(12);
        
        setUnlockProgress(80);
        
        // 復号処理
        const decryptedData = await FileEncryption.decryptFile(
          encryptedData,
          password,
          salt,
          iv,
          (progress) => {
            setUnlockProgress(80 + (progress * 0.2));
          }
        );
        
        // 元のファイル名を復元
        let originalName = file.name;
        if (originalName.includes('【施錠済み】')) {
          originalName = originalName.replace('【施錠済み】', '').replace('.kgsr', '');
        } else if (originalName.endsWith('.kgsr')) {
          originalName = originalName.replace('.kgsr', '');
        }
        
        setUnlockedFile({
          name: originalName,
          data: decryptedData,
          type: 'application/octet-stream' // 実際はMIMEタイプを復元
        });
        
        setUnlockProgress(100);
        
      } catch (decryptError) {
        console.error('Decryption error:', decryptError);
        setError('パスワードが正しくないか、ファイルが破損している可能性があります');
      }
      
    } catch (error) {
      console.error('Unlock error:', error);
      setError('ファイルの解錠に失敗しました');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDownloadUnlocked = () => {
    if (!unlockedFile) return;
    
    const blob = new Blob([unlockedFile.data], { type: unlockedFile.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = unlockedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setUnlockedFile(null);
    setError('');
    setUnlockProgress(0);
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

      {!unlockedFile ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          {/* ファイルアップロード */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              暗号化ファイルを選択
            </h3>
            <FileUploadZone
              onFileSelect={setFiles}
              maxFiles={1}
              maxSizeBytes={100 * 1024 * 1024}
              accept=".kgsr,.encrypted,.lock"
              disabled={isUnlocking}
            />
            <p className="mt-2 text-sm text-gray-500">
              .kgsrファイルまたは施錠済みファイルを選択してください
            </p>
          </div>

          {/* 解錠進行状況 */}
          {isUnlocking && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">解錠中...</h4>
              <ProgressBar
                progress={unlockProgress}
                label="ファイル解錠"
                color="green"
                size="lg"
              />
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* 解錠ボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleUnlock}
              disabled={files.length === 0 || isUnlocking}
              className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
            >
              <Unlock className="h-5 w-5" />
              <span>{isUnlocking ? '解錠中...' : '解錠する'}</span>
            </button>
          </div>

          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              暗号化されたファイル（.kgsrファイル）を選択してください。相手から解錠用リンクを受け取っている場合は、そちらを優先して使用してください。
            </p>
          </div>
        </div>
      ) : (
        /* 解錠完了画面 */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            {/* 成功アイコン */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                解錠完了！
              </h2>
              <p className="text-gray-600">
                ファイルが正常に解錠されました
              </p>
            </div>

            {/* 解錠済みファイル表示 */}
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-3">
                <Download className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {unlockedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">解錠済み</p>
                </div>
              </div>
            </div>

            {/* ダウンロードボタン */}
            <button
              onClick={handleDownloadUnlocked}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>解錠済みファイルをダウンロード</span>
            </button>
            {/* 新しいファイルを解錠 */}
            <button
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              別のファイルを解錠する
            </button>

            <div className="text-xs text-gray-500 mt-4">
              <p>解錠されたファイルは元の形式で復元されました。</p>
              <p>セキュリティのため、不要になったら削除することをお勧めします。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}