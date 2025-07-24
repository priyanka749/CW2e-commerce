import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save token to localStorage
      localStorage.setItem('adminToken', data.token);

      // Redirect to admin dashboard
      navigate('/admin/dashboard');

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7ede2] via-white to-[#EBDECD]/90 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-12 max-w-2xl w-[500px] min-h-[650px] flex flex-col items-center border border-[#e2c799]">
        <img
          src={logo}
          alt="Anka Attire Logo"
          className="w-28 h-28 mx-auto mb-8 rounded-full shadow-lg bg-white object-contain"
        />
        <h2 className="text-2xl text-[#8B6B3E] mb-2 font-bold tracking-wide">
          Admin Login
        </h2>

        {error && (
          <div className="w-full mb-4 text-sm text-red-600 bg-red-100 border border-red-300 px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-left text-[#8B6B3E] font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              className="w-full px-5 py-3 rounded-lg border border-[#e2c799] focus:outline-none focus:ring-2 focus:ring-[#8B6B3E] bg-[#fdf6ee] text-[#6C5C4C] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password" className="text-left text-[#8B6B3E] font-medium">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full px-5 py-3 rounded-lg border border-[#e2c799] focus:outline-none focus:ring-2 focus:ring-[#8B6B3E] bg-[#fdf6ee] text-[#6C5C4C] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute top-9 right-4 text-[#8B6B3E] hover:text-[#6C5C4C] transition"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#8B6B3E] text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-[#7a5f2d] transition"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-xs text-[#bfa77a]">
          &copy; {new Date().getFullYear()} Anka Attire. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
