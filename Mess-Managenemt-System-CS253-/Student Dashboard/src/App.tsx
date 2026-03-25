import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/app/components/LoginForm';
import StudentDashboard from '@/app/pages/StudentDashboard';
import ManagerDashboard from '@/app/pages/MessManagerDashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}