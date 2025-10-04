import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { ProfileService, UserProfile } from '../lib/profile-service';
import { User, LogOut, Shield, Calendar, Mail } from 'lucide-react';

export default function AccountDashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, loading, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await ProfileService.getProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">アカウント管理</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* プロフィール情報 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">プロフィール情報</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-gray-900">
                      {profile?.display_name || 'ユーザー'}
                    </p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-5 h-5 mr-2 text-gray-400" />
                      <span>メールアドレス</span>
                    </div>
                    <span className="text-gray-900 font-medium">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                      <span>登録日</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('ja-JP')
                        : '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Shield className="w-5 h-5 mr-2 text-gray-400" />
                      <span>二段階認証</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile?.two_factor_enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile?.two_factor_enabled ? '有効' : '無効'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 追加情報 */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">アカウント詳細</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ユーザーID</span>
                  <span className="text-gray-900 font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最終更新日</span>
                  <span className="text-gray-900">
                    {profile?.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString('ja-JP')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">クイックアクション</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/encrypt')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ファイル暗号化
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  従来のダッシュボード
                </button>
              </div>
            </div>

            {/* セキュリティ情報 */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center mb-3">
                <Shield className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-bold">セキュリティ</h3>
              </div>
              <p className="text-blue-100 text-sm">
                アカウントはSupabase認証により保護されています。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
