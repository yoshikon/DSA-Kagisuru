import React, { useState } from 'react';
import { BookOpen, Users, Plus, ArrowRight } from 'lucide-react';

export function AddressBookPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'self'>('contacts');

  const handleNewRecipient = () => {
    window.location.href = '/encrypt';
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">アドレス帳</h1>
        </div>
      </div>

      {/* アドレスの使い方 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-blue-100 rounded">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">アドレスの使い方</h3>
            <p className="text-sm text-blue-800">
              アドレス帳にはこれまで施錠や解錠を行った相手が表示されます（カギスルユーザーのみ）。
              各アドレスを開くと、相手との施錠や解錠のやり取りの履歴が表示されます。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              相手
            </button>
            <button
              onClick={() => setActiveTab('self')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'self'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              自分
            </button>
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-8">
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {/* 新しい受取人に施錠 */}
              <div className="bg-gray-800 text-white rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">新しい受取人に施錠する</h3>
                </div>
                
                <p className="text-gray-300 mb-4">
                  メールアドレスで新しい受取人に施錠できます。
                </p>
                
                <button
                  onClick={handleNewRecipient}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <span>施錠</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* 連絡先一覧（空の状態） */}
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだ連絡先がありません
                </h3>
                <p className="text-gray-500 mb-6">
                  ファイルを施錠すると、相手の連絡先が自動的に追加されます
                </p>
                <button
                  onClick={handleNewRecipient}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>最初のファイルを施錠</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'self' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                あなたの情報
              </h3>
              <p className="text-gray-500">
                プロフィール設定は今後のアップデートで追加予定です
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}