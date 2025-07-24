import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

import Footer from './components/footer';
import Navbar from './components/nav';
import OtpVerification from './components/otp';
import ImageUploadWithName from './private/add';
import AdminAddProduct from './private/addproduct';
import AdminLogin from './private/admin';
import AdminDashboard from './private/adminDashboard';
import Favourite from './private/favourite';
import Profile from './private/profile';
import About from './public/about';
import Products from './public/allproducts';
import Cart from './public/cart';
import CategoryPage from './public/category';
import Chat from './public/chat';
import Contact from './public/contact';
import Help from './public/help';
import Home from './public/home';
import Login from './public/login';
import Payment from './public/payment';
import ProductDetail from './public/productdetail';
import Sales from './public/sales';
import Signup from './public/signup';
import VirtualTryOn from './public/virtualtryon';

import ForgotPassword from './components/forgotpassword';
import NewProduct from './public/newproduct';
import PaymentSuccess from './public/paymentsucess';
import TryOn from './public/virtualtryon';

import AdminSales from './private/addsales';
import PaymentManagement from './private/paymentstatment';
// ✅ Define Routes
const routes = createBrowserRouter([
  { path: '/', element: <Navigate replace to="/home" /> },

  // Public routes
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
  { path: '/home', element: <Home /> },
  { path: '/navbar', element: <Navbar /> },
  { path: '/otp', element: <OtpVerification /> },
  { path: '/footer', element: <Footer /> },
  { path: '/about', element: <About /> },
  { path: '/products', element: <Products /> },
  { path: '/product/:id', element: <ProductDetail /> },
  { path: '/admin', element: <AdminLogin /> },
  { path: '/image-upload', element: <ImageUploadWithName /> },
  { path: '/contact', element: <Contact /> },
  { path: '/cart', element: <Cart /> },
  { path: '/category/:categoryName', element: <CategoryPage /> },
  { path: '/domi', element: <ProductDetail /> },
  { path: '/help', element: <Help /> },
  {path: '/virtual-try-on', element: <VirtualTryOn selectedColor="brown" />},
  {path: '/payment', element: <Payment />},
  {path: '/chat', element: <Chat />}, 
  { path: '/sales', element: <Sales /> },
{path: '/forgot-password', element: <ForgotPassword />},
{path: '/try-on', element: <TryOn />}, // Assuming this is the virtual try-on page

  
  {path: '/payment-success', element: <PaymentSuccess />},
  {path:'/new-arrivals', element: <NewProduct />}, // Assuming this is a new arrivals page
   // Payment verification page

  // Assuming this is the payment page
 
  
 

  // Private user routes
  {
    element: <PrivateRoute allowedRoles={['user']} />, // Only users
    children: [
      { path: '/profile', element: <Profile /> },
       {path: '/favourite', element: <Favourite /> },

      
       // Assuming this is a favorites page
    ],
  },
  // Private admin routes
  {
    element: <PrivateRoute allowedRoles={['admin']} />, // Only admins
    children: [
      { path: '/add-product', element: <AdminAddProduct /> },
      { path: '/admin/dashboard', element: <AdminDashboard /> },
      {path: '/admin/sales', element: <AdminSales />}, 
      {path: '/admin/payment-management', element: <PaymentManagement />}, // Assuming this is for payment management
      // Assuming this is for adding sales
      // Assuming this is a sales management page
    ],
  },

  { path: '*', element: <>404 | Page Not Found</> },
]);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
