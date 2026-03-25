import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/app/components/LoginForm';
import StudentDashboard from '@/app/pages/StudentDashboard';
import ManagerDashboard from '@/app/pages/MessManagerDashboard'; // Matches your screenshot file name
import { JSX } from 'react';

const getStoredRole = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('role');
};

function getRoleFromToken(): string | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch {
    return null;
  }
}

function RequireManager({ children }: { children: JSX.Element }) {
  const role = getStoredRole() || getRoleFromToken();
  if (role !== 'manager') {
    console.warn('RequireManager: role check failed', { role });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-3">Manager Access Required</h2>
        <p className="mb-3">This route requires manager access. Current role: <strong>{role || 'none'}</strong>.</p>
        <a href="/" className="px-4 py-2 bg-black text-white rounded">Go to Login</a>
      </div>
    );
  }
  return children;
}

function RequireStudent({ children }: { children: JSX.Element }) {
  const role = getStoredRole() || getRoleFromToken();
  if (role !== 'student') {
    console.warn('RequireStudent: role check failed', { role });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-3">Student Access Required</h2>
        <p className="mb-3">This route requires student access. Current role: <strong>{role || 'none'}</strong>.</p>
        <a href="/" className="px-4 py-2 bg-black text-white rounded">Go to Login</a>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-6">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/student-dashboard" element={<RequireStudent><StudentDashboard /></RequireStudent>} />
          <Route path="/manager-dashboard" element={<RequireManager><ManagerDashboard /></RequireManager>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}