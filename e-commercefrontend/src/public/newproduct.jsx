import { useEffect, useState } from 'react';
import { FaCheckCircle, FaCrown, FaFire, FaGift, FaHeart, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/footer';
import Navbar from '../components/nav';
import { useCsrf } from './CsrfProvider';

const toastStyle = {
  style: {
    background: '#fffaf5',
    color: '#540b0e',
    borderLeft: '6px solid #e2c799',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '15px',
    borderRadius: '12px',
    boxShadow: '0 4px 24px 0 rgba(139,107,62,0.08)',
    minWidth: '210px'
  },
  progressStyle: { background: '#e2c799' },
  icon: false
};

const SuccessCartToast = () => (
  <div className="flex flex-col items-center justify-center py-2 px-2">
    <div className="rounded-full border-4 border-green-200 mb-2 flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <FaCheckCircle className="text-green-500" size={40} />
    </div>
    <div className="font-bold text-lg text-[#540b0e] mb-1">Added To The Cart !</div>
    <div className="text-sm text-gray-500">Proceed to checkout?</div>
  </div>
);

const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 text-white opacity-30 animate-bounce">
      <FaFire size={30} />
    </div>
    <div className="absolute top-32 right-16 text-[#e2c799] opacity-20 animate-pulse">
      <FaCrown size={25} />
    </div>
    <div className="absolute bottom-20 left-20 text-[#e2c799] opacity-25 animate-bounce" style={{ animationDelay: '1s' }}>
      <FaGift size={28} />
    </div>
    <div className="absolute top-60 right-32 text-[#e2c799] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}>
      <FaStar size={22} />
    </div>
  </div>
);

const NewArrivals = () => {
  const { api } = useCsrf();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('https://localhost:3000/api/products');
      const data = res.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('https://localhost:3000/api/users/favorites');
      const data = res.data;
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

    try {
      const res = await api.post(url, { productId });
      const data = res.data;

      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== String(productId)) : [...prev, String(productId)]
      );
      if (isFav) {
        toast.info("Removed from Favourites", toastStyle);
      } else {
        toast.success("Added to Favourites", toastStyle);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message === "Already in favorites") {
        toast.success("Already in favorites", toastStyle);
      } else {
        toast.error((err.response && err.response.data && err.response.data.message) || "Error", toastStyle);
      }
    }
  };

  const handleAddToCart = async (product) => {
    let sizeToSend = null;
    if (product.sizes && product.sizes.length > 0) {
      const available = product.sizes.find(s => s.stock > 0 && typeof s.size === 'string' && s.size.trim() !== '');
      if (available) {
        sizeToSend = available.size;
      } else {
        const anySize = product.sizes.find(s => typeof s.size === 'string' && s.size.trim() !== '');
        if (anySize) sizeToSend = anySize.size;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add to cart.');
      return;
    }
    try {
      const res = await api.post('https://localhost:3000/api/cart/add', {
        productId: product._id,
        qty: 1,
        color: null,
        size: sizeToSend || undefined,
      });
      const data = res.data;
      if (data.success) {
        toast(<SuccessCartToast />, {
          ...toastStyle,
          position: "top-center",
          autoClose: 2500,
          closeOnClick: true,
          hideProgressBar: false,
          icon: false,
        });
        const res2 = await api.get('https://localhost:3000/api/cart');
        const cartData = res2.data;
        if (cartData.success) {
          localStorage.setItem('cartCount', cartData.cart.items.length);
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } else if (data.message && data.message.toLowerCase().includes('already')) {
        toast.info('Already added to cart!', {
          position: "top-center",
          autoClose: 2200,
          toastId: "cart-already-toast"
        });
      } else {
        toast.error(data.message || 'Failed to add to cart', toastStyle);
      }
    } catch (err) {
      toast.error((err.response && err.response.data && err.response.data.message) || 'Failed to add to cart', toastStyle);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fdf9f6] to-[#EBDECD] text-[#540b0e]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#540b0e] mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fdf9f6] to-[#EBDECD] text-[#540b0e] relative overflow-hidden">
      <Navbar />
      <FloatingElements />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        toastClassName="!text-sm !py-2 !px-4"
      />

      {/* Dynamic Hero Section */}
      <div className="relative bg-gradient-to-r from-[#fdf6e3] via-[#f7e9d0] to-[#e2c799] py-12 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="relative mb-6">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-sm rounded-full px-6 py-2 animate-bounce">
                <FaFire className="text-[#540b0e] animate-pulse" />
                <span className="font-semibold text-sm tracking-wide text-[#540b0e]">JUST DROPPED</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 flex items-center gap-2 bg-white/80 px-5 py-1 rounded-full border border-[#540b0e] shadow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-[#540b0e] focus:outline-none text-sm px-2"
                style={{ minWidth: 120 }}
              />
              <span className="text-[#540b0e]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 text-[#540b0e]">
            New Arrivals
          </h1>
          <p className="text-xl sm:text-2xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed text-[#540b0e]">
            Discover the latest trends in fashion with our carefully curated collection
          </p>
          <div className="flex justify-center mb-4">
            <div className="h-1 w-32 rounded-full bg-gradient-to-r from-[#e2c799] via-[#bfa76a] to-[#e2c799] opacity-80"></div>
          </div>
          {/* Feature badges removed as requested */}
        </div>
      </div>

      {/* Products Section with Masonry Layout */}
      <section className="px-4 sm:px-8 py-16 flex-grow">
        <div className="max-w-8xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">No items found</h3>
              <p className="text-lg text-gray-500">Try adjusting your search or check back later for new arrivals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-9xl mx-auto">
              {filtered.map((product) => (
                <div
                  key={product._id}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-xl transition-all transform group flex flex-col justify-between border border-[#e2c799]"
                >
                  {/* New Badge */}
                  <div className="absolute top-2 left-2 z-20">
                    <div className="bg-[#540b0e] text-white px-4 py-2 rounded text-base font-semibold shadow-md" style={{fontFamily: 'Poppins, sans-serif'}}>New</div>
                  </div>
                  <div className="relative w-full h-[330px] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                    <img
                      src={`https://localhost:3000/uploads/${product.image}`}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      className="absolute top-2 right-2 transition-colors duration-200 bg-white/80 rounded-full p-1 shadow"
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
                  <div className="p-4 bg-gradient-to-t from-amber-50/50 to-white flex flex-col justify-between">
                    <div className="min-h-[120px] space-y-1">
                      <h3 className="text-md font-semibold text-[#540b0e] truncate">{product.title}</h3>
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
                    <div className="flex justify-between items-center gap-2 pt-3">
                      <button className="w-1/2 border-2 border-[#540b0e] text-[#540b0e] py-1 rounded-full font-medium hover:bg-[#540b0e] hover:text-white transition-colors duration-200">
                        Buy Now
                      </button>
                      <button
                        className="w-1/2 bg-[#540b0e] text-white py-1 rounded-full font-medium hover:bg-[#704F2E] transition-colors duration-200"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewArrivals;