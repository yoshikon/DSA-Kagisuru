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
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            アドレス帳
          </h1>
        </div>
      </div>

      {/* アドレスの使い方 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-3 text-xl">アドレスの使い方</h3>
            <p className="text-lg text-blue-800">
              アドレス帳にはこれまで施錠や解錠を行った相手が表示されます（カギスルユーザーのみ）。
              各アドレスを開くと、相手との施錠や解錠のやり取りの履歴が表示されます。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm">
        {/* タブナビゲーション */}
        <div className="border-b-2 border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-8 py-6 text-lg font-bold border-b-4 transition-all duration-300 ${
                activeTab === 'contacts'
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              相手
            </button>
            <button
              onClick={() => setActiveTab('self')}
              className={`px-8 py-6 text-lg font-bold border-b-4 transition-all duration-300 ${
                activeTab === 'self'
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              自分
            </button>
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-10">
          {activeTab === 'contacts' && (
            <div className="space-y-8">
              {/* 新しい受取人に施錠 */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">新しい受取人に施錠する</h3>
                </div>
                
                <p className="text-slate-300 mb-6 text-lg">
                  メールアドレスで新しい受取人に施錠できます。
                </p>
                
                <button
                  onClick={handleNewRecipient}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-blue-500/25 hover:transform hover:scale-105 text-lg"
                >
                  <span>施錠</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              {/* 連絡先一覧（空の状態） */}
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  まだ連絡先がありません
                </h3>
                <p className="text-gray-500 mb-8 text-lg">
                  ファイルを施錠すると、相手の連絡先が自動的に追加されます
                </p>
                <button
                  onClick={handleNewRecipient}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-xl hover:shadow-blue-500/25 hover:transform hover:scale-105 space-x-3 text-lg font-bold"
                >
                  <Plus className="h-5 w-5" />
                  <span>最初のファイルを施錠</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'self' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                あなたの情報
              </h3>
              <p className="text-gray-500 text-lg">
                プロフィール設定は今後のアップデートで追加予定です
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}