import { useEffect, useState } from 'react';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import Navbar from '../components/nav';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const Favourite = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setError('Please log in to view your favorites.');
      setLoading(false);
      return;
    }

    axios.get(`${BASE_URL}/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (Array.isArray(res.data.favorites)) {
          setFavorites(res.data.favorites);
        } else {
          console.error('API returned unexpected data format:', res.data);
          setFavorites([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching favorites:', err);
        setError('Failed to fetch favorites.');
        setLoading(false);
      });
  }, []);

  const handleRemove = async (productId) => {
    const token = localStorage.getItem('token');
    await axios.post(`${BASE_URL}/api/favorites/remove`, { productId }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    setFavorites((prev) => prev.filter((p) => p._id !== productId));
  };

  if (loading) return <div className="text-center py-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fdf9f6] to-[#EBDECD] text-[#8B6B3E]">
      <Navbar />
      <section className="px-2 sm:px-6 py-12 flex-grow">
        <h2 className="text-4xl font-extrabold text-center mb-12 tracking-wide relative">
          <span className="relative z-10">Your Favourites</span>
          <span className="block w-32 h-1.5 bg-[#8B6B3E] mx-auto mt-3 rounded-full animate-pulse"></span>
        </h2>
        {!Array.isArray(favorites) || favorites.length === 0 ? (
          <div className="text-center text-[#8B6B3E] text-lg">No favorite products yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {favorites.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-3xl shadow-2xl border border-[#e2c799] p-5 flex flex-col items-center hover:shadow-amber-200 transition-all group"
              >
                <div className="relative w-40 h-40 mb-4">
                  <img
                    src={`${BASE_URL}/uploads/${product.image}`}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-2xl border-4 border-[#fcd34d] shadow group-hover:scale-105 transition-transform"
                  />
                  <FaHeart className="absolute top-2 right-2 text-rose-500 text-2xl drop-shadow" />
                </div>
                <div className="font-bold text-lg text-[#8B6B3E] mb-1 text-center">{product.title}</div>
                <div className="text-sm text-gray-700 mb-1 text-center">
                  <span className="font-medium">Fabric:</span> {product.fabric}
                </div>
                <div className="text-sm text-gray-700 mb-1 text-center">
                  <span className="font-medium">Price:</span>{' '}
                  <span className="text-emerald-600 font-semibold">Rs. {product.price}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: product.rating || 0 }).map((_, i) => (
                    <FaHeart key={i} className="text-yellow-400" />
                  ))}
                  {Array.from({ length: 5 - (product.rating || 0) }).map((_, i) => (
                    <FaHeart key={i} className="text-gray-300" />
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-700 transition"
                  >
                    <FaTrash /> Remove
                  </button>
                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="bg-[#8B6B3E] text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-[#B0895E] transition"
                  >
                    <FaHeart className="text-pink-400" /> View
                  </button>
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