import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { ProfileService, UserProfile } from '../../lib/profile-service';
import { User, Mail, Phone, Calendar, Shield, Edit, LogOut } from 'lucide-react';

interface AccountInfoPageProps {
  onEditClick?: () => void;
}

export const AccountInfoPage = ({ onEditClick }: AccountInfoPageProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await ProfileService.getProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      navigate('/');
    }
  };

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick();
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* プロフィールカード */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.display_name || 'ユーザー'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>プロフィール編集</span>
          </button>
        </div>

        {/* プロフィール詳細 */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-500">メールアドレス</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
          </div>

          {profile?.phone_number && (
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500">電話番号</p>
                <p className="text-gray-900">{profile.phone_number}</p>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-500">登録日</p>
              <p className="text-gray-900">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('ja-JP')
                  : '-'}
              </p>
            </div>
          </div>

          {profile?.bio && (
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">自己紹介</p>
              <p className="text-gray-900 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* セキュリティ情報 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">セキュリティ</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">二段階認証</p>
              <p className="text-sm text-gray-500">アカウントのセキュリティを強化</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.two_factor_enabled
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile?.two_factor_enabled ? '有効' : '無効'}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">電話番号認証</p>
              <p className="text-sm text-gray-500">電話番号による本人確認</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.phone_verified
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile?.phone_verified ? '認証済み' : '未認証'}
            </span>
          </div>
        </div>
      </div>

      {/* アカウントアクション */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">アカウント操作</h3>
        <div className="space-y-3">
          <button
            onClick={handleEdit}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span className="font-medium">プロフィールを編集</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">ログアウト</span>
          </button>
        </div>
      </div>
    </div>
  );
};
