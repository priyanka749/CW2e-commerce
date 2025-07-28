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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCsrf } from './CsrfProvider';

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

  // Use the CSRF-aware Axios instance from CsrfProvider
  const { api, csrfToken } = useCsrf();
  // Ensure CSRF token is attached to all requests (for extra safety)
  api.defaults.headers['X-CSRF-Token'] = csrfToken;
  console.log('CSRF token:', csrfToken);

  // Fetch QR code for MFA setup only during initial setup
  useEffect(() => {
    const fetchQRCode = async () => {
      if (pendingAdmin && showMFAModal && isInitialMFASetup) {
        try {
          const res = await api.post('https://localhost:3000/api/auth/admin/setup-mfa', {
            email: pendingAdmin.email,
          });
          setQrCodeDataUrl(res.data.qr); // Use 'qr' from backend response
        } catch (err) {
          setQrCodeDataUrl('');
        }
      }
    };
    fetchQRCode();
  }, [pendingAdmin, showMFAModal, isInitialMFASetup, api]);
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
      let adminErrorMsg = '';
      try {
        adminRes = await api.post('https://localhost:3000/api/auth/login', {
          email: form.email,
          password: form.password
        }, {
          headers: { 'X-CSRF-Token': csrfToken }
        });
      } catch (adminErr) {
        adminErrorMsg = adminErr.response?.data?.message || '';
        // If admin login fails with 400/401/403, try user login
        if (
          adminErr.response &&
          (adminErr.response.status === 400 ||
            adminErr.response.status === 401 ||
            adminErr.response.status === 403)
        ) {
          // Try user login
          try {
            const userRes = await api.post('https://localhost:3000/api/users/login', form, {
              headers: { 'X-CSRF-Token': csrfToken }
            });
            if (userRes.data.user && userRes.data.user.role === 'user') {
              localStorage.setItem('user', JSON.stringify(userRes.data.user));
              localStorage.setItem('userId', userRes.data.user._id);
              localStorage.setItem('token', userRes.data.token);
              toast.success('Login successful!');
              navigate('/home');
              return;
            } else {
              setBackendError(userRes.data?.message || 'Invalid credentials or user role.');
              toast.error(userRes.data?.message || 'Invalid credentials or user role.');
              return;
            }
          } catch (userErr) {
            // If both fail, show user error if present, else admin error
            const userMsg = userErr.response?.data?.message;
            const msg = userMsg || adminErrorMsg || 'Login failed';
            setBackendError(msg);
            toast.error(msg);
            return;
          }
        } else {
          // Other admin login errors
          const msg = adminErrorMsg || 'Login failed';
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
      }, {
        headers: { 'X-CSRF-Token': csrfToken }
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
