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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setDecryptedFile(null);
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
    } catch (err: any) {
      console.error('Decryption error:', err);
      setError(err.message || 'ファイルの解錠に失敗しました。パスワードが正しいか確認してください。');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownload = () => {
    if (!decryptedFile) return;

    const blob = new Blob([decryptedFile.data], { type: decryptedFile.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                    accept=".encrypted"
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">
                        {selectedFile ? selectedFile.name : 'クリックしてファイルを選択'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        .encrypted ファイルのみ対応
                      </p>
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

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
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
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
