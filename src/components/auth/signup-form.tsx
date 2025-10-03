import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface SignUpFormProps {
  onSuccess?: () => void;
}

export const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password: string): { score: number; message: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) return { score, message: '弱い' };
    if (score < 5) return { score, message: '中程度' };
    return { score, message: '強い' };
  };

  const passwordStrength = password ? checkPasswordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName || !email || !password || !confirmPassword) {
      setError('すべてのフィールドを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上である必要があります');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (passwordStrength && passwordStrength.score < 3) {
      setError('より強力なパスワードを設定してください');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, {
        display_name: displayName,
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      setError('登録に失敗しました。もう一度お試しください。');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">登録完了</h2>
            <p className="text-gray-600">
              アカウントの作成が完了しました。
              <br />
              ダッシュボードにリダイレクトしています...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">新規登録</h2>
          <p className="text-gray-600 mt-2">アカウントを作成してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="山田 太郎"
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            {password && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">パスワード強度:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score < 3
                        ? 'text-red-600'
                        : passwordStrength.score < 5
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength.score < 3
                        ? 'bg-red-500'
                        : passwordStrength.score < 5
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード（確認）
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">パスワードが一致しません</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                登録中...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                新規登録
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            既にアカウントをお持ちの場合は{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
