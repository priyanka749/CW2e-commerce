// User logout function
async function handleUserLogout(navigate) {
  await fetch('https://localhost:3000/api/users/logout', {
    method: 'POST',
    credentials: 'include',
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  navigate('/login');
}
import { useEffect, useState } from 'react';
import {
  FaBoxOpen,
  FaSignOutAlt,
  FaUserCircle,
  FaUserEdit
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import Navbar from '../components/nav';

const BASE_URL = "https://localhost:3000";

const navItems = [
  { label: 'Account Details', icon: <FaUserCircle /> },
  { label: 'My Orders', icon: <FaBoxOpen /> },
  { label: 'Change Password', icon: <FaUserEdit /> },
  { label: 'Active Sessions', icon: <FaBoxOpen /> },
  { label: 'Log Out', icon: <FaSignOutAlt /> },
];

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [active, setActive] = useState('Account Details');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [logoutAllSuccess, setLogoutAllSuccess] = useState('');
  useEffect(() => {
    if (active === 'Active Sessions') {
      setSessionsLoading(true);
      setSessionsError('');
      setLogoutAllSuccess('');
      // Always call /api/users/sessions, never append any id
      fetch(`${BASE_URL}/api/users/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })
        .then(async (res) => {
          // If response is not JSON, show error
          let data;
          try {
            data = await res.json();
          } catch {
            setSessions([]);
            setSessionsError('Failed to fetch sessions');
            setSessionsLoading(false);
            return;
          }
          if (Array.isArray(data)) {
            setSessions(data);
          } else {
            setSessions([]);
            setSessionsError(data.message || 'Failed to fetch sessions');
          }
          setSessionsLoading(false);
        })
        .catch(() => {
          setSessions([]);
          setSessionsError('Failed to fetch sessions');
          setSessionsLoading(false);
        });
    }
  }, [active]);

  const handleLogoutAllDevices = async () => {
    setSessionsLoading(true);
    setLogoutAllSuccess('');
    setSessionsError('');
    try {
      const res = await fetch(`${BASE_URL}/api/users/logout-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setLogoutAllSuccess(data.message || 'Logged out from all devices');
        setSessions([]);
      } else {
        setSessionsError(data.message || 'Failed to logout from all devices');
      }
    } catch (err) {
      setSessionsError('Failed to logout from all devices');
    }
    setSessionsLoading(false);
  };
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [newPwFieldError, setNewPwFieldError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setError('No user session found. Please log in again.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      setLoading(false);
      return;
    }
    fetch(`${BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.message && (data.fullName || data.name || data.email)) {
          setProfile(data);
          setForm(data);
          setImagePreview(data.image ? `${BASE_URL}${data.image}` : '');
        } else {
          // Fallback to localStorage user info if API fails or returns empty
          const localUser = JSON.parse(user);
          if (localUser && (localUser.fullName || localUser.name || localUser.email)) {
            setProfile(localUser);
            setForm(localUser);
            setImagePreview(localUser.image ? `${BASE_URL}${localUser.image}` : '');
          } else {
            setError('Failed to load profile. Please log out and log in again.');
          }
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to localStorage user info if API fails
        const localUser = JSON.parse(user);
        if (localUser && (localUser.fullName || localUser.name || localUser.email)) {
          setProfile(localUser);
          setForm(localUser);
          setImagePreview(localUser.image ? `${BASE_URL}${localUser.image}` : '');
        } else {
          setError('Failed to fetch user. Please log out and log in again.');
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
  if (active === 'My Orders') {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) {
      fetch(`https://localhost:3000/api/payments/orders/${user._id}`)
        .then((res) => res.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
    }
  }
}, [active]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setForm({ ...form, image: file });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (form.fullName) formData.append('fullName', form.fullName);
    if (form.name) formData.append('name', form.name);
    if (form.email) formData.append('email', form.email);
    if (form.phone) formData.append('phone', form.phone);
    if (form.address) formData.append('address', form.address);
       if (form.lat) formData.append('lat', form.lat);
    if (form.lon) formData.append('lon', form.lon);
    if (form.location) formData.append('location', form.location);

    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    try {
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setProfile(data);
      setForm(data);
      setImagePreview(data.image ? `${BASE_URL}${data.image}` : '');
      localStorage.setItem('user', JSON.stringify(data));
      setEdit(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    setPwError('');
    setPwSuccess('');
    // Inline error for new password field
    if (name === 'newPassword' && value === passwords.currentPassword) {
      setNewPwFieldError('New password cannot be the same as current password. Please choose a different password.');
    } else {
      setNewPwFieldError('');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (newPassword === currentPassword) {
      setNewPwFieldError('New password cannot be the same as current password. Please choose a different password.');
      return;
    }
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
      if (!res.ok) {
        // Show specific backend error messages for password expiration/reuse
        if (data.message) {
          setPwError(data.message);
        } else {
          setPwError('Password update failed');
        }
        return;
      }
      setPwSuccess(data.message || 'Password updated successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPwError(err.message || 'Password update failed');
    }
  };

  const handleLogout = () => {
    handleUserLogout(navigate);
  };

  const getInitialName = (name) => {
    return (name || '').split(' ')[0];
  };

  const displayImage = imagePreview || '/default-profile.png';

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf6ee] text-[#3F2E1D]">
      <Navbar />

      {/* Add padding to push content down */}
      <main className="flex-1 flex items-start justify-center pt-[80px] pb-[50px] px-4">
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row bg-white/95 rounded-3xl shadow-2xl border border-[#540b0e] overflow-hidden min-h-[650px]">
          {/* Sidebar */}
          <aside className="w-full md:w-1/4 bg-gradient-to-b from-[#f7ede2] to-[#e2c799]/40 flex flex-col items-center py-12 px-2 border-r border-[#540b0e]">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-[#540b0e] flex items-center justify-center shadow-lg border-4 border-[#e2c799]">
                <img
                  src={displayImage}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white"
                />
              </div>
              <h2 className="text-xl font-bold text-[#540b0e] mt-4">{profile.fullName || profile.name}</h2>
            </div>
            <nav className="w-full flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.label === 'Log Out' ? handleLogout : () => setActive(item.label)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-lg transition w-full text-left ${
                    item.label === 'Log Out'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : active === item.label
                      ? 'bg-[#540b0e] text-white shadow-lg scale-105'
                      : 'bg-white text-[#540b0e] hover:bg-[#e2c799]/60 hover:text-[#a88b5c]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Profile Info */}
          <section className="w-full md:w-3/4 flex items-center justify-center p-7 bg-white">
  {loading ? (
    <p className="text-lg font-semibold text-[#540b0e]">Loading...</p>
  ) : error ? (
    <p className="text-lg font-semibold text-red-500">{error}</p>
  ) : active === 'My Orders' ? (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-[#540b0e]">Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
          {orders.map((order) => (
            <div key={order._id} className="border border-[#e2c799] p-4 rounded-2xl shadow bg-white">
              <p className="text-[#6B4E2F]">
                <strong>Order ID:</strong> {order._id}
              </p>
              <p className="text-[#6B4E2F]">
                <strong>Status:</strong> {order.orderStatus}
              </p>
              <p className="text-[#6B4E2F]">
                <strong>Payment:</strong> {order.paymentStatus} via {order.paymentMethod}
              </p>
              <p className="text-[#6B4E2F]">
                <strong>Total:</strong> Rs. {order.totalAmount}
              </p>
              <p className="text-[#6B4E2F]">
                <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.products?.length > 0 && (
                <div className="mt-2 space-y-2">
                  {order.products.map((p, index) => (
                    <div key={index} className="text-sm text-gray-700 pl-2 border-l border-[#540b0e]">
                      - {p?.productId?.name || 'Product'} (Size: {p?.size}, Qty: {p?.quantity})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  ) : active === 'Change Password' ? (
    <form
      onSubmit={handlePasswordChange}
      className="w-full max-w-md mx-auto bg-[#fff7ec] p-6 rounded-3xl shadow"
    >
      <h2 className="text-xl font-bold mb-4 text-[#540b0e]">Change Password</h2>
      <div className="space-y-4">
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
      </div>
      {pwError && <p className="text-sm text-red-600 mt-2">{pwError}</p>}
      {/* Inline error for new password field */}
      {newPwFieldError && (
        <p className="text-sm text-red-600 mt-1">{newPwFieldError}</p>
      )}
      {pwSuccess && <p className="text-sm text-green-600 mt-2">{pwSuccess}</p>}
      <button
        type="submit"
        className="mt-4 bg-[#540b0e] text-white py-2 px-6 rounded-full hover:bg-[#B0895E]"
      >
        Update Password
      </button>
    </form>
  ) : active === 'Active Sessions' ? (
    <div className="w-full max-w-lg mx-auto bg-[#fff7ec] p-6 rounded-3xl shadow">
      <h2 className="text-xl font-bold mb-4 text-[#540b0e]">Active Sessions / Devices</h2>
      {sessionsLoading ? (
        <p className="text-lg text-[#540b0e]">Loading sessions...</p>
      ) : sessionsError ? (
        <p className="text-red-600">{sessionsError}</p>
      ) : (
        <>
          {sessions.length === 0 ? (
            <p className="text-gray-600">No active sessions found.</p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {sessions.map((session) => (
                <div key={session._id} className="border border-[#e2c799] p-3 rounded-xl shadow bg-white">
                  <p className="text-[#6B4E2F] text-sm">
                    <strong>Device:</strong> {session.userAgent || 'Unknown'}
                  </p>
                  <p className="text-[#6B4E2F] text-sm">
                    <strong>IP:</strong> {session.ip || 'N/A'}
                  </p>
                  <p className="text-[#6B4E2F] text-sm">
                    <strong>Last Active:</strong> {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handleLogoutAllDevices}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold shadow"
            disabled={sessionsLoading}
          >
            Logout from All Devices
          </button>
          {logoutAllSuccess && <p className="text-green-600 mt-3">{logoutAllSuccess}</p>}
        </>
      )}
    </div>
  ) : !edit ? (
    <div className="w-full max-3w-md mx-auto bg-[#fff7ec] p-8 rounded-3xl shadow-lg text-center flex flex-col items-center justify-center">
      <div className="relative -mt-20">
        <img
          src={displayImage}
          alt="Profile"
          className="w-50 h-50 mx-auto rounded-full border-4 border-[#fcd34d] object-cover shadow"
        />
      </div>
      <h2 className="text-2xl font-bold text-[#3F2E1D] mt-4">{profile.fullName || profile.name}</h2>
      <div className="mt-6 text-left space-y-3 text-[#6B4E2F] text-sm">
        <div className="flex items-center gap-2">
          <span>📧</span> <span>{profile.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📞</span> <span>{profile.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span> <span>{profile.address || profile.location}</span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setEdit(true)}
          className="mt-5 px-6 py-3 bg-[#540b0e] text-white rounded-full flex items-center gap-2 hover:bg-[#B0895E]"
        >
          <FaUserEdit /> Edit Profile
        </button>
      </div>
    </div>
  ) : (
    <form onSubmit={handleSave} className="w-full flex flex-col md:flex-row gap-10">
      <div className="flex-1">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <img
              src={displayImage}
              alt="Preview"
              className="w-28 h-28 rounded-full object-cover border-4 border-[#e2c799] shadow bg-white"
            />
            <label className="absolute bottom-0 right-0 bg-[#540b0e] text-white px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-90 transition">
              Change
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Full Name</label>
            <input
              type="text"
              name={form.fullName ? 'fullName' : 'name'}
              value={form.fullName || form.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f7ede2] rounded-md border border-[#e2c799] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f7ede2] rounded-md border border-[#e2c799] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f7ede2] rounded-md border border-[#e2c799] outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-gray-700">Location</label>
             <input
              type="text"
              name="address"
              value={form.address || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f7ede2] rounded-md border border-[#e2c799] outline-none"
            />

            </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Latitude</label>
            <input
              type="text"
              name="lat"
              value={form.lat || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f7ede2] rounded-md border border-[#e2c799] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Longitude</label>
            <input
              type="text"
              name="lon"
              value={form.lon || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f7ede2] rounded-md border border-[#e2c799] outline-none"
            />
          
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center gap-4 mt-8 md:mt-0">
        <button
          type="submit"
          className="bg-[#540b0e] hover:bg-[#B0895E] text-white px-8 py-3 rounded-full font-semibold shadow-md text-lg"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(profile);
            setImagePreview(profile.image ? `${BASE_URL}${profile.image}` : '');
            setEdit(false);
          }}
          className="bg-[#F3BD18] hover:bg-[#e4a400] text-white px-8 py-3 rounded-full font-semibold shadow-md text-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</section>
        </div>
      </main>

      {/* Spacer before footer */}
      <div className="h-12" />
      <Footer />
    </div>
  );
};

export default Profile;
