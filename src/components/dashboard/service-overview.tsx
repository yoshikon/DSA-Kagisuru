import React from 'react';
import { Lock, Unlock, BookOpen, Download, Shield, ArrowRight } from 'lucide-react';

export function ServiceOverview() {
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
        window.location.href = '/encrypt';
        break;
      case 'unlock':
        // ファイル解錠ページに移動
        break;
      case 'addressbook':
        // アドレス帳ページに移動
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
            blue: 'bg-blue-600 hover:bg-blue-700',
            green: 'bg-green-600 hover:bg-green-700',
            purple: 'bg-purple-600 hover:bg-purple-700',
            orange: 'bg-orange-600 hover:bg-orange-700'
          };

          return (
            <div key={service.id} className="bg-gray-800 text-white rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
              </div>

              <div className="space-y-3">
                <p className="text-gray-300 whitespace-pre-line">
                  {service.description}
                </p>

                {service.features.length > 0 && (
                  <div className="flex items-center space-x-4 text-sm">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {service.buttonText && (
                <button
                  onClick={() => handleServiceClick(service.id)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 ${colorClasses[service.color]} text-white rounded-lg font-medium transition-colors`}
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">セキュリティについて</h4>
            <ul className="text-sm text-blue-800 space-y-1">
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