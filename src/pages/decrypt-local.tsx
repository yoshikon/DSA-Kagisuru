import React, { useState } from 'react';
import { Header } from '../components/layout/header';
import { FileEncryption } from '../lib/crypto';
import { ProfileService } from '../lib/profile-service';
import { useAuth } from '../contexts/auth-context';
import { Upload, Lock, Unlock, Key, Download, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export function DecryptLocalPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState<{
    data: Uint8Array;
    name: string;
    type: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useMasterPassword, setUseMasterPassword] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [autoDownload, setAutoDownload] = useState(true);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setDecryptedFile(null);

    // パスワードが保存されていて自動解錠が有効な場合
    if (rememberPassword && password && autoDownload) {
      setTimeout(() => {
        handleDecrypt();
      }, 500);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDecrypt = async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    if (useMasterPassword && !user) {
      setError('マスターパスワードを使用するにはログインが必要です');
      return;
    }

    if (!useMasterPassword && !password) {
      setError('パスワードを入力してください');
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      let decryptionPassword = password;

      if (useMasterPassword && user) {
        const hasMasterPassword = await ProfileService.hasMasterPassword(user.id);
        if (!hasMasterPassword) {
          setError('マスターパスワードが設定されていません。パスワード設定ページで設定してください。');
          setIsDecrypting(false);
          return;
        }

        if (!password) {
          setError('マスターパスワードを入力してください');
          setIsDecrypting(false);
          return;
        }

        const isValid = await ProfileService.verifyMasterPassword(user.id, password);
        if (!isValid) {
          setError('マスターパスワードが正しくありません');
          setIsDecrypting(false);
          return;
        }

        decryptionPassword = password;
      }

      const fileContent = await selectedFile.arrayBuffer();
      const fileData = new Uint8Array(fileContent);

      const decrypted = await FileEncryption.decryptFileWithMetadata(fileData, decryptionPassword);

      setDecryptedFile({
        data: decrypted.data,
        name: decrypted.originalName,
        type: decrypted.mimeType,
      });

      setError(null);

      // 自動ダウンロードが有効な場合
      if (autoDownload) {
        setTimeout(() => {
          downloadDecryptedFile(decrypted.data, decrypted.originalName, decrypted.mimeType);
        }, 500);
      }
    } catch (err: any) {
      console.error('Decryption error:', err);
      setError(err.message || 'ファイルの解錠に失敗しました。パスワードが正しいか確認してください。');
    } finally {
      setIsDecrypting(false);
    }
  };

  const downloadDecryptedFile = (data: Uint8Array, name: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDownload = () => {
    if (!decryptedFile) return;
    downloadDecryptedFile(decryptedFile.data, decryptedFile.name, decryptedFile.type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Unlock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ローカルファイル解錠
          </h1>
          <p className="text-gray-600">
            ダウンロードした暗号化ファイルを解錠します
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg space-y-6">
          {!decryptedFile ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  暗号化ファイルを選択
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".kgsr,.encrypted"
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex items-center justify-center w-full px-6 py-12 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-center">
                      <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                      {selectedFile ? (
                        <>
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            {isDragging ? 'ここにドロップ' : 'クリックまたはドラッグ&ドロップ'}
                          </p>
                          <p className="text-sm text-gray-500">
                            .kgsr または .encrypted ファイル
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {selectedFile && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="use-master-password"
                        checked={useMasterPassword}
                        onChange={(e) => setUseMasterPassword(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="use-master-password" className="text-sm font-medium text-gray-900">
                        管理画面のマスターパスワードを使用
                      </label>
                    </div>

                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {useMasterPassword ? 'マスターパスワード' : '解錠パスワード'}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={useMasterPassword ? 'マスターパスワードを入力' : 'パスワードを入力'}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleDecrypt();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {useMasterPassword && (
                      <p className="mt-2 text-xs text-gray-600">
                        ダッシュボードのパスワード設定で設定したマスターパスワードを入力してください
                      </p>
                    )}
                  </div>

                  {/* 便利機能オプション */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">便利機能</h4>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="auto-download"
                        checked={autoDownload}
                        onChange={(e) => setAutoDownload(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="auto-download" className="text-sm text-gray-700 cursor-pointer">
                        解錠後に自動でダウンロード
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="remember-password"
                        checked={rememberPassword}
                        onChange={(e) => setRememberPassword(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="remember-password" className="text-sm text-gray-700 cursor-pointer">
                        このセッション中パスワードを記憶（連続解錠用）
                      </label>
                    </div>

                    {rememberPassword && autoDownload && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
                        <p className="text-xs text-green-800">
                          <strong>ワンクリック解錠モード有効:</strong> 次回からファイルをドロップするだけで自動解錠＆ダウンロードされます
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDecrypt}
                    disabled={isDecrypting || !password}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                  >
                    {isDecrypting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>解錠中...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-5 h-5" />
                        <span>ファイルを解錠</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  解錠に成功しました！
                </h3>
                <p className="text-gray-600 mb-1">ファイル名: {decryptedFile.name}</p>
                <p className="text-sm text-gray-500">
                  サイズ: {(decryptedFile.data.length / 1024).toFixed(2)} KB
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>ダウンロード</span>
                </button>

                <button
                  onClick={() => {
                    setDecryptedFile(null);
                    setSelectedFile(null);
                    setPassword('');
                    setError(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  別のファイルを解錠
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {/* 使い方ガイド */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Unlock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-green-900 mb-3">簡単3ステップで解錠</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold bg-green-200 text-green-900 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                    <p><strong>ドラッグ&ドロップ:</strong> .kgsrファイルを上のエリアにドロップ</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold bg-green-200 text-green-900 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                    <p><strong>パスワード入力:</strong> マスターパスワードを入力</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold bg-green-200 text-green-900 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
                    <p><strong>自動完了:</strong> 解錠後、元のファイルが自動ダウンロード</p>
                  </div>
                </div>
                <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3">
                  <p className="text-xs text-green-900">
                    <strong>💡 ヒント:</strong> 「パスワードを記憶」を有効にすると、次回からファイルをドロップするだけで自動解錠されます！
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* セキュリティ情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2">マスターパスワードについて</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• マスターパスワードは管理画面のパスワード設定で設定できます</li>
                  <li>• すべての暗号化ファイルはマスターパスワードで保護されます</li>
                  <li>• マスターパスワードを忘れた場合、ファイルの解錠はできません</li>
                  <li>• セキュリティのため、定期的にパスワードを変更することをお勧めします</li>
                  <li>• 「パスワードを記憶」は現在のセッション中のみ有効です</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
