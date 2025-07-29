import axios from 'axios';

import { useEffect, useState } from 'react';
import { FaBoxOpen, FaClipboardList, FaMoneyCheckAlt, FaQuestionCircle, FaSignOutAlt, FaTags, FaTrash, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logoo.png';
import { useCsrf } from '../public/CsrfProvider';
import ImageUploadWithName from './add';
import AdminAddProduct from './addproduct';
import AdminSales from './addsales';
import PaymentManagement from './paymentstatment';

import DashboardCard from './DashboardCard';


const pages = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaClipboardList /> },
  { key: 'products', label: 'Product Management', icon: <FaBoxOpen /> },
  { key: 'orders', label: 'Order Management', icon: <FaClipboardList /> },
  { key: 'categories', label: 'Category Management', icon: <FaTags /> },
  { key: 'payments', label: 'Payment Statement', icon: <FaMoneyCheckAlt /> },
  { key: 'Sales', label: 'Sales Management', icon: <FaTags /> },
  { key: 'users', label: 'User Management', icon: <FaUsers /> },
  { key: 'activity', label: 'Activity Log', icon: <FaQuestionCircle /> },
  { key: 'queries', label: 'User Queries', icon: <FaQuestionCircle /> },
];

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('products');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]); // All logs
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activityLimit] = useState(20);
  // Derived: logs for current page
  const paginatedActivityLogs = activityLogs.slice((activityPage - 1) * activityLimit, activityPage * activityLimit);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Fetch all activity logs for admin (no pagination)
  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://localhost:3000/api/auth/all-activity-logs', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      console.log('Raw /all-activity-logs response:', res);
      setActivityLogs(res.data.logs);
      setActivityTotal(res.data.logs.length);
      setActivityPage(1); // Always reset to first page on fetch
    } catch (error) {
      setActivityLogs([]);
      setActivityTotal(0);
      setActivityPage(1);
      alert('Failed to fetch activity logs: ' + (error?.response?.data?.message || error.message));
      console.error('Activity log fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debug: manual fetch and log
  const debugFetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:3000/api/auth/all-activity-logs', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const text = await res.text();
      console.log('DEBUG: Raw fetch /all-activity-logs status:', res.status);
      console.log('DEBUG: Raw fetch /all-activity-logs headers:', [...res.headers]);
      console.log('DEBUG: Raw fetch /all-activity-logs body:', text);
      alert('Check console for raw /all-activity-logs fetch output. Status: ' + res.status);
    } catch (err) {
      alert('Debug fetch failed: ' + err.message);
      console.error('Debug fetch error:', err);
    }
  };

  const handleSidebarClick = (key) => {
    setActivePage(key);
    // No navigation for products or categories, render in place
  };

  // Check if server is available and token is valid
  const checkServerAndAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleServerRestart();
        return false;
      }

      // Test server connection with a simple request
      await axios.get('https://localhost:3000/api/users/all', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000, // 5 second timeout
        withCredentials: true
      });
      return true;
    } catch (error) {
      console.error('Server connection or auth failed:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' ||
        error.response?.status === 401 || error.response?.status === 403) {
        handleServerRestart();
        return false;
      }
      return true; // Other errors don't require logout
    }
  };

  // Handle server restart - logout and redirect
  const handleServerRestart = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    alert('Server connection lost. You have been logged out for security.');
    navigate('/');
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:3000/api/users/all', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' ||
        error.response?.status === 401 || error.response?.status === 403) {
        handleServerRestart();
      } else {
        alert('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://localhost:3000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert('User deleted successfully');
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' ||
          error.response?.status === 401 || error.response?.status === 403) {
          handleServerRestart();
        } else {
          alert('Failed to delete user');
        }
      }
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:3000/api/payments/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' ||
        error.response?.status === 401 || error.response?.status === 403) {
        handleServerRestart();
      } else {
        alert('Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This will restore the product stock.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://localhost:3000/api/payments/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert('Order deleted successfully and stock restored');
        fetchOrders(); // Refresh the list
      } catch (error) {
        console.error('Error deleting order:', error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' ||
          error.response?.status === 401 || error.response?.status === 403) {
          handleServerRestart();
        } else {
          alert('Failed to delete order');
        }
      }
    }
  };

  // Fetch users, orders, or activity logs when page changes
  useEffect(() => {
    if (activePage === 'users') {
      fetchUsers();
    } else if (activePage === 'orders') {
      fetchOrders();
    } else if (activePage === 'activity') {
      fetchActivityLogs();
    }
    // eslint-disable-next-line
  }, [activePage]);
          {activePage === 'activity' && (
            <div className="w-full">
              <h4 className="text-2xl font-bold mb-6 text-[#2563eb]">Activity Log</h4>
              <button onClick={debugFetchActivityLogs} className="mb-4 px-4 py-2 bg-gray-200 rounded text-xs font-semibold">Debug Raw Fetch</button>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
                  <p className="mt-2 text-[#2563eb]">Loading activity logs...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg w-full">
                  {/* Show log count and page info above the table */}
                  <div className="px-6 py-2 text-sm text-gray-500">
                    {activityLogs.length > 0
                      ? `Loaded ${activityLogs.length} logs. Page ${activityPage} of ${Math.ceil(activityTotal / activityLimit) || 1}`
                      : 'No logs loaded.'}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2563eb] text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Profile</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedActivityLogs && paginatedActivityLogs.length > 0 ? (
                          paginatedActivityLogs.map((log) => {
                            // Robust fallback logic for missing user info
                            let userName = 'System/Guest';
                            let userEmail = 'System/Guest';
                            let userRole = '';
                            let userImage = null;

                            if (log.userId && typeof log.userId === 'object') {
                              userName = log.userId.fullName?.trim() || 'Unknown User';
                              userEmail = log.userId.email?.trim() || 'Unknown Email';
                              userRole = log.userId.role?.trim() || '';
                              userImage = log.userId.image || null;
                            } else if (log.userId && typeof log.userId === 'string') {
                              // userId is just an ID string, no user info
                              userName = 'Unknown User';
                              userEmail = 'Unknown Email';
                              userRole = '';
                              userImage = null;
                            } // else: no userId, keep as System/Guest

                            // Defensive: always render a row
                            return (
                              <tr key={log._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {userImage ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                      src={`https://localhost:3000${userImage}`}
                                      alt={userName}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                                      {userName.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action || ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userRole}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {log.details || ''}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                              No activity logs found. <br />
                              {/* Example row for visual confirmation */}
                              <table className="w-full mt-4 border border-gray-200">
                                <tbody>
                                  <tr>
                                    <td className="px-6 py-2">👤</td>
                                    <td className="px-6 py-2">2025-07-29 12:00:00</td>
                                    <td className="px-6 py-2">LOGIN</td>
                                    <td className="px-6 py-2">System/Guest</td>
                                    <td className="px-6 py-2">System/Guest</td>
                                    <td className="px-6 py-2"></td>
                                    <td className="px-6 py-2">Sample log row for testing display.</td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* If logs exist but not rendering, show debug info */}
                  {activityLogs && activityLogs.length > 0 && (
                    <div className="text-xs text-gray-400 px-6 py-2">{activityLogs.length} logs loaded.</div>
                  )}
                  {/* Pagination */}
                  <div className="flex justify-between items-center px-6 py-3 bg-gray-50">
                    <span className="text-sm text-gray-700">
                      Showing page <span className="font-semibold">{activityPage}</span> of {Math.ceil(activityTotal / activityLimit) || 1}
                      {activityTotal > 0 && (
                        <> &mdash; <span className="font-semibold">{activityTotal}</span> total logs</>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                        disabled={activityPage === 1}
                        className={`px-3 py-1 rounded bg-[#2563eb] text-white font-semibold disabled:bg-gray-300 disabled:text-gray-500`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setActivityPage((p) => p + 1)}
                        disabled={activityPage >= Math.ceil(activityTotal / activityLimit)}
                        className={`px-3 py-1 rounded bg-[#2563eb] text-white font-semibold disabled:bg-gray-300 disabled:text-gray-500`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

  const { csrfToken } = useCsrf();
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:3000/api/auth/admin/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        withCredentials: true
      });
    } catch (err) {
      // Optionally handle error, but still clear localStorage and redirect
      console.error('Logout error:', err);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e3f0ff] via-[#f0f6fa] to-[#c7e0f4]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#540b0e] text-white flex flex-col py-10 px-6 shadow-2xl rounded-tr-3xl rounded-br-3xl justify-between">
        <div>
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-[#e2c799] cursor-pointer"
              onClick={() => navigate('/home')}
            >
              <img
                src={logo}
                alt="Logo"
                className="w-20 h-20 rounded-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-extrabold mb-1 tracking-wide drop-shadow text-[#540b0e]">Admin Dashboard</h2>
            <span className="text-[#e2c799] font-medium text-base">Welcome, Admin</span>
          </div>
          <nav className="flex flex-col gap-2 mt-6">
            {pages.map((page) => (
              <button
                key={page.key}
                onClick={() => handleSidebarClick(page.key)}
                className={`flex items-center gap-3 py-3 px-5 rounded-xl text-left font-semibold transition-all duration-200
                  ${activePage === page.key
                    ? 'bg-[#e2c799] text-[#540b0e] shadow-lg scale-105'
                    : 'hover:bg-[#e2c799]/80 hover:text-[#540b0e]'
                  }`}
              >
                <span className="text-xl">{page.icon}</span>
                <span className="text-lg">{page.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 py-3 px-5 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-[#2563eb] to-[#14b8a6] hover:from-[#1e3a8a] hover:to-[#38bdf8] text-white mt-8 shadow-lg"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 flex flex-col bg-white/95 rounded-3xl m-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-4">
          {pages.find((p) => p.key === activePage)?.icon}
          <h3 className="text-3xl font-extrabold text-[#2563eb] tracking-wide drop-shadow">
            {pages.find((p) => p.key === activePage)?.label}
          </h3>
        </div>
        <div className="flex-1 bg-gradient-to-br from-[#e0f2fe] via-[#f0f6fa] to-[#a5f3fc] rounded-2xl shadow-inner p-8 min-h-[350px] flex items-center justify-center">
          {activePage === 'dashboard' && (
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <DashboardCard
                  icon={<span className="text-6xl">📦</span>}
                  label="Products"
                  description="Add, edit, and play with products!"
                  onClick={() => setActivePage('products')}
                  bg="from-[#f6e7c1] to-[#fff]"
                  text="text-[#7c1d1d]"
                />
                <DashboardCard
                  icon={<span className="text-6xl">📝</span>}
                  label="Orders"
                  description="Track orders with a smile!"
                  onClick={() => setActivePage('orders')}
                  bg="from-[#e3f0ff] to-[#fff]"
                  text="text-[#2563eb]"
                />
                <DashboardCard
                  icon={<span className="text-6xl">🧑‍🤝‍🧑</span>}
                  label="Users"
                  description="See your awesome users!"
                  onClick={() => setActivePage('users')}
                  bg="from-[#f0f6fa] to-[#fff]"
                  text="text-[#7c1d1d]"
                />
                <DashboardCard
                  icon={<span className="text-6xl">💸</span>}
                  label="Payments"
                  description="Money matters, but make it fun!"
                  onClick={() => setActivePage('payments')}
                  bg="from-[#b3c6f7] to-[#fff]"
                  text="text-[#2563eb]"
                />
                <DashboardCard
                  icon={<span className="text-6xl">🏷️</span>}
                  label="Categories"
                  description="Organize with style!"
                  onClick={() => setActivePage('categories')}
                  bg="from-[#e2c799] to-[#fff]"
                  text="text-[#7c1d1d]"
                />
                <DashboardCard
                  icon={<span className="text-6xl">🔥</span>}
                  label="Sales"
                  description="Boost your sales, have fun!"
                  onClick={() => setActivePage('Sales')}
                  bg="from-[#f6e7c1] to-[#fff]"
                  text="text-[#7c1d1d]"
                />
                <DashboardCard
                  icon={<span className="text-6xl">❓</span>}
                  label="Queries"
                  description="Answer questions, spread joy!"
                  onClick={() => setActivePage('queries')}
                  bg="from-[#e3f0ff] to-[#fff]"
                  text="text-[#2563eb]"
                />
              </div>
            </div>
          )}
          {activePage === 'products' && <div className="w-full"><AdminAddProduct /></div>}
          {activePage === 'categories' && <div className="w-full"><ImageUploadWithName /></div>}
          {activePage === 'Sales' && <div className="w-full"><AdminSales /></div>}
          {activePage === 'payments' && <div className="w-full"><PaymentManagement /></div>}
          {activePage === 'orders' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-[#2563eb]">All Orders</h4>
                <button
                  onClick={fetchOrders}
                  className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1e40af] transition-colors"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
                  <p className="mt-2 text-[#2563eb]">Loading orders...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2563eb] text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Products</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                              No orders found
                            </td>
                          </tr>
                        ) : (
                          orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  #{order._id.slice(-8)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="font-medium">{order.userId?.fullName || 'N/A'}</div>
                                  <div className="text-gray-500">{order.userId?.email || 'N/A'}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {order.products?.map((item, index) => (
                                    <div key={index} className="mb-1">
                                      <span className="font-medium">{item.productId?.title || 'Product'}</span>
                                      <span className="text-gray-500 ml-2">
                                        (Qty: {item.quantity}, Size: {item.size})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  Rs. {order.totalAmount?.toFixed(2) || '0.00'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {order.paymentStatus || 'pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => deleteOrder(order._id)}
                                  className="text-red-600 hover:text-red-900 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <FaTrash className="text-xs" />
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <p className="text-sm text-gray-700">
                      Total Orders: <span className="font-semibold">{orders.length}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {activePage === 'payments' && (
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-2 text-[#2563eb]">Payment Statement</h4>
              <p className="text-[#2563eb]">View payment statements here.</p>
            </div>
          )}

          {activePage === 'Sales' && (
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-2 text-[#2563eb]">Add Sales</h4>
              <p className="text-[#2563eb]">View sales statements here.</p>
            </div>
          )}

          {activePage === 'users' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-[#2563eb]">All Users</h4>
                <button
                  onClick={fetchUsers}
                  className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1e40af] transition-colors"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
                  <p className="mt-2 text-[#2563eb]">Loading users...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2563eb] text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Profile</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Verified</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {user.image ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={`https://localhost:3000${user.image}`}
                                      alt={user.fullName || 'User'}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold ${user.image ? 'hidden' : 'flex'
                                      }`}
                                  >
                                    {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.fullName || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isVerified
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {user.isVerified ? 'Verified' : 'Not Verified'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => deleteUser(user._id)}
                                  className="text-red-600 hover:text-red-900 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <FaTrash className="text-xs" />
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <p className="text-sm text-gray-700">
                      Total Users: <span className="font-semibold">{users.length}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePage === 'queries' && (
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-2 text-[#2563eb]">User Queries</h4>
              <p className="text-[#2563eb]">View and respond to user queries here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;