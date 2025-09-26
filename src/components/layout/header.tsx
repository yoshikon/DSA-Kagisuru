import React from 'react';
import { Shield, Lock, Menu } from 'lucide-react';

interface HeaderProps {
  currentPath?: string;
}

export function Header({ currentPath = '/' }: HeaderProps) {
  const navigation = [
    { name: 'ファイル暗号化', href: '/encrypt', current: currentPath === '/encrypt' },
    { name: 'ダッシュボード', href: '/dashboard', current: currentPath === '/dashboard' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">カギスル</h1>
                  <p className="text-xs text-gray-500">Secure File Sharing</p>
                </div>
              </div>
            </div>
          </div>

          {/* ナビゲーション */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* セキュリティインジケーター */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Shield className="h-3 w-3" />
              <span className="font-medium">AES-256暗号化</span>
            </div>
            
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* モバイルナビゲーション（簡素版） */}
      <div className="md:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`block pl-3 pr-4 py-2 text-sm font-medium transition-colors ${
                item.current
                  ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}