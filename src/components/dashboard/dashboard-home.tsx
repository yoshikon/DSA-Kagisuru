import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { ProfileService, UserProfile } from '../../lib/profile-service';
import {
  Lock,
  Unlock,
  Send,
  Users,
  Shield,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface QuickActionCard {
  title: string;
  description: string;
  icon: typeof Lock;
  path: string;
  color: string;
}

const quickActions: QuickActionCard[] = [
  {
    title: 'ファイルロック',
    description: 'ファイルを暗号化して保護',
    icon: Lock,
    path: '/dashboard/lock',
    color: 'bg-blue-500',
  },
  {
    title: 'ファイルアンロック',
    description: '暗号化されたファイルを復号化',
    icon: Unlock,
    path: '/dashboard/unlock',
    color: 'bg-green-500',
  },
  {
    title: 'ファイル送信',
    description: '安全にファイルを送信',
    icon: Send,
    path: '/dashboard/send',
    color: 'bg-purple-500',
  },
  {
    title: 'アドレス帳',
    description: '連絡先を管理',
    icon: Users,
    path: '/dashboard/contacts',
    color: 'bg-orange-500',
  },
];

export const DashboardHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const userProfile = await ProfileService.getProfile(user.id);
        setProfile(userProfile);
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ようこそ、{profile?.display_name || 'ゲスト'}さん
        </h1>
        <p className="text-blue-100 text-lg">
          カギエースで安全にファイルを管理しましょう
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 group"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  開く
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Additional features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">セキュリティステータス</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">二段階認証</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.two_factor_enabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile?.two_factor_enabled ? '有効' : '無効'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">電話番号認証</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.phone_verified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile?.phone_verified ? '認証済み' : '未認証'}
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/settings"
            className="mt-4 block w-full text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            セキュリティ設定
          </Link>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">最近のアクティビティ</h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>アクティビティはまだありません</p>
          </div>
        </div>
      </div>

      {/* Legacy feature access */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <FileText className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ファイル暗号化ページ
            </h3>
            <p className="text-gray-600 mb-4">
              従来のファイル暗号化機能にアクセスできます。ファイルのアップロード、暗号化、共有が可能です。
            </p>
            <Link
              to="/encrypt"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ファイル暗号化ページへ
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
