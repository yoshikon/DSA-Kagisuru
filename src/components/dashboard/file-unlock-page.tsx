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
      const fileText = await file.text();
      
      // デモ用: 実際の暗号化データの場合は適切な復号処理を行う
      setUnlockProgress(40);
      
      // 設定されたパスワードを使用
      let password = localStorage.getItem('kagisuru_decryption_password');
      if (!password) {
        // パスワードが設定されていない場合は入力を求める
        password = prompt('解錠用パスワードを入力してください:');
        if (!password) {
          setIsUnlocking(false);
          return;
        }
      }
      
      setUnlockProgress(60);
      
      // 暗号化データの解析
      try {
        // JSONデータをパース
        const fileData = JSON.parse(fileText);
        
        // 配列データをUint8Arrayに変換
        const encryptedData = new Uint8Array(fileData.encryptedData);
        const salt = new Uint8Array(fileData.salt);
        const iv = new Uint8Array(fileData.iv);
        
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
        
        setUnlockedFile({
          name: fileData.originalName,
          data: decryptedData,
          type: fileData.mimeType
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
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl">
            <Unlock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            ファイル解錠
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          施錠済みファイルを解錠できます。あなたが受取人に指定された施錠済みファイルを持っている場合のみ、ファイルを解錠できます。
        </p>
      </div>

      {!unlockedFile ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-10 space-y-10 backdrop-blur-sm">
          {/* ファイルアップロード */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              暗号化ファイルを選択
            </h3>
            <FileUploadZone
              onFileSelect={setFiles}
              maxFiles={1}
              maxSizeBytes={100 * 1024 * 1024}
              accept=".kgsr,.encrypted,.lock"
              disabled={isUnlocking}
            />
            <p className="mt-4 text-lg text-gray-500">
              .kgsrファイルまたは施錠済みファイルを選択してください
            </p>
          </div>

          {/* 解錠進行状況 */}
          {isUnlocking && (
            <div className="space-y-6">
              <h4 className="font-bold text-gray-900 text-xl">解錠中...</h4>
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
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                <p className="text-lg text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* 解錠ボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleUnlock}
              disabled={files.length === 0 || isUnlocking}
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-green-500/25 hover:transform hover:scale-105 space-x-3 text-lg"
            >
              <Unlock className="h-6 w-6" />
              <span>{isUnlocking ? '解錠中...' : '解錠する'}</span>
            </button>
          </div>

          {/* 説明 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-xl">
            <p className="text-lg text-blue-800">
              暗号化されたファイル（.kgsrファイル）を選択してください。相手から解錠用リンクを受け取っている場合は、そちらを優先して使用してください。
            </p>
          </div>
        </div>
      ) : (
        /* 解錠完了画面 */
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-sm">
          <div className="text-center space-y-8">
            {/* 成功アイコン */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">
                解錠完了！
              </h2>
              <p className="text-xl text-gray-600">
                ファイルが正常に解錠されました
              </p>
            </div>

            {/* 解錠済みファイル表示 */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 shadow-inner">
              <div className="flex items-center justify-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl shadow-xl">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xl">
                    {unlockedFile.name}
                  </p>
                  <p className="text-lg text-gray-500 font-medium">解錠済み</p>
                </div>
              </div>
            </div>

            {/* ダウンロードボタン */}
            <button
              onClick={handleDownloadUnlocked}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 hover:transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
            >
              <Download className="h-6 w-6" />
              <span>解錠済みファイルをダウンロード</span>
            </button>
            {/* 新しいファイルを解錠 */}
            <button
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-800 text-lg font-medium transition-colors hover:underline"
            >
              別のファイルを解錠する
            </button>

            <div className="text-sm text-gray-500 mt-6 space-y-1">
              <p>解錠されたファイルは元の形式で復元されました。</p>
              <p>セキュリティのため、不要になったら削除することをお勧めします。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}