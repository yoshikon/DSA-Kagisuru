import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { ProfileService, UserProfile } from '../../lib/profile-service';
import { supabase } from '../../lib/supabase';
import { MFAService, PasskeyService, MFASettings, Passkey } from '../../lib/mfa-service';
import { User, Mail, Phone, Shield, Camera, Eye, EyeOff, AlertCircle, Key, Save, Smartphone, Trash2, Plus, Check, X as XIcon } from 'lucide-react';

type TabType = 'basic' | 'password' | 'email' | 'mfa' | 'passkey';

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

  const [mfaSettings, setMfaSettings] = useState<MFASettings | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [registeringPasskey, setRegisteringPasskey] = useState(false);

  useEffect(() => {
    loadProfile();
    loadMFASettings();
    loadPasskeys();
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

  const loadMFASettings = async () => {
    if (!user) return;
    try {
      const settings = await MFAService.getMFASettings(user.id);
      setMfaSettings(settings);
    } catch (error) {
      console.error('Failed to load MFA settings:', error);
    }
  };

  const loadPasskeys = async () => {
    if (!user) return;
    try {
      const keys = await PasskeyService.getPasskeys(user.id);
      setPasskeys(keys);
    } catch (error) {
      console.error('Failed to load passkeys:', error);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!user || !profile?.phone_number) {
      setMessage({ type: 'error', text: '電話番号を先に設定してください' });
      return;
    }

    setSendingCode(true);
    setMessage(null);

    try {
      await MFAService.sendVerificationCode(user.id, profile.phone_number);
      setCodeSent(true);
      setMessage({ type: 'success', text: `認証コードを ${profile.phone_number} に送信しました（開発環境ではコンソールに表示されます）` });
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      setMessage({ type: 'error', text: '認証コードの送信に失敗しました' });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user || !verificationCode) {
      setMessage({ type: 'error', text: '認証コードを入力してください' });
      return;
    }

    setVerifyingCode(true);
    setMessage(null);

    try {
      const success = await MFAService.verifyCode(user.id, verificationCode);
      if (success) {
        setMessage({ type: 'success', text: '電話番号の認証が完了しました' });
        setVerificationCode('');
        setCodeSent(false);
        await loadMFASettings();
      } else {
        setMessage({ type: 'error', text: '認証コードが正しくないか、有効期限が切れています' });
      }
    } catch (error: any) {
      console.error('Failed to verify code:', error);
      setMessage({ type: 'error', text: '認証に失敗しました' });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleToggleMFA = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      if (mfaSettings?.mfa_enabled) {
        await MFAService.disableMFA(user.id);
        setMessage({ type: 'success', text: '二段階認証を無効にしました' });
      } else {
        if (!mfaSettings?.phone_verified) {
          setMessage({ type: 'error', text: '電話番号の認証が必要です' });
          return;
        }
        await MFAService.enableMFA(user.id);
        setMessage({ type: 'success', text: '二段階認証を有効にしました' });
      }
      await loadMFASettings();
    } catch (error: any) {
      console.error('Failed to toggle MFA:', error);
      setMessage({ type: 'error', text: error.message || '二段階認証の設定に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!user || !newDeviceName.trim()) {
      setMessage({ type: 'error', text: 'デバイス名を入力してください' });
      return;
    }

    setRegisteringPasskey(true);
    setMessage(null);

    try {
      await PasskeyService.registerPasskey(user.id, newDeviceName.trim());
      setMessage({ type: 'success', text: 'パスキーを登録しました' });
      setNewDeviceName('');
      await loadPasskeys();
    } catch (error: any) {
      console.error('Failed to register passkey:', error);
      setMessage({ type: 'error', text: 'パスキーの登録に失敗しました' });
    } finally {
      setRegisteringPasskey(false);
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!confirm('このパスキーを削除しますか？')) return;

    setMessage(null);

    try {
      await PasskeyService.deletePasskey(passkeyId);
      setMessage({ type: 'success', text: 'パスキーを削除しました' });
      await loadPasskeys();
    } catch (error: any) {
      console.error('Failed to delete passkey:', error);
      setMessage({ type: 'error', text: 'パスキーの削除に失敗しました' });
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

          <button
            onClick={() => {
              setActiveTab('mfa');
              setMessage(null);
            }}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'mfa'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>二段階認証</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('passkey');
              setMessage(null);
            }}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'passkey'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>パスキー</span>
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

        {activeTab === 'mfa' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">二段階認証について</h4>
                  <p className="text-sm text-blue-800">
                    二段階認証を有効にすると、ログイン時にパスワードに加えてSMSまたはパスキーによる認証が必要になります。
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">SMS認証設定</h3>
              <p className="text-sm text-gray-600 mb-4">
                SMS認証を使用するには、まず電話番号を認証してください。
              </p>

              {!mfaSettings?.phone_verified && (
                <div className="space-y-4">
                  {profile?.phone_number ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        電話番号: <span className="font-medium">{profile.phone_number}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        基本情報タブで電話番号を変更できます
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        電話番号が設定されていません。基本情報タブで電話番号を設定してください。
                      </p>
                    </div>
                  )}

                  {profile?.phone_number && !codeSent && (
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={sendingCode}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{sendingCode ? '送信中...' : '認証コードを送信'}</span>
                    </button>
                  )}

                  {codeSent && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          認証コード（6桁）
                        </label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleVerifyCode}
                          disabled={verifyingCode || verificationCode.length !== 6}
                          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {verifyingCode ? '認証中...' : '認証する'}
                        </button>
                        <button
                          onClick={() => {
                            setCodeSent(false);
                            setVerificationCode('');
                          }}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mfaSettings?.phone_verified && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    電話番号の認証が完了しています
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">二段階認証を有効にする</h4>
                  <p className="text-xs text-gray-600">
                    {mfaSettings?.phone_verified
                      ? '電話番号の認証またはパスキーの登録が必要です'
                      : '有効にするには電話番号を認証してください'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mfaSettings?.mfa_enabled || false}
                    onChange={handleToggleMFA}
                    disabled={!mfaSettings?.phone_verified || saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'passkey' && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-green-900 mb-1">パスキーについて</h4>
                  <p className="text-sm text-green-800">
                    パスキーは生体認証やPINを使用した安全な認証方法です。パスワードより安全で使いやすい認証を提供します。
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">新しいパスキーを登録</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="デバイス名（例: iPhone、MacBook）"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleRegisterPasskey}
                  disabled={registeringPasskey || !newDeviceName.trim()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>{registeringPasskey ? '登録中...' : '登録'}</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">登録済みパスキー</h3>
              {passkeys.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">登録されたパスキーはありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {passkeys.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{passkey.device_name}</h4>
                          <p className="text-xs text-gray-500">
                            登録日: {new Date(passkey.created_at).toLocaleDateString('ja-JP')}
                          </p>
                          <p className="text-xs text-gray-500">
                            最終使用: {new Date(passkey.last_used_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePasskey(passkey.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
