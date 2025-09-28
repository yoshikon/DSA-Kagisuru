import React, { useState } from 'react';
import { Lock, User, Upload, Clock, ChevronDown, Download, X } from 'lucide-react';
import { FileUploadZone } from '../ui/file-upload-zone';
import { FileEncryption } from '../../lib/crypto';
import { SendFilePage } from './send-file-page';
import { DownloadModal } from './download-modal';

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
  const [showSendPage, setShowSendPage] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleLock = async () => {
    if (!recipient || files.length === 0) {
      alert('受信者とファイルを指定してください');
      return;
    }
    
    setIsLocking(true);
    
    try {
      // デモ用の簡単な暗号化処理
      const fileToLock = files[0];
      
      // 設定されたパスワードを使用、なければ生成
      let password = localStorage.getItem('kagisuru_decryption_password');
      if (!password) {
        password = FileEncryption.generatePassword();
        localStorage.setItem('kagisuru_decryption_password', password);
      }
      
      // 実際の暗号化処理を実行
      const encryptedFile = await FileEncryption.encryptFile(
        fileToLock,
        password,
        (progress) => console.log('Encryption progress:', progress)
      );
      
      // メタデータとヘッダーを準備
      const metadata = {
        version: '1.0',
        salt: Array.from(encryptedFile.salt),
        iv: Array.from(encryptedFile.iv),
        originalName: fileToLock.name,
        mimeType: fileToLock.type,
        originalSize: fileToLock.size,
        encryptedSize: encryptedFile.encryptedData.length
      };
      
      const headerJson = JSON.stringify(metadata);
      const headerBytes = new TextEncoder().encode(headerJson);
      
      // カスタムファイル形式: [4 bytes header length][header JSON][encrypted data]
      const finalData = new Uint8Array(4 + headerBytes.length + encryptedFile.encryptedData.length);
      
      // ヘッダー長をリトルエンディアンで書き込み
      const dataView = new DataView(finalData.buffer);
      dataView.setUint32(0, headerBytes.length, true);
      
      finalData.set(headerBytes, 4);
      finalData.set(encryptedFile.encryptedData, 4 + headerBytes.length);
      
      // 施錠済みファイル情報を保存
      setLockedFile({
        originalFile: fileToLock,
        encryptedData: finalData,
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

  const handleDownload = (customFileName?: string) => {
    if (!lockedFile) return;
    
    const downloadFileName = customFileName || lockedFile.fileName;
    
    // 暗号化ファイルをダウンロード
    const blob = new Blob([lockedFile.encryptedData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const handleDownloadConfirm = (fileName: string, saveLocation?: string) => {
    handleDownload(fileName);
    setShowDownloadModal(false);
    
    // ダウンロード後に送信ページに遷移するか確認
    setTimeout(() => {
      if (confirm('ファイルのダウンロードが完了しました。受取人に送信しますか？')) {
        setShowSendPage(true);
      }
    }, 1000);
  };

  const handleReset = () => {
    setLockedFile(null);
    setFiles([]);
    setRecipient('');
    setShowSendPage(false);
  };

  // 送信ページを表示する場合
  if (showSendPage) {
    return (
      <SendFilePage 
        lockedFile={lockedFile}
        onBack={handleReset}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            ファイル施錠
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          指定する受取人だけが開けるように、ファイルを施錠できます。
        </p>
      </div>

      {!lockedFile ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-10 space-y-10 backdrop-blur-sm">
          {/* 送信者設定 */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              差出人
            </label>
            <div className="relative">
              <select
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white pr-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLocking}
              >
                <option value="今野">今野</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 受信者設定 */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              受取人
            </label>
            <div className="relative">
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="履歴から検索、または新しい受取人のメールアドレスを入力"
                className="w-full px-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLocking}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            
            {/* 候補表示エリア */}
            <div className="mt-4 p-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl shadow-xl">
              <p className="text-sm text-slate-300 mb-3">
                以下の候補にない新しいメールアドレスも、上のフォームに入力すれば指定できます。
              </p>
              <div className="flex items-center space-x-3 text-sm">
                <span>今野</span>
                <span className="text-slate-400">konno.29@gmail.com</span>
                <button className="text-blue-400 hover:text-blue-300 p-1 rounded-lg hover:bg-slate-600 transition-colors">
                  <User className="h-5 w-5" />
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
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:transform hover:scale-105 space-x-3 text-lg"
            >
              <Lock className="h-6 w-6" />
              <span>{isLocking ? '施錠中...' : '施錠する'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 施錠完了画面 */
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-sm">
          <div className="text-center space-y-8">
            {/* 受信者表示 */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-3 rounded-2xl text-lg flex items-center space-x-3 shadow-xl">
                <span>{sender}</span>
                <User className="h-5 w-5" />
                <button 
                  onClick={handleReset}
                  className="hover:bg-slate-600 rounded-xl p-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-8">
              <input
                type="email"
                value={recipient}
                readOnly
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200 rounded-2xl text-center text-lg font-medium shadow-lg"
              />
            </div>

            {/* 施錠済みファイル表示 */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-10 mb-8 shadow-inner">
              <div className="flex flex-col items-center space-y-6">
                <button 
                  onClick={handleReset}
                  className="absolute top-6 right-6 p-3 hover:bg-gray-200 rounded-2xl transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
                
                <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Lock className="h-10 w-10 text-white" />
                </div>
                
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-2 font-medium">施錠済み</p>
                  <p className="font-bold text-gray-900 text-xl">{lockedFile.fileName}</p>
                </div>
              </div>
            </div>

            {/* ダウンロードボタン */}
            <button
              onClick={handleDownloadClick}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:transform hover:scale-105 text-lg"
            >
              ダウンロード
            </button>

            <div className="text-sm text-gray-500 mt-6 space-y-1">
              <p>リスク回避のため、施錠済みファイルをダウンロードして保管することをお勧めします。</p>
              <p>このファイルは指定された受取人のみが解錠できます。</p>
            </div>
          </div>
        </div>
      )}

      {/* ダウンロードモーダル */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadConfirm}
        originalFileName={lockedFile?.originalFile?.name || ''}
        fileSize={lockedFile?.encryptedData?.length || 0}
      />

      {/* 履歴セクション */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-sm">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl">
            <Clock className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">履歴</h2>
        </div>
        
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-500 text-lg">
            {lockedFile ? '施錠が完了しました' : 'まだ履歴がありません'}
          </p>
        </div>
      </div>
    </div>
  );
}