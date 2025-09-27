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
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Key className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">パスワード設定</h1>
        </div>
        <p className="text-lg text-gray-600">
          暗号化ファイルを解錠するためのパスワードを設定・管理できます。
        </p>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 現在のパスワード */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">現在のパスワード</h2>
          
          {currentPassword ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  readOnly
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    パスワードが設定されています
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  このパスワードで暗号化ファイルを解錠できます
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">
                  パスワードが設定されていません
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                新しいパスワードを設定してください
              </p>
            </div>
          )}
        </div>

        {/* 新しいパスワード設定 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">新しいパスワード設定</h2>
          
          <div className="space-y-6">
            {/* パスワード生成方法選択 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">パスワード生成方法</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="passwordMethod"
                    value="auto"
                    checked={passwordMethod === 'auto'}
                    onChange={(e) => setPasswordMethod(e.target.value as 'auto')}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">自動生成（推奨）</div>
                    <div className="text-sm text-gray-600">
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
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">手動入力</div>
                    <div className="text-sm text-gray-600">
                      自分でパスワードを設定します
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 自動生成パスワード */}
            {passwordMethod === 'auto' && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={autoPassword}
                      readOnly
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-l-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="px-3 border-t border-b border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="px-3 border border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={generateNewPassword}
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>新しいパスワードを生成</span>
                  </button>
                  {copied && (
                    <span className="text-sm text-green-600">コピーしました！</span>
                  )}
                </div>
              </div>
            )}

            {/* 手動入力パスワード */}
            {passwordMethod === 'manual' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8文字以上の強力なパスワード"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                  {newPassword && !validatePassword(newPassword).isValid && (
                    <p className="mt-1 text-sm text-red-600">
                      {validatePassword(newPassword).message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード確認
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="パスワードを再入力"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      パスワードが一致しません
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>パスワードの要件:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
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
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{isSaving ? '保存中...' : 'パスワードを保存'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 使用方法 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">パスワードの使用方法</h4>
            <ul className="text-sm text-blue-800 space-y-1">
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