import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { ProfileService, UserProfile } from '../../lib/profile-service';
import { User, Mail, Phone, FileText, Save, Loader } from 'lucide-react';

export const ProfileEditPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    display_name: '',
    phone_number: '',
    bio: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await ProfileService.getProfile(user.id);
      setProfile(userProfile);
      setFormData({
        display_name: userProfile?.display_name || '',
        phone_number: userProfile?.phone_number || '',
        bio: userProfile?.bio || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await ProfileService.updateProfile(user.id, formData);
      await loadProfile();
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">プロフィール編集</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* メールアドレス（読み取り専用） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                メールアドレス
              </div>
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">メールアドレスは変更できません</p>
          </div>

          {/* 表示名 */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                表示名
              </div>
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="山田 太郎"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                電話番号
              </div>
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="090-1234-5678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 自己紹介 */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                自己紹介
              </div>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="自己紹介を入力してください"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  display_name: profile?.display_name || '',
                  phone_number: profile?.phone_number || '',
                  bio: profile?.bio || '',
                });
                setMessage(null);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              リセット
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  保存
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* アカウント情報 */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">アカウント情報</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">ユーザーID</span>
            <span className="text-gray-900 font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">登録日</span>
            <span className="text-gray-900">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleString('ja-JP')
                : '-'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">最終更新日</span>
            <span className="text-gray-900">
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleString('ja-JP')
                : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
