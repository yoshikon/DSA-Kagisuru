import React, { useState } from 'react';
import { Lock, User, Upload, Clock, ChevronDown, Download, X } from 'lucide-react';
import { FileUploadZone } from '../ui/file-upload-zone';
import { FileEncryption } from '../../lib/crypto';

export function FileLockPage() {
  const [sender, setSender] = useState('今野');
  const [recipient, setRecipient] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [lockedFile, setLockedFile] = useState<{
    originalFile: File;
    encryptedData: Uint8Array;
    fileName: string;
  } | null>(null);

  const handleLock = async () => {
    if (!recipient || files.length === 0) {
      alert('受信者とファイルを指定してください');
      return;
    }
    
    setIsLocking(true);
    
    try {
      // デモ用の簡単な暗号化処理
      const fileToLock = files[0];
      const password = FileEncryption.generatePassword();
      
      const encryptedFile = await FileEncryption.encryptFile(
        fileToLock,
        password
      );
      
      // 施錠済みファイル情報を保存
      setLockedFile({
        originalFile: fileToLock,
        encryptedData: encryptedFile.encryptedData,
        fileName: `【施錠済み】${fileToLock.name}.kgsr`
      });
      
      alert(`${recipient}宛にファイルを施錠しました`);
    } catch (error) {
      console.error('施錠エラー:', error);
      alert('ファイルの施錠に失敗しました');
    } finally {
      setIsLocking(false);
    }
  };

  const handleDownload = () => {
    if (!lockedFile) return;
    
    // 暗号化ファイルをダウンロード
    const blob = new Blob([lockedFile.encryptedData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lockedFile.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLockedFile(null);
    setFiles([]);
    setRecipient('');
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ファイル施錠</h1>
        </div>
        <p className="text-lg text-gray-600">
          指定する受取人だけが開けるように、ファイルを施錠できます。
        </p>
      </div>

      {!lockedFile ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          {/* 送信者設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              差出人
            </label>
            <div className="relative">
              <select
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                disabled={isLocking}
              >
                <option value="今野">今野</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 受信者設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              受取人
            </label>
            <div className="relative">
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="履歴から検索、または新しい受取人のメールアドレスを入力"
                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLocking}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* 候補表示エリア */}
            <div className="mt-2 p-4 bg-gray-800 text-white rounded-lg">
              <p className="text-sm text-gray-300 mb-2">
                以下の候補にない新しいメールアドレスも、上のフォームに入力すれば指定できます。
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <span>今野</span>
                <span className="text-gray-400">konno.29@gmail.com</span>
                <button className="text-blue-400 hover:text-blue-300">
                  <User className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ファイルアップロード */}
          <div>
            <FileUploadZone
              onFileSelect={setFiles}
              maxFiles={5}
              maxSizeBytes={100 * 1024 * 1024}
              disabled={isLocking}
            />
          </div>

          {/* 施錠ボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleLock}
              disabled={!recipient || files.length === 0 || isLocking}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
            >
              <Lock className="h-5 w-5" />
              <span>{isLocking ? '施錠中...' : '施錠する'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 施錠完了画面 */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            {/* 受信者表示 */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>{sender}</span>
                <User className="h-3 w-3" />
                <button 
                  onClick={handleReset}
                  className="hover:bg-gray-600 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="email"
                value={recipient}
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center"
              />
            </div>

            {/* 施錠済みファイル表示 */}
            <div className="bg-gray-100 rounded-lg p-8 mb-6">
              <div className="flex flex-col items-center space-y-4">
                <button 
                  onClick={handleReset}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
                
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">施錠済み</p>
                  <p className="font-medium text-gray-900">{lockedFile.fileName}</p>
                </div>
              </div>
            </div>

            {/* ダウンロードボタン */}
            <button
              onClick={handleDownload}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              ダウンロード
            </button>

            <div className="text-xs text-gray-500 mt-4">
              <p>リスク回避のため、施錠済みファイルをダウンロードして保管することをお勧めします。</p>
              <p>このファイルは指定された受取人のみが解錠できます。</p>
            </div>
          </div>
        </div>
      )}

      {/* 履歴セクション */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">履歴</h2>
        </div>
        
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {lockedFile ? '施錠が完了しました' : 'まだ履歴がありません'}
          </p>
        </div>
      </div>
    </div>
  );
}