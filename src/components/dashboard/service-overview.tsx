import React from 'react';
import { Lock, Unlock, BookOpen, Download, Shield, ArrowRight } from 'lucide-react';

interface ServiceOverviewProps {
  onNavigate?: (page: string) => void;
}

export function ServiceOverview({ onNavigate }: ServiceOverviewProps) {
  const services = [
    {
      id: 'lock',
      title: '施錠',
      description: '相手だけが開けるようにファイルを施錠できます。\n契約書・設計図・見積書を安全に送信',
      features: ['E2E暗号化', 'パスワード共有不要'],
      buttonText: 'いますぐ施錠する',
      icon: Lock,
      color: 'blue'
    },
    {
      id: 'unlock',
      title: '解錠',
      description: '相手から受け取った施錠済みファイルを解錠できます。',
      features: [],
      buttonText: 'ファイルを解錠',
      icon: Unlock,
      color: 'green'
    },
    {
      id: 'addressbook',
      title: 'アドレス帳',
      description: '相手がファイルを解錠したか、確認できます。',
      features: [],
      buttonText: '',
      icon: BookOpen,
      color: 'purple'
    },
    {
      id: 'passwordless',
      title: 'ファイルをパスワードレスで受け取る',
      description: 'メールの署名にあなた専用のリンクを追加することで、パスワードなしでファイルを安全に受け取ることができます。',
      features: [],
      buttonText: 'いますぐ専用リンクを取得',
      icon: Download,
      color: 'orange'
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    switch (serviceId) {
      case 'lock':
        // 親コンポーネントに施錠ページへの遷移を通知
        if (onNavigate) {
          onNavigate('lock');
        }
        break;
      case 'unlock':
        // 親コンポーネントに解錠ページへの遷移を通知
        if (onNavigate) {
          onNavigate('unlock');
        }
        break;
      case 'addressbook':
        // 親コンポーネントにアドレス帳ページへの遷移を通知
        if (onNavigate) {
          onNavigate('addressbook');
        }
        break;
      case 'passwordless':
        // パスワードレス受信設定ページに移動
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">サービス</h1>
        <p className="text-lg text-gray-600 mb-2">個人利用は無料です</p>
        <div className="max-w-2xl mx-auto text-gray-600">
          <p>相手のメールアドレスさえ知っていれば、ファイルを強固に施錠できます。</p>
          <p>施錠したファイルはそのままメールに添付でき、面倒なパスワード共有は不要です。</p>
        </div>
      </div>

      {/* サービスカード */}
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => {
          const IconComponent = service.icon;
          const colorClasses = {
            blue: 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25',
            green: 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/25',
            purple: 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/25',
            orange: 'bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-500/25'
          };

          return (
            <div key={service.id} className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 space-y-6 shadow-2xl border border-slate-700 hover:shadow-3xl hover:transform hover:scale-105 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl shadow-lg">
                  <IconComponent className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold">{service.title}</h3>
              </div>

              <div className="space-y-3">
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {service.description}
                </p>

                {service.features.length > 0 && (
                  <div className="flex items-center space-x-4 text-sm mt-4">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {service.buttonText && (
                <button
                  onClick={() => handleServiceClick(service.id)}
                  className={`inline-flex items-center space-x-2 px-6 py-3 ${colorClasses[service.color]} text-white rounded-xl font-semibold transition-all duration-300 hover:transform hover:scale-105 shadow-lg`}
                >
                  <span>{service.buttonText}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 追加情報 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-3 text-lg">セキュリティについて</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• すべてのファイルはAES-256暗号化で保護されます</li>
              <li>• パスワードの共有は不要で、受信者認証により安全性を確保</li>
              <li>• ファイルは指定期限後に自動削除されます</li>
              <li>• 送り間違えても指定された受信者以外はアクセスできません</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}