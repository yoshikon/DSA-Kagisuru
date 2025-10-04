import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/header';
import { NewDashboardHome } from '../components/dashboard/new-dashboard-home';
import { FileLockPage } from '../components/dashboard/file-lock-page';
import { FileUnlockPage } from '../components/dashboard/file-unlock-page';
import { AddressBookPage } from '../components/dashboard/address-book-page';
import { PasswordSettingsPage } from '../components/dashboard/password-settings-page';
import { AccountInfoPage } from '../components/dashboard/account-info-page';
import { ProfileEditPage } from '../components/dashboard/profile-edit-page';
import { AuthTestPage } from '../components/dashboard/auth-test-page';
import { useAuth } from '../contexts/auth-context';
import {
  LayoutDashboard,
  Lock,
  Unlock,
  BookOpen,
  Key,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  X,
  TestTube
} from 'lucide-react';

type ViewType = 'home' | 'lock' | 'unlock' | 'addressbook' | 'password' | 'account' | 'profile-edit' | 'auth-test';

export function DashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      navigate('/');
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'ホーム',
      view: 'home' as ViewType,
    },
    {
      icon: Lock,
      label: 'ファイル施錠',
      view: 'lock' as ViewType,
    },
    {
      icon: Unlock,
      label: 'ファイル解錠',
      view: 'unlock' as ViewType,
    },
    {
      icon: BookOpen,
      label: 'アドレス帳',
      view: 'addressbook' as ViewType,
    },
    {
      icon: Key,
      label: 'パスワード設定',
      view: 'password' as ViewType,
    },
    {
      icon: TestTube,
      label: '認証方法テスト',
      view: 'auth-test' as ViewType,
    },
    {
      icon: UserIcon,
      label: 'アカウント情報',
      view: 'account' as ViewType,
    },
    {
      icon: Settings,
      label: 'プロフィール設定',
      view: 'profile-edit' as ViewType,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPath="/dashboard" />

      <div className="flex">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b lg:hidden">
            <h2 className="text-lg font-bold text-gray-900">メニュー</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1 mt-4">
            {menuItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentView === item.view
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span>ログアウト</span>
            </button>
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 p-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mb-4 p-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Menu className="w-5 h-5" />
          </button>

          {currentView === 'home' && <NewDashboardHome />}
          {currentView === 'lock' && <FileLockPage />}
          {currentView === 'unlock' && <FileUnlockPage />}
          {currentView === 'addressbook' && <AddressBookPage />}
          {currentView === 'password' && <PasswordSettingsPage />}
          {currentView === 'auth-test' && <AuthTestPage />}
          {currentView === 'account' && (
            <AccountInfoPage onEditClick={() => setCurrentView('profile-edit')} />
          )}
          {currentView === 'profile-edit' && <ProfileEditPage />}
        </main>
      </div>
    </div>
  );
}
