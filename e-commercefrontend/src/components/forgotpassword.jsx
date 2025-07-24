import axios from 'axios';
import { useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/images/logo1.png';

const BASE_URL = 'https://localhost:3000';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const inputRefs = useRef([]);

  const handleSendOTP = async () => {
    if (!email) return toast.error('Please enter your email');
    try {
      const res = await axios.post(`${BASE_URL}/api/users/forgot-password/send-otp`, { email });
      setUserId(res.data.userId);
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleOTPChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    else if (!value && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) return toast.error('Enter all 6 digits');
    try {
      await axios.post(`${BASE_URL}/api/users/forgot-password/verify-otp`, {
        userId,
        otp: enteredOtp
      });
      toast.success('OTP verified');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');
    try {
      await axios.post(`${BASE_URL}/api/users/forgot-password/reset`, {
        userId,
        newPassword
      });
      toast.success('Password reset successful');
      setTimeout(() => window.location.href = '/login', 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <ToastContainer />
      <div className="bg-[#FFFBF7] rounded-xl shadow-2xl px-10 py-14 w-full max-w-xl text-center space-y-8 border border-[#FFFBF7]">
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="h-28 w-28 rounded-full object-cover" />
        </div>

        {step === 1 && (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#7B5E38]">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="px-10 py-2 bg-[#540b0e] text-white font-semibold rounded-md hover:bg-[#A47E50]"
              onClick={handleSendOTP}
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#7B5E38]">Enter OTP</h2>
            <div className="flex justify-center gap-3">
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength="1"
                  value={val}
                  onChange={(e) => handleOTPChange(e, idx)}
                  className="w-12 h-12 border border-gray-400 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#540b0e]"
                />
              ))}
            </div>
            <button
              className="px-10 py-2 bg-[#540b0e] text-white font-semibold rounded-md hover:bg-[#A47E50]"
              onClick={handleVerifyOTP}
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#7B5E38]">Reset Password</h2>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="px-10 py-2 bg-[#540b0e] text-white font-semibold rounded-md hover:bg-[#A47E50]"
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
