// // User logout function
// async function handleUserLogout() {
//   await fetch('https://localhost:3000/api/users/logout', {
//     method: 'POST',
//     credentials: 'include',
//   });
//   localStorage.removeItem('token');
//   localStorage.removeItem('user');
//   localStorage.removeItem('userId');
//   window.location.href = '/login';
// }
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Axios instance with interceptor for auto-refresh and session expiration handling
// Always use withCredentials: true so cookies (refreshToken) are sent with requests
const api = axios.create({
  withCredentials: true,
});

// Example backend CORS and cookie settings (for reference):
// const cors = require('cors');
// app.use(cors({
//   origin: 'https://localhost:5173', // your frontend URL
//   credentials: true
// }));
// res.cookie('refreshToken', token, {
//   httpOnly: true,
//   secure: true, // only if using HTTPS
//   sameSite: 'none', // 'lax' for same-site, 'none' for cross-site
//   path: '/',
//   maxAge: 7 * 24 * 60 * 60 * 1000
// });

// Add Authorization header to protected requests (not login, signup, refresh, etc.)
api.interceptors.request.use(
  config => {
    // Only attach token for protected endpoints
    const unprotected = [
      '/api/auth/login',
      '/api/users/login',
      '/api/auth/admin/setup-mfa',
      '/api/users/refresh-token',
      '/api/admin/refresh-token',
      '/api/users/signup',
    ];
    const isUnprotected = unprotected.some(path => config.url && config.url.includes(path));
    if (!isUnprotected) {
      // Always get the latest token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      } else {
        delete config.headers['Authorization'];
      }
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  error => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Axios response interceptor: Handles automatic access token refresh on 401/403 errors.
// The isLoginOrRefresh variable ensures that refresh logic is only triggered for protected API calls,
// and NOT for login or refresh endpoints themselves (to avoid infinite loops).
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Only try refresh if not already retried and error is 401/403 and not a login/refresh endpoint
    const isLoginOrRefresh = originalRequest.url && (
      originalRequest.url.includes('/api/auth/login') ||
      originalRequest.url.includes('/api/users/login') ||
      originalRequest.url.includes('/api/users/refresh-token') ||
      originalRequest.url.includes('/api/admin/refresh-token')
    );
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isLoginOrRefresh) {
      console.log('[Token Refresh] Access token expired or invalid. Attempting refresh...');
      originalRequest._retry = true;
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            console.log('[Token Refresh] Request resumed with new token.');
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      isRefreshing = true;
      try {
        // Try both admin and user refresh endpoints
        let refreshRes;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.role === 'admin') {
          // Always use withCredentials: true for refresh
          console.log('[Token Refresh] Calling admin refresh endpoint...');
          refreshRes = await axios.post('https://localhost:3000/api/admin/refresh-token', {}, { withCredentials: true });
        } else {
          console.log('[Token Refresh] Calling user refresh endpoint...');
          refreshRes = await axios.post('https://localhost:3000/api/users/refresh-token', {}, { withCredentials: true });
        }
        const newToken = refreshRes.data.token;
        if (newToken) {
          console.log('[Token Refresh] New access token received and set.');
          localStorage.setItem('token', newToken);
          processQueue(null, newToken);
          // Update Authorization header for the original request and all future requests
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          return api(originalRequest);
        } else {
          // If refresh endpoint returns no token, just reject and stay on the page
          console.warn('[Token Refresh] No new token received from refresh endpoint.');
          processQueue('No token', null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        // For any refresh error, just reject and stay on the page (do not clear localStorage or show error)
        console.error('[Token Refresh] Refresh failed:', refreshErr);
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    // If not handled, just reject
    return Promise.reject(error);
  }
);

import logo from '../assets/images/logoo.png';
import signupDefault from '../assets/images/signup.png';
import signup1 from '../assets/images/signup1.png';
import signup2 from '../assets/images/signup2.jpg';

const images = [signup1, signup2, signupDefault];

// MFA modal component
const MFAModal = ({ open, onClose, onVerify, mfaCode, setMfaCode, error }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-[#540b0e]">Admin MFA Required</h2>
        <p className="mb-2 text-gray-700 text-center">Enter the 6-digit code from your Google Authenticator app.</p>
        <input
          type="text"
          maxLength={6}
          value={mfaCode}
          onChange={e => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
          className="w-full px-4 py-2 border border-[#e2c799] rounded-md text-center text-lg mb-2"
          placeholder="MFA Code"
        />
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <div className="flex gap-4 mt-2">
          <button
            onClick={onVerify}
            className="bg-[#540b0e] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#7a5f36]"
          >
            Verify
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-[#540b0e] px-6 py-2 rounded-full font-semibold hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPasswords, setShowPasswords] = useState({ password: false });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [pendingAdmin, setPendingAdmin] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(''); // QR code data URL state
  const [isInitialMFASetup, setIsInitialMFASetup] = useState(false); // Track if this is initial MFA setup

  // Fetch QR code for MFA setup only during initial setup
  useEffect(() => {
    const fetchQRCode = async () => {
      if (pendingAdmin && showMFAModal && isInitialMFASetup) {
        try {
          const res = await axios.post('https://localhost:3000/api/auth/admin/setup-mfa', {
            email: pendingAdmin.email,
          });
          setQrCodeDataUrl(res.data.qr); // Use 'qr' from backend response
        } catch (err) {
          setQrCodeDataUrl('');
        }
      }
    };
    fetchQRCode();
  }, [pendingAdmin, showMFAModal, isInitialMFASetup]);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleLogin = async () => {
    setBackendError('');
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) newErrors.email = 'Invalid email format';
    }
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    try {
      // Try admin login first (step 1: no MFA)
      let adminRes;
      try {
        adminRes = await api.post('https://localhost:3000/api/auth/login', {
          email: form.email,
          password: form.password
        });
      } catch (adminErr) {
        // If admin login fails with 400/401/403, try user login
        if (
          adminErr.response &&
          (adminErr.response.status === 400 ||
            adminErr.response.status === 401 ||
            adminErr.response.status === 403)
        ) {
          // Try user login
          try {
            const userRes = await api.post('https://localhost:3000/api/users/login', form);
            if (userRes.data.user && userRes.data.user.role === 'user') {
              localStorage.setItem('user', JSON.stringify(userRes.data.user));
              localStorage.setItem('userId', userRes.data.user._id);
              localStorage.setItem('token', userRes.data.token);
              toast.success('Login successful!');
              navigate('/home');
              return;
            } else {
              setBackendError('Invalid credentials or user role.');
              toast.error('Invalid credentials or user role.');
              return;
            }
          } catch (userErr) {
            const msg = userErr.response?.data?.message || 'Login failed';
            setBackendError(msg);
            toast.error(msg);
            return;
          }
        } else {
          // Other admin login errors
          const msg = adminErr.response?.data?.message || 'Login failed';
          setBackendError(msg);
          toast.error(msg);
          return;
        }
      }

      // If admin login requires MFA
      if (adminRes && adminRes.data && adminRes.data.requireMFA && adminRes.data.admin && adminRes.data.admin.role === 'admin') {
        localStorage.setItem('user', JSON.stringify(adminRes.data.admin));
        localStorage.setItem('userId', adminRes.data.admin._id);
        // Do NOT save token yet, wait for MFA
        const mfaSetupKey = `mfa_setup_${adminRes.data.admin._id}`;
        const hasMFASetup = localStorage.getItem(mfaSetupKey) === 'true';
        setPendingAdmin({ email: form.email, userId: adminRes.data.admin._id });
        setIsInitialMFASetup(!hasMFASetup);
        setShowMFAModal(true);
        if (hasMFASetup) {
          toast.success('Password verified! Enter your MFA code.');
        } else {
          toast.success('Password verified! Set up MFA by scanning the QR code, then enter the code.');
        }
        return;
      }
      // If admin login returns token directly (MFA already done)
      if (adminRes && adminRes.data && adminRes.data.token && adminRes.data.admin && adminRes.data.admin.role === 'admin') {
        localStorage.setItem('user', JSON.stringify(adminRes.data.admin));
        localStorage.setItem('userId', adminRes.data.admin._id);
        localStorage.setItem('token', adminRes.data.token);
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
        return;
      }

      // If neither, show error
      setBackendError('Invalid credentials or user role.');
      toast.error('Invalid credentials or user role.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setBackendError(msg);
      toast.error(msg);
    }
  };

  // MFA verification handler
  const handleVerifyMFA = async () => {
    setMfaError('');
    
    if (!mfaCode || mfaCode.length !== 6) {
      setMfaError('Please enter a valid 6-digit code.');
      return;
    }
    try {
      // Only for admin MFA verification (step 2)
      const res = await api.post('https://localhost:3000/api/auth/login', {
        email: form.email,
        password: form.password,
        mfaCode: mfaCode,
      });
      if (res.data.token && res.data.admin && res.data.admin.role === 'admin') {
        localStorage.setItem('token', res.data.token);
        toast.success('Admin login successful!');
        setShowMFAModal(false);
        setMfaCode('');
        setPendingAdmin(null);
        setIsInitialMFASetup(false);
        navigate('/admin/dashboard');
      } else {
        setMfaError(res.data.message || 'Invalid MFA code');
      }
      if (pendingAdmin && pendingAdmin.userId) {
        const mfaSetupKey = `mfa_setup_${pendingAdmin.userId}`;
        localStorage.setItem(mfaSetupKey, 'true');
      }
    } catch (err) {
      setMfaError(err.response?.data?.message || 'Invalid MFA code');
    }
  };

  return (
    <div className="bg-white flex items-center justify-center min-h-screen px-4 sm:px-10">
      <ToastContainer />
      <MFAModal
        open={showMFAModal}
        onClose={() => {
          setShowMFAModal(false);
          setMfaCode('');
          setPendingAdmin(null);
        }}
        onVerify={handleVerifyMFA}
        mfaCode={mfaCode}
        setMfaCode={setMfaCode}
        error={mfaError}
      />
      <div className="bg-[#FFF9F3] shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-[85rem] min-h-[90vh] relative">
        {/* Top Branding */}
        <div className="w-full flex items-center px-6 pt-1 md:absolute md:top-2 md:left-0 z-10">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Logo"
              className="h-14 w-14 rounded-full object-contain cursor-pointer"
              onClick={() => navigate('/home')}
            />
            <h1 className="text-xl sm:text-2xl font-semibold text-[#540b0e]"></h1>
          </div>
        </div>
        {/* Left Form Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-7 pt-35 pb-60">
          <div className="w-full max-w-xl max-h-[900px] space-y-8">
            {/* Email & Password */}
            {[
              { type: "email", placeholder: "Email", icon: "envelope", name: "email" },
              { type: "password", placeholder: "Password", icon: "lock", id: "password", name: "password" },
            ].map((field, idx) => {
              const isPassword = field.type === "password";
              return (
                <div className="relative mb-2" key={idx}>
                  <input
                    type={
                      isPassword
                        ? showPasswords[field.id] ? "text" : "password"
                        : field.type
                    }
                    placeholder={field.placeholder}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className={`w-full px-9 py-5 text-base border ${errors[field.name] ? 'border-red-500' : 'border-gray-400'} text-gray-800 bg-white rounded-full pl-12 pr-12 focus:outline-none focus:ring-2 ${errors[field.name] ? 'focus:ring-red-500' : 'focus:ring-[#540b0e]'} transition`}
                  />
                  {/* Left icon */}
                  <span className="absolute left-4 top-5 text-gray-500 text-base">
                    <i className={`fas fa-${field.icon}`}></i>
                  </span>
                  {/* Right eye toggle icon */}
                  {isPassword && (
                    <span
                      className="absolute right-4 top-5 text-gray-500 text-base cursor-pointer"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          [field.id]: !prev[field.id],
                        }))
                      }
                    >
                      <i className={`fas ${showPasswords[field.id] ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </span>
                  )}
                  {errors[field.name] && (
                    <div className="text-xs text-red-600 mt-1 ml-2">{errors[field.name]}</div>
                  )}
                  {isPassword && backendError && (
                    <div className="text-xs text-red-600 mt-1 ml-2">{backendError}</div>
                  )}
                </div>
              );
            })}

            <div
              className="text-sm text-right text-[#540b0e] font-medium hover:underline cursor-pointer"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </div>

            {/* Login Button */}
            <div className="flex justify-center ">
              <button
                onClick={handleLogin}
                className="px-16 py-2 bg-[#540b0e] text-white font-semibold text-2xl rounded-full hover:bg-[#7a5f36] transition flex items-center justify-center gap-2 shadow-lg"
              >
                Log In
              </button>
            </div>

            {/* Sign Up */}
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/signup')}
                className="font-bold text-[#540b0e] text-base sm:text-lg hover:underline cursor-pointer"
              >
                Sign Up
              </span>
            </div>
          </div>
        </div>
        {/* Right Image Section */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <div className="w-[530px] h-[600px] rounded-xl overflow-hidden shadow-lg relative top-[-28px]">
            <img
              src={images[currentImage]}
              alt="Login Visual"
              className="w-full h-full object-cover object-center transition duration-1000 ease-in-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
