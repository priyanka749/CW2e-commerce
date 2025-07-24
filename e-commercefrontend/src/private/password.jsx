import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:3000";

const PasswordChange = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const navigate = useNavigate();

  const handlePasswordInput = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPwError('');
    setPwSuccess('');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (newPassword !== confirmPassword) {
      setPwError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password update failed');
      setPwSuccess('Password updated successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setPwError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf6ee]">
      <div className="w-full max-w-md mx-auto bg-[#fff7ec] p-8 rounded-3xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-[#540b0e] text-center">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordInput}
              className="w-full px-4 py-2 bg-[#f7ede2] border border-[#e2c799] rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordInput}
              className="w-full px-4 py-2 bg-[#f7ede2] border border-[#e2c799] rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordInput}
              className="w-full px-4 py-2 bg-[#f7ede2] border border-[#e2c799] rounded-md"
              required
            />
          </div>
          {pwError && <p className="text-sm text-red-600 mt-2">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600 mt-2">{pwSuccess}</p>}
          <button
            type="submit"
            className="w-full mt-4 bg-[#540b0e] text-white py-2 px-6 rounded-full hover:bg-[#B0895E]"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange; 