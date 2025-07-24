import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/nav';
import Footer from '../components/footer';
import { FaHeart, FaStar, FaSearch } from 'react-icons/fa';

const BASE_URL = 'http://localhost:3000';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/products?category=${encodeURIComponent(categoryName)}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName]);

  useEffect(() => {
    if (user && token) {
      fetch(`${BASE_URL}/api/users/${user._id}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setFavorites(data.map(p => p._id)));
    }
  }, [user, token]);

  const filteredProducts =
    categoryName && categoryName.toLowerCase() === 'saree'
      ? products.filter(
          (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.fabric && p.fabric.toLowerCase().includes(search.toLowerCase()))
        )
      : products;

  const handleFavorite = async (productId, isFav) => {
    if (!user || !token) {
      alert('Please log in to use favorites.');
      return;
    }
    const url = isFav
      ? `${BASE_URL}/api/users/favorites/remove`
      : `${BASE_URL}/api/users/favorites/add`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Special UI for saree
  if (categoryName && categoryName.toLowerCase() === 'saree') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fdf9f6] to-[#EBDECD] text-[#8B6B3E]">
        <Navbar />
        <div className="bg-[#FFF9F3] shadow-md px-7 py-10">
          <div className="w-full max-w-4xl mx-auto flex items-center gap-3 bg-white border-2 border-[#8B6B3E] rounded-full px-6 py-3 shadow-lg mb-10">
            <FaSearch className="w-5 h-5 text-[#8B6B3E]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sarees by name or fabric..."
              className="flex-grow text-base bg-transparent focus:outline-none placeholder:text-[#8B6B3E]/60 font-medium"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#8B6B3E] mb-12 tracking-wide relative">
            Sarees
            <span className="block w-42 h-1.5 bg-[#8B6B3E] mx-auto mt-3 rounded-full animate-pulse"></span>
          </h2>
          {loading ? (
            <div className="text-center text-lg text-gray-400 py-10">Loading...</div>
          ) : error ? (
            <div className="text-center text-lg text-red-500 py-10">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-lg text-gray-400 py-10">No sarees found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-9xl mx-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-xl transition-all transform group flex flex-col justify-between border border-[#e2c799]"
                >
                  {/* Image */}
                  <div className="relative w-full h-[380px] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                    <img
                      src={`${BASE_URL}/uploads/${product.image}`}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      className="absolute top-2 right-2 transition-colors duration-200 bg-white/80 rounded-full p-1 shadow"
                      onClick={e => {
                        e.stopPropagation();
                        handleFavorite(product._id, favorites.includes(product._id));
                      }}
                    >
                      <FaHeart
                        size={22}
                        color={favorites.includes(product._id) ? "#b91c1c" : "#fca5a5"}
                        style={{ transition: "color 0.2s" }}
                      />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-4 bg-gradient-to-t from-amber-50/50 to-white flex flex-col justify-between">
                    <div className="min-h-[120px] space-y-1">
                      <h3 className="text-md font-semibold text-[#8B6B3E] truncate">{product.title}</h3>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Fabric:</span> {product.fabric}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Price:</span>{' '}
                        <span className="text-emerald-600 font-semibold">Rs. {product.price}</span>
                      </p>
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
                      <button className="w-1/2 border-2 border-[#8B6B3E] text-[#8B6B3E] py-1 rounded-full font-medium hover:bg-[#8B6B3E] hover:text-white transition-colors duration-200">
                        Buy Now
                      </button>
                      <button className="w-1/2 bg-[#8B6B3E] text-white py-1 rounded-full font-medium hover:bg-[#704F2E] transition-colors duration-200" onClick={() => navigate('/cart')}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // Default UI for other categories
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fdf9f6] to-[#EBDECD] text-[#8B6B3E]">
      <Navbar />
      <div className="bg-[#FFF9F3] shadow-md px-7 py-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#8B6B3E] mb-8 tracking-wide relative">
          {categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'Category'}
        </h2>
        {loading ? (
          <div className="text-center text-lg text-gray-400 py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-lg text-red-500 py-10">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-lg text-gray-400 py-10">No products found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-9xl mx-auto">
            {products.map((product) => (
              <div
                key={product._id}
                className="relative bg-white rounded-2xl overflow-hidden shadow-xl transition-all transform group flex flex-col justify-between border border-[#e2c799]"
              >
                <div className="relative w-full h-[280px] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                  <img
                    src={`${BASE_URL}/uploads/${product.image}`}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    className="absolute top-2 right-2 transition-colors duration-200 bg-white/80 rounded-full p-1 shadow"
                  >
                    <FaHeart size={22} color="#fca5a5" />
                  </button>
                </div>
                <div className="p-4 bg-gradient-to-t from-amber-50/50 to-white flex flex-col justify-between">
                  <div className="min-h-[120px] space-y-1">
                    <h3 className="text-md font-semibold text-[#8B6B3E] truncate">{product.title}</h3>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Fabric:</span> {product.fabric}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Price:</span>{' '}
                      <span className="text-emerald-600 font-semibold">Rs. {product.price}</span>
                    </p>
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
                    <button className="w-1/2 border-2 border-[#8B6B3E] text-[#8B6B3E] py-1 rounded-full font-medium hover:bg-[#8B6B3E] hover:text-white transition-colors duration-200">
                      Buy Now
                    </button>
                    <button className="w-1/2 bg-[#8B6B3E] text-white py-1 rounded-full font-medium hover:bg-[#704F2E] transition-colors duration-200" onClick={() => navigate('/cart')}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage; 