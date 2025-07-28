import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/footer';
import Navbar from '../components/nav';
import { useCsrf } from './CsrfProvider';

// Confirmation Popover UI
const ConfirmPopover = ({ anchorRef, onConfirm, onCancel }) => {
  if (!anchorRef?.current) return null;
  const rect = anchorRef.current.getBoundingClientRect();

  return (
    <div
      className="absolute z-50 bg-gradient-to-br from-[#fffaf5] to-[#f9f3e8] border border-[#e2c799] rounded-2xl shadow-2xl px-7 py-6 animate-fade-in"
      style={{
        top: rect.top + window.scrollY + 20,
        left: rect.right + window.scrollX + 20,
        width: 300,
      }}
    >
      <div className="text-center text-[#540b0e] font-semibold text-base mb-6 leading-snug">
        Are you sure you want to <br /> remove this item?
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onConfirm}
          className="bg-[#e63946] hover:bg-[#d62839] text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-md transition-all duration-200 ease-in-out"
        >
          Yes, Remove
        </button>

        <button
          onClick={onCancel}
          className="bg-[#f1f1f1] hover:bg-[#e4e4e4] text-[#4b3e2b] text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm transition-all duration-200 ease-in-out"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};



export default function Cart() {
  const { csrfToken } = useCsrf();
  const [cart, setCart] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

 useEffect(() => {
  fetchCart();

  const handleCartUpdate = () => {
      console.log('Cart update event received');
      fetchCart();
    };


 
    const handlePaymentSuccess = (event) => {
      console.log('Payment success event received:', event.detail);
      // Clear cart immediately and refetch
      setCart([]);
      fetchCart();
      toast.success('Order placed successfully! Cart has been cleared.');
    };

    // Listen for both cart updates and payment success
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("paymentSuccess", handlePaymentSuccess);
    
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("paymentSuccess", handlePaymentSuccess);
    };
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('https://localhost:3000/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success && data.cart) {
      setCart(
        data.cart.items.map((item) => {
          const product = item.product;
          let outOfStock = false;
          let stock = 0;

          if (!product) {
            outOfStock = true;
          } else if (item.size) {
            const sizeEntry = product.sizes?.find(s => s.size === item.size || s.label === item.size);
            stock = sizeEntry?.stock || 0;
            if (!sizeEntry || stock === 0) outOfStock = true;
          } else if (product.totalStock === 0) {
            outOfStock = true;
          }

          return {
            ...item,
            id: product?._id,
            image: product ? `https://localhost:3000/uploads/${product.image}` : '',
            title: product?.title || 'Unavailable',
            desc: product?.fabric || '',
            price: product?.price || 0,
            qty: item.qty,
            color: item.color,
            size: item.size,
            outOfStock,
          };
        })
      );
      localStorage.setItem('cartCount', data.cart.items.length);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleQty = async (id, delta, color, size) => {
    const item = cart.find((i) => i.id === id && i.color === color && i.size === size);
    if (!item) return;

    const newQty = Math.max(1, item.qty + delta);

    // If trying to increase, check stock from backend
    if (delta > 0) {
      try {
        const res = await fetch(`https://localhost:3000/api/products/${id}`);
        const data = await res.json();
        const sizeEntry = data?.sizes?.find(s => s.size === size || s.label === size);
        const stock = sizeEntry?.stock || 0;

        if (newQty > stock) {
          toast.warning(`Only ${stock} items available in size ${size}`);
          return;
        }
      } catch (err) {
        console.error('Failed to check stock:', err);
        toast.error('Stock check failed.');
        return;
      }
    }

    const token = localStorage.getItem('token');
    await fetch('https://localhost:3000/api/cart/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: id,
        qty: newQty,
        color,
        size,
      }),
    });

    fetchCart();
  };

  const handleDeleteClick = (itemId, e) => {
    setItemToRemove(itemId);
    btnRef.current = e.currentTarget;
    setShowConfirm(true);
  };

  const confirmRemove = async () => {
    const item = cart.find((i) => i.id === itemToRemove);
    if (!item) return;
    const token = localStorage.getItem('token');
    await fetch('https://localhost:3000/api/cart/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: item.id,
        color: item.color,
        size: item.size,
      }),
    });
    toast.success('Item removed from cart!');
    setShowConfirm(false);
    setItemToRemove(null);
    fetchCart();
  };

  const handleCancelRemove = () => {
    setShowConfirm(false);
    setItemToRemove(null);
  };

  const completeItems = cart.filter(item => item.size && item.color);

  const totalQty = completeItems.reduce((sum, item) => sum + item.qty, 0);
  const totalAmt = completeItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleAddToCart = async (product) => {
    // ...existing logic to get size/color...
    const token = localStorage.getItem('token');
    const res = await fetch('https://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: product._id,
        qty: 1,
        color: selectedColor,
        size: selectedSize,
      }),
    });
    if (res.ok) {
      toast.success('Added to cart successfully!', {
        position: "top-center",
        autoClose: 2200,
        style: {
          background: '#fffaf5',
          color: '#4BB543',
          fontWeight: 600,
          fontSize: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 24px 0 rgba(139,107,62,0.10)',
          textAlign: 'center'
        },
        icon: false
      });
      fetchCart();
    }
  };

  const incompleteItem = cart.some(item => !item.size || !item.color);

  const isOutOfStock = (item) => {
    if (!item.product || !item.size || !item.product.sizes) return false;
    const sizeObj = item.product.sizes.find(s => s.size === item.size);
    return sizeObj && sizeObj.stock === 0;
  };

  const handleOnlinePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Please log in to make a payment');
    if (cart.length === 0) return toast.warn('Your cart is empty!');
    if (incompleteItem) return toast.warn('Please select size and color for all items before proceeding.');

    try {
      const res = await axios.post(
        'https://localhost:3000/api/payments/khalti/initiate',
        {
          amount: totalAmt,
          userId: localStorage.getItem('userId'),
          products: completeItems.map(item => ({
            productId: item.id,
            quantity: item.qty,
            size: item.size,
            name: item.title,
            color: item.color,
          }))
        },
        { headers: { Authorization: `Bearer ${token}`, 'X-CSRF-Token': csrfToken } }
      );

      if (res.data.payment_url) {
        localStorage.setItem("khaltiTempOrder", JSON.stringify({
          userId: localStorage.getItem('userId'),
          amount: totalAmt,
          products: completeItems.map(item => ({
            productId: item.id,
            quantity: item.qty,
            size: item.size,
            name: item.title,
            color: item.color,
          }))
        }));

        window.location.href = res.data.payment_url;
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f9f6f1] to-[#f3e9db] relative">
      <Navbar />
      <ToastContainer position="top-right" autoClose={2000} toastClassName="!text-sm !py-2 !px-4" />
      {showConfirm && (
        <ConfirmPopover anchorRef={btnRef} onConfirm={confirmRemove} onCancel={handleCancelRemove} />
      )}

      <div className="flex-2 w-full max-w-9xl mx-auto py-12 px-8 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-10">
          {cart.length === 0 ? (
            <div className="text-center text-2xl text-gray-400 py-20 font-semibold">
              Your cart is empty.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id + (item.color || '') + (item.size || '')}
                className="flex items-center bg-white rounded-2xl shadow-lg border border-[#e2c799] px-6 py-4 gap-8 transition-all w-full max-w-5xl mx-auto min-h-[100px]"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-35 h-40 rounded-xl border-2 border-[#e2c799] bg-[#f9f6f2] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center h-full">
                  <div>
                    <h2 className="text-xl font-bold text-[#540b0e] mb-0.5 line-clamp-1">{item.title}</h2>
                    <p className="text-sm font-normal text-[#540b0e] mb-1 line-clamp-1">{item.desc}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1 text-lg">
                        <span className="font-semibold text-[#540b0e]">Price:</span>
                        <span className="text-emerald-600 font-semibold">Rs {item.price}</span>
                      </div>
                      {item.color && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-[#540b0e]">Color:</span>
                          <span
                            className="inline-block w-4 h-4 rounded-full border-2 border-[#e2c799]"
                            style={{ background: item.color }}
                          />
                        </div>
                      )}
                      {item.size && (
                        <div className="text-sm">
                          <span className="font-semibold text-[#540b0e]">Size:</span>{' '}
                          <span className="font-semibold text-[#540b0e]">{item.size}</span>
                        </div>
                      )}
                      {item.outOfStock && (
                        <div className="text-red-600 text-xs font-semibold mt-1">
                          Out of stock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between h-full gap-2 min-w-[120px]">
                  <button
                    ref={btnRef}
                    onClick={(e) => handleDeleteClick(item.id, e)}
                    className="text-red-500 hover:text-red-700 text-2xl p-2 rounded-full bg-red-50 hover:bg-red-100 transition self-end"
                    title="Remove"
                  >
                    <FaTrash />
                  </button>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleQty(item.id, -1, item.color, item.size)}
                      className="w-9 h-9 rounded-full border-2 border-[#e2c799] text-xl font-bold text-[#540b0e] bg-white hover:bg-[#f9f6f2] transition flex items-center justify-center"
                      disabled={item.outOfStock}
                      style={item.outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-8 text-center">
                      {item.outOfStock ? 0 : item.qty}
                    </span>
                    <button
                      onClick={() => handleQty(item.id, 1, item.color, item.size)}
                      className="w-9 h-9 rounded-full border-2 border-[#e2c799] text-xl font-bold text-[#540b0e] bg-white hover:bg-[#f9f6f2] transition flex items-center justify-center"
                      disabled={item.outOfStock}
                      style={item.outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="w-full max-w-[440px] mx-auto lg:mx-0 bg-white rounded-3xl shadow-2xl border border-[#e2c799] p-10 flex flex-col gap-8 self-start mt-8 lg:mt-0 min-h-[420px]">
          <div className="text-2xl font-bold text-[#540b0e] mb-2">Order Summary</div>
          <div className="flex justify-between text-lg font-medium">
            <span>Total Items</span>
            <span>{cart.length}</span>
          </div>
          <div className="flex justify-between text-lg font-medium">
            <span>Total Quantity</span>
            <span>{totalQty}</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold border-t pt-4 mt-2">
            <span>Total Amount</span>
            <span className="text-emerald-600 text-2xl">
              Rs {totalAmt.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {/* <button className="w-full bg-[#e2c799] text-[#540b0e] font-bold py-5 rounded-xl shadow hover:bg-[#f3e9db] transition text-lg min-h-[60px]">
              Cash on Delivery
            </button> */}
           <button className="w-full bg-[#e2c799] text-[#540b0e] font-bold py-5 rounded-xl shadow hover:bg-[#f3e9db] transition text-lg min-h-[60px]" onClick={handleOnlinePayment}>
              Online Payment
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
