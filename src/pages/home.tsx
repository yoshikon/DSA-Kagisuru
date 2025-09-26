import React from 'react';
import { Shield, Lock, Zap, Users, ArrowRight } from 'lucide-react';

export function HomePage() {
  const features = [
    {
      icon: Lock,
      title: 'AES-256暗号化',
      description: 'クライアントサイドで軍用レベルの暗号化を実行。サーバーには暗号化されたデータのみ保存。'
    },
    {
      icon: Shield,
      title: 'パスワード不要',
      description: 'WebAuthn（パスキー）認証で、パスワード管理の煩わしさを解消。'
    },
    {
      icon: Zap,
      title: '3クリック共有',
      description: 'ファイル選択 → 受信者指定 → 送信の簡単3ステップ。'
    },
    {
      icon: Users,
      title: '複数受信者対応',
      description: '最大5名まで同時に安全なファイル共有が可能。'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'ファイル選択',
      description: 'ドラッグ&ドロップまたはクリックでファイルを選択'
    },
    {
      step: '02', 
      title: '受信者指定',
      description: 'メールアドレスを入力して受信者を指定'
    },
    {
      step: '03',
      title: '暗号化送信',
      description: 'AES-256で暗号化して安全に送信'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">カギスル</h1>
                <p className="text-xs text-gray-500">Secure File Sharing</p>
              </div>
            </div>
            
            <nav className="flex space-x-8">
              <a href="/encrypt" className="text-blue-600 hover:text-blue-700 font-medium">
                ファイル暗号化
              </a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-700">
                ダッシュボード
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-full">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              3クリックで
              <br />
              <span className="text-blue-600">セキュアな</span>
              <br />
              ファイル共有
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              パスワード管理不要。AES-256暗号化によるセキュアなファイル共有サービス。
              WebAuthn認証で、受信者は簡単・安全にファイルにアクセスできます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/encrypt'}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 space-x-2"
              >
                <Lock className="h-6 w-6" />
                <span>今すぐ始める</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg border border-blue-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
                デモを見る
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              なぜカギスルなのか？
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              従来のPPAP（パスワード付きZIP）の問題を解決する、次世代のセキュアファイル共有
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              簡単3ステップ
            </h2>
            <p className="text-lg text-gray-600">
              誰でも簡単にセキュアなファイル共有ができます
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '/encrypt'}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors space-x-2"
            >
              <Shield className="h-6 w-6" />
              <span>今すぐファイルを暗号化</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            今すぐセキュアなファイル共有を始めましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            無料で利用開始。アカウント登録不要で即座に暗号化ファイル共有が可能です。
          </p>
          <button
            onClick={() => window.location.href = '/encrypt'}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors space-x-2"
          >
            <Lock className="h-6 w-6" />
            <span>無料で始める</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">カギスル</h3>
                <p className="text-xs text-gray-400">Secure File Sharing</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>© 2024 カギスル. AES-256暗号化によるセキュアファイル共有</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}