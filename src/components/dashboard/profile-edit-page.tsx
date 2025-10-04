import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { ProfileService, UserProfile } from '../../lib/profile-service';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone, Shield, Camera, Eye, EyeOff, AlertCircle, Key, Save } from 'lucide-react';

type TabType = 'basic' | 'password' | 'email';

export const ProfileEditPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [basicInfo, setBasicInfo] = useState({
    display_name: '',
    phone_number: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    emailPassword: false,
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await ProfileService.getProfile(user.id);
      setProfile(userProfile);
      setBasicInfo({
        display_name: userProfile?.display_name || '',
        phone_number: userProfile?.phone_number || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await ProfileService.updateProfile(user.id, basicInfo);
      await loadProfile();
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'すべてのフィールドを入力してください' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードが一致しません' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'パスワードは8文字以上である必要があります' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'パスワードを変更しました' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setMessage({ type: 'error', text: error.message || 'パスワードの変更に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailData.newEmail || !emailData.currentPassword) {
      setMessage({ type: 'error', text: 'すべてのフィールドを入力してください' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: '確認メールを送信しました。新しいメールアドレスで確認してください。' });
      setEmailData({
        newEmail: '',
        currentPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to change email:', error);
      setMessage({ type: 'error', text: error.message || 'メールアドレスの変更に失敗しました' });
    } finally {
      setSaving(false);
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <User className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">プロフィール設定</h1>
        </div>
        <p className="text-gray-600 ml-11">アカウント情報とセキュリティ設定を管理</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('basic');
              setMessage(null);
            }}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>基本情報</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('password');
              setMessage(null);
            }}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>パスワード変更</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('email');
              setMessage(null);
            }}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>メールアドレス変更</span>
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="flex items-start space-x-6 pb-6 border-b">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">プロフィール画像</h3>
                <p className="text-sm text-gray-500">JPG、PNG形式のファイルをアップロードできます（最大5MB）</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                表示名
              </label>
              <input
                type="text"
                value={basicInfo.display_name}
                onChange={(e) => setBasicInfo({ ...basicInfo, display_name: e.target.value })}
                placeholder="表示名を入力してください"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">
                メールアドレスを変更するには「メールアドレス変更」タブを使用してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                電話番号
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={basicInfo.phone_number}
                  onChange={(e) => setBasicInfo({ ...basicInfo, phone_number: e.target.value })}
                  placeholder="090-1234-5678"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">二段階認証で使用されます</p>
            </div>

            <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">二段階認証</p>
                  <p className="text-xs text-gray-500">無効</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                無効
              </span>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleBasicInfoSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">パスワード変更</h3>
              <p className="text-sm text-gray-600 mb-6">
                セキュリティのため、現在のパスワードを入力してから新しいパスワードを設定してください。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                現在のパスワード
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                新しいパスワード
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                新しいパスワード（確認）
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">パスワード要件</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• 8文字以上</li>
                <li>• 大文字と小文字を含む</li>
                <li>• 数字を含む</li>
                <li>• 特殊文字を含むことを推奨</li>
              </ul>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Key className="w-5 h-5" />
                <span>{saving ? '変更中...' : 'パスワードを変更'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">メールアドレス変更</h3>
              <p className="text-sm text-gray-600 mb-6">
                新しいメールアドレスに確認メールが送信されます。確認後にメールアドレスが変更されます。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                現在のメールアドレス
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                新しいメールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                  placeholder="new@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                現在のパスワード（確認用）
              </label>
              <div className="relative">
                <input
                  type={showPasswords.emailPassword ? 'text' : 'password'}
                  value={emailData.currentPassword}
                  onChange={(e) => setEmailData({ ...emailData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, emailPassword: !showPasswords.emailPassword })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.emailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900 mb-1">重要な注意事項</h4>
                  <p className="text-sm text-yellow-800">
                    メールアドレスを変更すると、新しいアドレスで確認メールを受信する必要があります。確認が完了するまで、現在のメールアドレスでログインしてください。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleEmailChange}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Mail className="w-5 h-5" />
                <span>{saving ? '送信中...' : '確認メールを送信'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
