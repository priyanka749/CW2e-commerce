import { useEffect, useState } from 'react';
import { FaCheckCircle, FaHeart, FaStar, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/footer';
import Navbar from '../components/nav';

const toastStyle = {
  style: {
    background: '#fffaf5', // soft white
    color: '#540b0e',      // your brown
    borderLeft: '6px solid #e2c799', // gold accent
    fontFamily: 'Poppins, sans-serif',
    fontSize: '15px',
    borderRadius: '12px',
    boxShadow: '0 4px 24px 0 rgba(139,107,62,0.08)',
    minWidth: '220px'
  },
  progressStyle: { background: '#e2c799' }, // gold progress bar
  icon: false
};

const Toast = ({ message, type = "success", onClose }) => (
  <div
    className={`
      fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-3 rounded-xl
      shadow-2xl backdrop-blur bg-opacity-90
      text-white text-base font-semibold
      border-l-4
      ${type === "success" ? "bg-emerald-500 border-emerald-700" : "bg-rose-500 border-rose-700"}
      animate-toast-in
    `}
    style={{
      animation: "toast-in 0.5s cubic-bezier(.4,2,.6,1) both"
    }}
  >
    {type === "success" ? (
      <FaCheckCircle className="text-2xl drop-shadow" />
    ) : (
      <FaTimesCircle className="text-2xl drop-shadow" />
    )}
    <span className="pr-2">{message}</span>
    <button
      className="ml-2 text-white/80 hover:text-white text-xl font-bold focus:outline-none"
      onClick={onClose}
      aria-label="Close"
    >×</button>
    <style>
      {`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(-30%); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}
    </style>
  </div>
);

const SuccessCartToast = () => (
  <div className="flex flex-col items-center justify-center py-2 px-2">
    <div className="rounded-full border-4 border-green-200 mb-2 flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <FaCheckCircle className="text-green-500" size={40} />
    </div>
    <div className="font-bold text-lg text-[#540b0e] mb-1">Added To The Cart !</div>
    <div className="text-sm text-gray-500">Proceed to checkout?</div>
  </div>
);

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://localhost:3000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`https://localhost:3000/api/users/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFavorites(data.favorites.map((p) => String(p._id)));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (user && token) fetchFavorites();
  }, []);

  const filtered = products.filter((p) =>
    [p.title, p.fabric, p.price.toString()].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

 const handleFavorite = async (productId, isFav) => {
  if (!user || !token) {
    alert('Please log in to use favorites.');
    return;
  }

  const url = isFav
    ? 'https://localhost:3000/api/favorites/remove'
    : 'https://localhost:3000/api/favorites/add';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });

  const data = await res.json();

  if (res.ok) {
    const updatedFavorites = isFav
      ? favorites.filter((id) => id !== String(productId))
      : [...favorites, String(productId)];

    setFavorites(updatedFavorites);

    // 🔥 UPDATE localStorage and dispatch favoritesUpdated
    localStorage.setItem('favoritesCount', updatedFavorites.length);
    window.dispatchEvent(new Event('favoritesUpdated'));

    // ✅ Toast feedback
    if (isFav) {
      toast.info("Removed from Favourites", toastStyle);
    } else {
      toast.success("Added to Favourites", toastStyle);
    }
  } else {
    if (data.message === "Already in favorites") {
      toast.success("Already in favorites", toastStyle);
    } else {
      toast.error(data.message || "Error", toastStyle);
    }
  }
};

  const handleAddToCart = async (product) => {
    let sizeToSend = null;
    if (product.sizes && product.sizes.length > 0) {
      // Find the first size with stock > 0 and a valid string value
      const available = product.sizes.find(s => s.stock > 0 && typeof s.size === 'string' && s.size.trim() !== '');
      if (available) {
        sizeToSend = available.size;
      } else {
        // fallback: pick the first size with a valid string
        const anySize = product.sizes.find(s => typeof s.size === 'string' && s.size.trim() !== '');
        if (anySize) sizeToSend = anySize.size;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add to cart.');
      return;
    }
    const res = await fetch('https://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product._id,
        qty: 1,
        color: null,
        size: sizeToSend || undefined,
      }),
    });

    const data = await res.json();
    if (data.success) {
      if (data.message && data.message.toLowerCase().includes('already')) {
        toast.info('Already added to cart!', {
          position: "top-center",
          autoClose: 2200,
          toastId: "cart-already-toast",
          ...toastStyle
        });
        return; // Do not update cart badge or show success toast
      }
      toast(<SuccessCartToast />, {
        ...toastStyle,
        position: "top-center",
        autoClose: 2500,
        closeOnClick: true,
        hideProgressBar: false,
        icon: false,
      });
      // Update cart badge, etc.
      const res2 = await fetch('https://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await res2.json();
      if (cartData.success) {
        localStorage.setItem('cartCount', cartData.cart.items.length);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } else if (data.message && data.message.toLowerCase().includes('already')) {
      toast.info('Already added to cart!', {
        position: "top-center",
        autoClose: 2200,
        toastId: "cart-already-toast",
        ...toastStyle
      });
    } else {
      toast.error(data.message || 'Failed to add to cart', toastStyle);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fdf9f6] to-[#EBDECD] text-[#540b0e]">
      <Navbar />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        toastClassName="!text-sm !py-2 !px-4"
      />

      {/* Search Bar - glassmorphism, shadow, border */}
      <div className="bg-[#FFF9F3] shadow-md px-7 py-10">
        <div className="w-full max-w-4xl mx-auto flex items-center gap-3 bg-white/80 backdrop-blur-md border-2 border-[#540b0e] rounded-full px-6 py-3 shadow-xl">
          <svg className="w-5 h-5 text-[#540b0e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="flex-grow text-base bg-transparent focus:outline-none placeholder:text-[#540b0e]/60 font-medium"
          />
        </div>
      </div>

      <section className="px-2 sm:px-6 py-12 flex-grow">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#540b0e] mb-12 tracking-wide relative">
          All Products
          <span className="block w-42 h-1.5 bg-[#540b0e] mx-auto mt-3 rounded-full animate-pulse"></span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 max-w-9xl mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">No matching products found.</p>
          ) : (
            filtered.map((product) => (
              <div
                key={product._id}
                className="relative bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl transition-all transform group flex flex-col justify-between border border-[#e2c799] hover:scale-105 hover:shadow-amber-200/40 hover:z-10"
                style={{ boxShadow: '0 8px 32px 0 rgba(84,11,14,0.12)' }}
              >
                <div className="relative w-full h-[330px] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                  <img
                    src={`https://localhost:3000/uploads/${product.image}`}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-105 rounded-t-3xl"
                  />
                  <button
                    className="absolute top-2 right-2 transition-colors duration-200 bg-white/90 rounded-full p-1 shadow-lg border border-[#e2c799] hover:bg-[#e2c799]/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(product._id, favorites.includes(String(product._id)));
                    }}
                    aria-label="Toggle Favorite"
                  >
                    <FaHeart
                      size={22}
                      color={favorites.includes(String(product._id)) ? "#b91c1c" : "#fca5a5"}
                      style={{ transition: "color 0.2s" }}
                    />
                  </button>
                </div>

                <div className="p-5 bg-gradient-to-t from-amber-50/60 to-white/80 flex flex-col justify-between rounded-b-3xl">
                  <div className="min-h-[120px] space-y-2">
                    <h3 className="text-lg font-bold text-[#540b0e] truncate">{product.title}</h3>
                    <p className="text-sm text-gray-700"><span className="font-medium">Fabric:</span> {product.fabric}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Price:</span> <span className="text-emerald-600 font-semibold">Rs. {product.price}</span></p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-gray-700">Rating:</span>
                      {Array.from({ length: product.rating }).map((_, i) => (
                        <FaStar key={`filled-${i}`} className="text-yellow-400 text-base" />
                      ))}
                      {Array.from({ length: 5 - product.rating }).map((_, i) => (
                        <FaStar key={`empty-${i}`} className="text-gray-300 text-base" />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-3 pt-4">
                    <button
                      className="w-1/2 text-base bg-[#540b0e] text-white rounded-full py-2 font-semibold shadow hover:bg-[#3a0708] transition-colors duration-200"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      Buy Now
                    </button>
                    <button
                      className="w-1/2 text-base border-2 border-[#540b0e] text-[#540b0e] rounded-full py-2 font-semibold shadow hover:bg-[#540b0e] hover:text-white transition-colors duration-200"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllProducts;


