import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Camera, Eye, EyeOff } from 'lucide-react';
const logo = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/IIT_Kanpur_Logo.svg/120px-IIT_Kanpur_Logo.svg.png";
const campusImage = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop";

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export function LoginForm() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'password' | 'face'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'manager'>('student');
  const [isFaceRecognizing, setIsFaceRecognizing] = useState(false);

  const handleFaceRecognition = async () => {
    setIsFaceRecognizing(true);
    setTimeout(() => {
      setIsFaceRecognizing(false);
      alert('Face recognition simulated.');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login
        const endpoint = role === 'student' ? '/api/auth/student/login' : '/api/auth/manager/login';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [role === 'student' ? 'email' : 'adminId']: email,
            password
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store token in localStorage
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data));
          localStorage.setItem('role', role);

          // Navigate to appropriate dashboard
          if (role === 'student') {
            navigate('/student-dashboard');
          } else {
            navigate('/manager-dashboard');
          }
        } else {
          alert(data.message || 'Login failed');
        }
      } else {
        // Registration
        const endpoint = role === 'student' ? '/api/auth/student/register' : '/api/auth/manager/register';
        const body = role === 'student'
          ? { rollNo: email.split('@')[0], name, email, password, roomNo: 'A-101' } // Default room
          : { adminId: email.split('@')[0], name, password, role: 'Manager' };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (data.success) {
          alert('Registration successful! Please log in.');
          setIsLogin(true);
        } else {
          alert(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IIT Kanpur Logo" className="w-12 h-12" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Mess Automation System</h1>
            <p className="text-sm text-gray-600">IIT Kanpur</p>
          </div>
        </div>
        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">Hall Logo</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="px-12 pb-12 flex flex-col">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h2>
            <p className="text-gray-600">Sign in to continue to your account</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${isLogin ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Login</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${!isLogin ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 flex-1">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="Enter your full name" required={!isLogin} />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Login ID (Institutional Email)</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="email@iitk.ac.in" required />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'student' | 'manager')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white">
                <option value="student">Student</option>
                <option value="manager">Mess Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              {isLogin && (
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setAuthMethod('password')} className={`flex-1 py-2 px-3 rounded border transition-all text-xs font-medium ${authMethod === 'password' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}><Lock className="inline-block w-3 h-3 mr-1" />Password</button>
                  <button type="button" onClick={() => setAuthMethod('face')} className={`flex-1 py-2 px-3 rounded border transition-all text-xs font-medium ${authMethod === 'face' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}><Camera className="inline-block w-3 h-3 mr-1" />Face</button>
                </div>
              )}

              {authMethod === 'password' || !isLogin ? (
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-3 border-4 border-black"><Camera className="w-10 h-10 text-black" /></div>
                  <p className="text-gray-600 mb-3 text-xs">Position your face for authentication</p>
                  <button type="button" onClick={handleFaceRecognition} disabled={isFaceRecognizing} className="px-5 py-2 bg-black text-white rounded-lg text-sm">{isFaceRecognizing ? 'Recognizing...' : 'Start'}</button>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Face Recognition Setup</label>
                <div className="border border-gray-300 rounded-lg p-5 text-center bg-gray-50">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-2 border-4 border-black"><Camera className="w-8 h-8 text-black" /></div>
                  <button type="button" onClick={handleFaceRecognition} disabled={isFaceRecognizing} className="px-5 py-2 bg-black text-white rounded-lg text-sm">{isFaceRecognizing ? 'Capturing...' : 'Capture'}</button>
                </div>
              </div>
            )}

            {isLogin && authMethod === 'password' && <div className="text-right"><button type="button" onClick={() => alert('A password reset link will be sent to your institutional email. (Backend connection pending)')} className="text-sm text-black hover:underline">Forgot Password?</button></div>}
            
            <button type="submit" className="w-full py-3 bg-black text-white rounded-lg font-medium shadow-lg">{isLogin ? 'Login to Dashboard' : 'Create Account'}</button>
          </form>
        </div>

        <div className="relative hidden md:block">
          <div className="h-full relative bg-gradient-to-br from-gray-800 to-black overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <img src={campusImage} alt="IIT Kanpur Campus" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="text-white text-2xl font-bold mb-2">IIT Kanpur</h3>
              <p className="text-white/90 text-sm">Streamline your mess management with our automated system</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}