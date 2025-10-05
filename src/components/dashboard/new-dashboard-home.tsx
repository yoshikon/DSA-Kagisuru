import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { ProfileService, UserProfile } from '../../lib/profile-service';
import { ActivityService, Activity, FileHistory } from '../../lib/activity-service';
import {
  FileText,
  Users,
  Download,
  HardDrive,
  Shield,
  Lock,
  Unlock,
  BarChart3,
  ArrowRight,
  Calendar,
  ChevronRight,
  Send,
  Inbox,
  Eye,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const NewDashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fileHistory, setFileHistory] = useState<FileHistory[]>([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalRecipients: 0,
    totalDownloads: 0,
    totalSize: 0,
  });

  useEffect(() => {
    loadProfile();
    loadActivities();
    loadFileHistory();
    loadStats();
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

  const loadActivities = async () => {
    if (!user) return;
    try {
      const recentActivities = await ActivityService.getRecentActivities(user.id, 5);
      setActivities(recentActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadFileHistory = async () => {
    if (!user) return;
    try {
      const history = await ActivityService.getFileHistory(user.id, 5);
      setFileHistory(history);
    } catch (error) {
      console.error('Failed to load file history:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const history = await ActivityService.getFileHistory(user.id, 100);
      const uniqueRecipients = new Set(history.map(f => f.recipientEmail));
      const totalDownloads = history.reduce((sum, f) => sum + f.downloadCount, 0);
      const totalSize = history.reduce((sum, f) => sum + f.fileSize, 0);

      setStats({
        totalFiles: history.length,
        totalRecipients: uniqueRecipients.size,
        totalDownloads,
        totalSize,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const statsDisplay = [
    {
      icon: FileText,
      label: '暗号化ファイル',
      value: stats.totalFiles.toString(),
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Users,
      label: '共有相手',
      value: stats.totalRecipients.toString(),
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: Download,
      label: 'ダウンロード数',
      value: stats.totalDownloads.toString(),
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: HardDrive,
      label: '使用容量',
      value: ActivityService.formatFileSize(stats.totalSize),
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const quickActions = [
    {
      icon: Shield,
      title: 'ファイル暗号化',
      description: 'ファイルを暗号化して保護',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => navigate('/encrypt'),
    },
    {
      icon: Lock,
      title: 'ファイル施錠',
      description: 'ファイルを暗号化して安全に送信',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => {},
    },
    {
      icon: Unlock,
      title: 'ファイル解錠',
      description: '受信したファイルを復号化',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => {},
    },
    {
      icon: BarChart3,
      title: 'ファイル履歴',
      description: '送信済みファイルの管理',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => {},
    },
  ];

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'send': return Send;
      case 'inbox': return Inbox;
      case 'eye': return Eye;
      case 'download': return Download;
      case 'alert': return AlertCircle;
      default: return Lock;
    }
  };

  const getActivityColor = (icon: string) => {
    switch (icon) {
      case 'send': return { iconColor: 'text-blue-600', iconBg: 'bg-blue-50' };
      case 'inbox': return { iconColor: 'text-green-600', iconBg: 'bg-green-50' };
      case 'eye': return { iconColor: 'text-purple-600', iconBg: 'bg-purple-50' };
      case 'download': return { iconColor: 'text-orange-600', iconBg: 'bg-orange-50' };
      case 'alert': return { iconColor: 'text-red-600', iconBg: 'bg-red-50' };
      default: return { iconColor: 'text-gray-600', iconBg: 'bg-gray-50' };
    }
  };

  const securityStatus = [
    { label: 'AES-256暗号化', status: '有効', color: 'text-green-600' },
    { label: '二段階認証', status: '無効', color: 'text-yellow-600' },
    { label: 'HTTPS通信', status: '有効', color: 'text-green-600' },
    { label: 'セッション管理', status: '有効', color: 'text-green-600' },
  ];

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'ユーザー';
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              おかえりなさい、{displayName}さん
            </h1>
            <p className="text-blue-100 mb-4">暗号化ファイル管理システムへようこそ</p>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>最終ログイン: {currentDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>AES-256暗号化で保護</span>
              </div>
            </div>
          </div>

          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-12 h-12" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">クイックアクション</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-start space-x-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">セキュリティ状況</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {securityStatus.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === '有効' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">
                        {item.label}: <span className={`font-medium ${item.color}`}>{item.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                  二段階認証を設定する
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">ファイル履歴</h2>
              <button
                onClick={loadFileHistory}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                更新
              </button>
            </div>

            <div className="space-y-3">
              {fileHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">ファイル履歴がありません</p>
                  <p className="text-xs mt-1">ファイルを送信すると、ここに表示されます</p>
                </div>
              ) : (
                fileHistory.map((file) => (
                  <div key={file.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{file.fileName}</h4>
                        <p className="text-xs text-gray-600 mt-1">宛先: {file.recipientEmail}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${
                        file.status === 'active' ? 'bg-green-100 text-green-700' :
                        file.status === 'expired' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {file.status === 'active' ? '有効' :
                         file.status === 'expired' ? '期限切れ' : 'ダウンロード済み'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{ActivityService.formatFileSize(file.fileSize)}</span>
                      <span>送信: {ActivityService.formatRelativeTime(file.sentAt)}</span>
                      <span>DL: {file.downloadCount}回</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">最近のアクティビティ</h2>
            <button
              onClick={loadActivities}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              更新
            </button>
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">アクティビティがありません</p>
                <p className="text-xs mt-1">ファイルを送信すると、ここに表示されます</p>
              </div>
            ) : (
              activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.icon);
                const colors = getActivityColor(activity.icon);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <ActivityIcon className={`w-5 h-5 ${colors.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">{activity.title}</p>
                      <p className="text-xs text-gray-600 mb-1">{activity.description}</p>
                      <p className="text-xs text-gray-500">{ActivityService.formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
