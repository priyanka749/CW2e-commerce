import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/footer';
import Navbar from '../components/nav';

const BASE_URL = 'http://localhost:3000';

const Favourite = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Mark all favorites as "seen" when visiting the page
    const count = Number(localStorage.getItem('favoritesCount')) || 0;
    localStorage.setItem('favoritesSeenCount', count);
    window.dispatchEvent(new Event('favoritesUpdated'));

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setError('Please log in to view your favorites.');
      setLoading(false);
      return;
    }

    axios
      .get(`${BASE_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.favorites)) {
          setFavorites(res.data.favorites);
          // Update favorites count in localStorage
          localStorage.setItem('favoritesCount', res.data.favorites.length);
          // Trigger event to update Navbar
          window.dispatchEvent(new Event('favoritesUpdated'));
        } else {
          toast.error('Unexpected server response.', toastStyle());
          setFavorites([]);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to fetch favorites.', toastStyle());
        setLoading(false);
      });
  }, []);

  const toastStyle = () => ({
    position: 'top-right',
    autoClose: 2500,
    style: {
      background: '#fffaf5',
      color: '#540b0e',
      borderLeft: '6px solid #dc2626',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      borderRadius: '12px',
    },
    progressStyle: { background: '#dc2626' },
  });

  const confirmAndRemove = (productId, productName) => {
    toast(
      <div className="text-[#540b0e]">
        <div className="font-semibold mb-1">Remove "{productName}"?</div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss();
              handleRemove(productId);
            }}
            className="px-4 py-1 rounded-md text-white bg-[#dc2626] hover:bg-red-700 transition text-sm font-medium"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-1 rounded-md bg-orange-400 hover:bg-orange-500 transition text-sm font-medium text-white"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        ...toastStyle(),
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handleRemove = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${BASE_URL}/api/favorites/remove`,
        { productId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update favorites count in state and localStorage after removal
      const updatedFavorites = favorites.filter((p) => p._id !== productId);
      setFavorites(updatedFavorites);
      localStorage.setItem('favoritesCount', updatedFavorites.length);
      // Trigger event to update Navbar
      window.dispatchEvent(new Event('favoritesUpdated'));
      toast.success('Removed from favorites!', toastStyle());
    } catch {
      toast.error('Failed to remove product.', toastStyle());
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add to cart.', toastStyle());
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/api/cart/add`,
        {
          productId: product._id,
          qty: 1,
          color: null,
          size: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success('Added to cart!', toastStyle());
      } else {
        toast.error(res.data.message || 'Failed to add to cart', toastStyle());
      }
    } catch {
      toast.error('Server error', toastStyle());
    }
  };

  // When adding new favorite, trigger event to update Navbar
  const handleAddToFavorites = (newFavorite) => {
    setFavorites([...favorites, newFavorite]);
    // Update favorites count in localStorage
    const newCount = favorites.length + 1;
    localStorage.setItem('favoritesCount', newCount);
    // Trigger the event to update Navbar
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  if (loading) return <div className="text-center py-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fdf9f6] to-[#EBDECD] text-[#540b0e]">
      <Navbar />
      <section className="px-2 sm:px-6 py-12 flex-grow">
        <h2 className="text-4xl font-extrabold text-center mb-12 tracking-wide relative">
          <span className="relative z-10">Your Favourites</span>
          <span className="block w-32 h-1.5 bg-[#540b0e] mx-auto mt-3 rounded-full animate-pulse"></span>
        </h2>

        <ToastContainer limit={3} />

        {favorites.length === 0 ? (
          <div className="text-center text-[#540b0e] text-lg">No favorite products yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-8xl mx-auto">
            {favorites.map((fav) => (
              <div
                key={fav._id}
                className="relative bg-white rounded-2xl overflow-hidden shadow-xl group flex flex-col justify-between"
              >
                <div
                  className="relative w-full h-[380px] overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${fav._id}`)}
                >
                  <img
                    src={`${BASE_URL}/uploads/${fav.image}`}
                    alt={fav.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <button
                    className="absolute top-2 right-2 text-[#540b0e] hover:text-rose-600 transition-colors duration-200 bg-white rounded-full p-1 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmAndRemove(fav._id, fav.title);
                    }}
                    aria-label="Remove from favorites"
                  >
                    <FaHeart size={22} color="#dc2626" />
                  </button>
                </div>

                <div className="p-4 space-y-1 bg-gradient-to-t from-amber-50/50 to-white flex flex-col justify-between text-[#8B6B3E]">
                  <div>
                    <h3 className="text-md font-semibold truncate">{fav.title}</h3>
                    <p className="text-sm">
                      <span className="font-medium">Fabric:</span> {fav.fabric}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Price:</span>{' '}
                      <span className="font-semibold">Rs. {fav.price}</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-2">
                    <button className="w-1/2 border-2 border-[#8B6B3E] text-[#8B6B3E] py-1 rounded-full font-medium hover:bg-[#8B6B3E] hover:text-white transition">
                      Buy Now
                    </button>
                    <button
                      className="w-1/2 bg-[#8B6B3E] text-white py-1 rounded-full font-medium hover:bg-[#704F2E] transition"
                      onClick={() => handleAddToCart(fav)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Favourite;
