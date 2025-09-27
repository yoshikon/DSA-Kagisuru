import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, RefreshCw, Copy, Check, Save, Shield } from 'lucide-react';
import { FileEncryption } from '../../lib/crypto';

export function PasswordSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMethod, setPasswordMethod] = useState<'auto' | 'manual'>('auto');
  const [autoPassword, setAutoPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 現在のパスワードを読み込み
  useEffect(() => {
    const savedPassword = localStorage.getItem('kagisuru_decryption_password');
    if (savedPassword) {
      setCurrentPassword(savedPassword);
    }
  }, []);

  // 自動パスワード生成
  useEffect(() => {
    if (passwordMethod === 'auto') {
      generateNewPassword();
    }
  }, [passwordMethod]);

  const generateNewPassword = () => {
    const newPassword = FileEncryption.generatePassword();
    setAutoPassword(newPassword);
  };

  const copyToClipboard = async () => {
    try {
      const passwordToCopy = passwordMethod === 'auto' ? autoPassword : newPassword;
      await navigator.clipboard.writeText(passwordToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'パスワードは8文字以上で入力してください' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: '小文字を含めてください' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: '大文字を含めてください' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: '数字を含めてください' };
    }
    return { isValid: true, message: '' };
  };

  const handleSavePassword = async () => {
    const passwordToSave = passwordMethod === 'auto' ? autoPassword : newPassword;
    
    if (passwordMethod === 'manual') {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        setMessage({ type: 'error', text: validation.message });
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'パスワードが一致しません' });
        return;
      }
    }

    setIsSaving(true);
    
    try {
      // パスワードをローカルストレージに保存
      localStorage.setItem('kagisuru_decryption_password', passwordToSave);
      
      // 現在のパスワードを更新
      setCurrentPassword(passwordToSave);
      
      // フォームをリセット
      setNewPassword('');
      setConfirmPassword('');
      setAutoPassword('');
      
      setMessage({ type: 'success', text: 'パスワードが正常に保存されました' });
      
      // 3秒後にメッセージを消去
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Password save error:', error);
      setMessage({ type: 'error', text: 'パスワードの保存に失敗しました' });
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = passwordMethod === 'auto' ? 
    autoPassword.length > 0 : 
    newPassword.length > 0 && 
    newPassword === confirmPassword && 
    validatePassword(newPassword).isValid;

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            パスワード設定
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          暗号化ファイルを解錠するためのパスワードを設定・管理できます。
        </p>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className={`p-6 rounded-3xl border-2 shadow-2xl ${
          message.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800' 
            : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-3">
            {message.type === 'success' ? (
              <Check className="h-6 w-6" />
            ) : (
              <Shield className="h-6 w-6" />
            )}
            <span className="text-lg font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        {/* 現在のパスワード */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">現在のパスワード</h2>
          
          {currentPassword ? (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  readOnly
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 font-mono text-lg pr-12 shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <span className="text-lg text-green-800 font-bold">
                    パスワードが設定されています
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  このパスワードで暗号化ファイルを解錠できます
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <Key className="h-6 w-6 text-yellow-600" />
                <span className="text-lg text-yellow-800 font-bold">
                  パスワードが設定されていません
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                新しいパスワードを設定してください
              </p>
            </div>
          )}
        </div>

        {/* 新しいパスワード設定 */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">新しいパスワード設定</h2>
          
          <div className="space-y-8">
            {/* パスワード生成方法選択 */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">パスワード生成方法</h3>
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="passwordMethod"
                    value="auto"
                    checked={passwordMethod === 'auto'}
                    onChange={(e) => setPasswordMethod(e.target.value as 'auto')}
                    className="mt-1 text-orange-600 focus:ring-orange-500 w-5 h-5"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">自動生成（推奨）</div>
                    <div className="text-lg text-gray-600">
                      強力なパスワードを自動生成します
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="passwordMethod"
                    value="manual"
                    checked={passwordMethod === 'manual'}
                    onChange={(e) => setPasswordMethod(e.target.value as 'manual')}
                    className="mt-1 text-orange-600 focus:ring-orange-500 w-5 h-5"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">手動入力</div>
                    <div className="text-lg text-gray-600">
                      自分でパスワードを設定します
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 自動生成パスワード */}
            {passwordMethod === 'auto' && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={autoPassword}
                      readOnly
                      className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-l-2xl bg-gradient-to-r from-gray-50 to-gray-100 font-mono text-lg shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="px-4 border-t-2 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-lg"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="px-4 border-2 border-gray-200 rounded-r-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-lg"
                    >
                      {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={generateNewPassword}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-lg font-medium hover:underline transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>新しいパスワードを生成</span>
                  </button>
                  {copied && (
                    <span className="text-lg text-green-600 font-medium">コピーしました！</span>
                  )}
                </div>
              </div>
            )}

            {/* 手動入力パスワード */}
            {passwordMethod === 'manual' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8文字以上の強力なパスワード"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 pr-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {newPassword && !validatePassword(newPassword).isValid && (
                    <p className="mt-2 text-lg text-red-600 font-medium">
                      {validatePassword(newPassword).message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">
                    パスワード確認
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="パスワードを再入力"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 pr-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-2 text-lg text-red-600 font-medium">
                      パスワードが一致しません
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-500 space-y-2">
                  <p>パスワードの要件:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                      8文字以上
                    </li>
                    <li className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : ''}>
                      小文字を含む
                    </li>
                    <li className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : ''}>
                      大文字を含む
                    </li>
                    <li className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : ''}>
                      数字を含む
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 保存ボタン */}
            <button
              onClick={handleSavePassword}
              disabled={!canSave || isSaving}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-2xl hover:from-orange-700 hover:to-orange-800 focus:ring-4 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 hover:transform hover:scale-105 space-x-3 text-lg"
            >
              <Save className="h-6 w-6" />
              <span>{isSaving ? '保存中...' : 'パスワードを保存'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 使用方法 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-3 text-xl">パスワードの使用方法</h4>
            <ul className="text-lg text-blue-800 space-y-2">
              <li>• このパスワードは暗号化ファイルの解錠時に使用されます</li>
              <li>• ファイル解錠ページで自動的にこのパスワードが使用されます</li>
              <li>• パスワードは安全に暗号化されてローカルに保存されます</li>
              <li>• 定期的にパスワードを変更することをお勧めします</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}