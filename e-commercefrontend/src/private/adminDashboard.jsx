import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaBoxOpen, FaClipboardList, FaMoneyCheckAlt, FaQuestionCircle, FaSignOutAlt, FaTags, FaTrash, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logoo.png';
import ImageUploadWithName from './add';
import AdminAddProduct from './addproduct';
import AdminSales from './addsales';
import PaymentManagement from './paymentstatment';

const pages = [
  { key: 'products', label: 'Product Management', icon: <FaBoxOpen /> },
  { key: 'orders', label: 'Order Management', icon: <FaClipboardList /> },
  { key: 'categories', label: 'Category Management', icon: <FaTags /> },
  { key: 'payments', label: 'Payment Statement', icon: <FaMoneyCheckAlt /> },
  { key: 'Sales', label: 'Sales Management', icon: <FaTags /> },
  { key: 'users', label: 'User Management', icon: <FaUsers /> },
  { key: 'queries', label: 'User Queries', icon: <FaQuestionCircle /> },
];

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        timeout: 5000 // 5 second timeout
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
        }
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

  // Fetch users when users page is active, orders when orders page is active
  useEffect(() => {
    if (activePage === 'users') {
      fetchUsers();
    } else if (activePage === 'orders') {
      fetchOrders();
    }
  }, [activePage]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:3000/api/auth/admin/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e3f0ff] via-[#f0f6fa] to-[#c7e0f4]">
      {/* Top Bar with Dashboard Button */}
      <div className="w-full flex items-center justify-between px-10 py-6 bg-white/80 shadow-lg rounded-b-3xl mb-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-14 w-14 rounded-full object-contain shadow border-2 border-[#e2c799]" />
          <span className="text-3xl font-extrabold text-[#540b0e] tracking-wide drop-shadow">Admin Panel</span>
        </div>
        <button
          onClick={() => { setActivePage('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="px-8 py-3 bg-gradient-to-r from-[#e2c799] to-[#540b0e] text-white text-xl font-bold rounded-full shadow-lg hover:from-[#540b0e] hover:to-[#e2c799] hover:text-[#540b0e] hover:bg-white border-2 border-[#e2c799] transition-all duration-200"
        >
          Dashboard
        </button>
      </div>
      <div className="flex flex-1">
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
          {/* Dashboard Overview Section */}
          {activePage === 'dashboard' && (
            <div className="w-full flex flex-col items-center justify-center gap-10">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <div
                  className="bg-gradient-to-br from-[#e2c799] to-[#fff9f3] rounded-2xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setActivePage('products')}
                  title="Go to Product Management"
                >
                  <FaBoxOpen className="text-4xl text-[#540b0e] mb-2" />
                  <div className="text-2xl font-bold text-[#540b0e]">Products</div>
                  <div className="text-3xl font-extrabold text-[#2563eb]">Manage</div>
                </div>
                <div
                  className="bg-gradient-to-br from-[#a5f3fc] to-[#e0f2fe] rounded-2xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setActivePage('orders')}
                  title="Go to Order Management"
                >
                  <FaClipboardList className="text-4xl text-[#540b0e] mb-2" />
                  <div className="text-2xl font-bold text-[#540b0e]">Orders</div>
                  <div className="text-3xl font-extrabold text-[#2563eb]">Track</div>
                </div>
                <div
                  className="bg-gradient-to-br from-[#f0f6fa] to-[#e2c799] rounded-2xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setActivePage('users')}
                  title="Go to User Management"
                >
                  <FaUsers className="text-4xl text-[#540b0e] mb-2" />
                  <div className="text-2xl font-bold text-[#540b0e]">Users</div>
                  <div className="text-3xl font-extrabold text-[#2563eb]">View</div>
                </div>
                <div
                  className="bg-gradient-to-br from-[#fff9f3] to-[#a5f3fc] rounded-2xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setActivePage('payments')}
                  title="Go to Payment Statement"
                >
                  <FaMoneyCheckAlt className="text-4xl text-[#540b0e] mb-2" />
                  <div className="text-2xl font-bold text-[#540b0e]">Payments</div>
                  <div className="text-3xl font-extrabold text-[#2563eb]">Statement</div>
                </div>
              </div>
              <div className="w-full flex flex-col items-center mt-8">
                <h2 className="text-4xl font-extrabold text-[#540b0e] mb-2">Welcome to the Admin Dashboard</h2>
                <p className="text-lg text-[#2563eb] text-center max-w-2xl">Get a quick overview and manage your e-commerce platform efficiently. Use the sidebar to access different management sections.</p>
              </div>
            </div>
          )}
          {/* Existing Pages */}
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
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;