import React, { useState } from 'react';
import { X, Shield, Plus, User, Eye, Download, Share2 } from 'lucide-react';

interface AccessPermission {
  email: string;
  canView: boolean;
  canDownload: boolean;
  canShare: boolean;
}

interface AccessPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: AccessPermission[]) => void;
  initialRecipients?: string[];
}

export function AccessPermissionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialRecipients = [] 
}: AccessPermissionModalProps) {
  const [permissions, setPermissions] = useState<AccessPermission[]>(
    initialRecipients.map(email => ({
      email,
      canView: true,
      canDownload: true,
      canShare: false
    }))
  );
  const [newUserEmail, setNewUserEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addNewUser = () => {
    const email = newUserEmail.trim().toLowerCase();
    
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    if (permissions.find(p => p.email === email)) {
      setError('既に追加されています');
      return;
    }

    setPermissions([...permissions, {
      email,
      canView: true,
      canDownload: true,
      canShare: false
    }]);
    setNewUserEmail('');
    setError('');
  };

  const removeUser = (email: string) => {
    setPermissions(permissions.filter(p => p.email !== email));
  };

  const updatePermission = (email: string, field: keyof Omit<AccessPermission, 'email'>, value: boolean) => {
    setPermissions(permissions.map(p => 
      p.email === email ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = () => {
    onSave(permissions);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewUser();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">アクセス権限設定</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* 説明セクション */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">アクセス権限について</h3>
                <p className="text-blue-800">
                  特定のユーザーにのみファイルへのアクセスを許可できます。各ユーザーに対して、表示・ダウンロード・共有の権限を個別に設定可能です。
                </p>
              </div>
            </div>
          </div>

          {/* 新しいユーザー追加 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">新しいユーザーを追加</h3>
            <div className="flex space-x-3">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => {
                  setNewUserEmail(e.target.value);
                  if (error) setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="user@example.com"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg"
              />
              <button
                onClick={addNewUser}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>追加</span>
              </button>
            </div>
            {error && (
              <p className="mt-2 text-red-600 font-medium">{error}</p>
            )}
          </div>

          {/* ユーザー一覧 */}
          {permissions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">アクセス権限一覧</h3>
              
              {/* テーブルヘッダー */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="font-bold text-gray-700">ユーザー</div>
                  <div className="font-bold text-gray-700 text-center">表示</div>
                  <div className="font-bold text-gray-700 text-center">ダウンロード</div>
                  <div className="font-bold text-gray-700 text-center">共有</div>
                  <div className="font-bold text-gray-700 text-center">操作</div>
                </div>
              </div>

              {/* ユーザー行 */}
              <div className="space-y-3">
                {permissions.map((permission, index) => (
                  <div key={permission.email} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      {/* ユーザー情報 */}
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-xl">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{permission.email}</p>
                          <p className="text-sm text-gray-500">受信者</p>
                        </div>
                      </div>

                      {/* 表示権限 */}
                      <div className="text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permission.canView}
                            onChange={(e) => updatePermission(permission.email, 'canView', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Eye className="h-4 w-4 ml-2 text-gray-500" />
                        </label>
                      </div>

                      {/* ダウンロード権限 */}
                      <div className="text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permission.canDownload}
                            onChange={(e) => updatePermission(permission.email, 'canDownload', e.target.checked)}
                            disabled={!permission.canView}
                            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                          />
                          <Download className="h-4 w-4 ml-2 text-gray-500" />
                        </label>
                      </div>

                      {/* 共有権限 */}
                      <div className="text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permission.canShare}
                            onChange={(e) => updatePermission(permission.email, 'canShare', e.target.checked)}
                            disabled={!permission.canView}
                            className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                          />
                          <Share2 className="h-4 w-4 ml-2 text-gray-500" />
                        </label>
                      </div>

                      {/* 削除ボタン */}
                      <div className="text-center">
                        <button
                          onClick={() => removeUser(permission.email)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 空の状態 */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                まだアクセス権限が設定されていません
              </h3>
              <p className="text-gray-500 text-lg">
                上記のフォームからユーザーを追加してください
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            アクセス権限なし（誰でもアクセス可能）
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}