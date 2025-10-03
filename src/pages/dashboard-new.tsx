import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/protected-route';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { DashboardHome } from '../components/dashboard/dashboard-home';

export default function DashboardNew() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="lock" element={<div className="text-center py-12 text-gray-600">ファイルロック機能は開発中です</div>} />
          <Route path="unlock" element={<div className="text-center py-12 text-gray-600">ファイルアンロック機能は開発中です</div>} />
          <Route path="send" element={<div className="text-center py-12 text-gray-600">ファイル送信機能は開発中です</div>} />
          <Route path="contacts" element={<div className="text-center py-12 text-gray-600">アドレス帳機能は開発中です</div>} />
          <Route path="auth-test" element={<div className="text-center py-12 text-gray-600">認証テスト機能は開発中です</div>} />
          <Route path="settings" element={<div className="text-center py-12 text-gray-600">設定機能は開発中です</div>} />
          <Route path="*" element={<Navigate to="/dashboard-new" replace />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
