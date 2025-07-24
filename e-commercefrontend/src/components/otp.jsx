import axios from 'axios';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from '../assets/images/logo1.png';

const OtpVerification = () => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      toast.error('Please enter all 6 digits of OTP');
      return;
    }

    if (!userId) {
      toast.error('User ID missing. Please restart signup.');
      return;
    }

    try {
      const response = await axios.post('https://localhost:3000/api/users/verify-otp', {
        userId,
        otp: enteredOtp,
      });

      toast.success(response.data.message || 'OTP verified!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <ToastContainer />
      <div className="bg-[#FFFBF7] rounded-xl shadow-2xl px-10 py-14 w-full max-w-xl text-center space-y-8 border border-[#FFFBF7]">
        
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="Anka Attire Logo" className="h-28 w-28 rounded-full object-cover" />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-semibold text-[#7B5E38]">Enter Your OTP</h2>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3">
          {otp.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={value}
              onChange={(e) => handleChange(e, index)}
              className="w-12 h-12 border border-gray-400 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#540b0e] bg-white"
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-10 py-2 bg-[#540b0e] text-white font-semibold rounded-md hover:bg-[#A47E50] transition duration-200"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
