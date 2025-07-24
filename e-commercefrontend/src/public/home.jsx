import { useEffect, useState } from 'react';
import { FaHeart, FaSearch, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import fashionVideo from '../assets/images/new.mp4';
import FamousProducts from '../components/famousproduct';
import Footer from '../components/footer';
import Navbar from '../components/nav';

// ✅ Import images for the video mart section



import home from "../assets/images/home.png";
import homehello from "../assets/images/homehello.png";
import homes from "../assets/images/homes.png";
import homes2 from "../assets/images/homes2.png";
import homes6 from "../assets/images/homes6.png";


// Static products for the row below the video (renamed to avoid conflict)
// const staticProducts = [
//   { id: 1, image: img1, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 5 },
//   { id: 2, image: img2, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 4 },
//   { id: 3, image: img3, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 5 },
//   { id: 4, image: img4, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 5 },
//   { id: 5, image: img5, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 4 },
//   { id: 6, image: img6, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 5 },
//   { id: 7, image: img7, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 5 },
//   { id: 8, image: img8, fabric: 'Silk blend with zari embroidery', price: '5,000', rating: 3 },
// ];






const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = 'http://localhost:3000';
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Add hero images array and currentIndex state
  const heroImages = [home, homes, homes2, homes6, homehello];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/categories`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error('Categories API response is not an array:', data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BASE_URL}/api/products`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          console.error('Products API response is not an array:', data);
          setProducts([]);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  // Update useEffect for hero image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);


  return (
    <div className="bg-[#FFFCF8] text-[#3C2A1E] font-[sans-serif] min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Search */}
      <section className="relative w-full">
        {/* Hero Image with Animated Gradient Overlay */}
        <div className="relative w-full h-[400px] md:h-[600px] lg:h-[770px]">
          <img
            src={heroImages[currentIndex]}
            alt="Hero"
            className="w-full h-full object-cover rounded-b-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#540b0e]/50 via-[#e2c799]/30 to-transparent rounded-b-3xl animate-pulse" />
          {/* Left Arrow Button */}
          <button onClick={prevSlide} className="hidden md:flex items-center justify-center absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 shadow-lg text-3xl text-[#540b0e] font-bold z-20 border-2 border-[#540b0e] hover:bg-[#f3e9db] transition-opacity duration-200">
            &#60;
          </button>
          {/* Right Arrow Button */}
          <button onClick={nextSlide} className="hidden md:flex items-center justify-center absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 shadow-lg text-3xl text-[#540b0e] font-bold z-20 border-2 border-[#540b0e] hover:bg-[#f3e9db] transition-opacity duration-200">
            &#62;
          </button>
          {/* Centered Text Block - moved slightly lower */}
          <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 max-w-xs md:max-w-lg">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-wide drop-shadow-2xl uppercase font-playfair text-white mb-2">
              Prashansa
            </h1>
            <span className="block text-xl md:text-3xl font-light tracking-normal text-white/80 mb-6">
              Grace In Every Thread
            </span>
            <button className="mt-2 md:mt-4 px-8 md:px-10 py-3 md:py-4 bg-[#540b0e] text-white font-semibold rounded-full shadow-xl hover:bg-[#3a0708] transition duration-200 tracking-wide text-lg md:text-xl" onClick={() => navigate('/products')}>
              SHOP NOW
            </button>
          </div>
          {/* Floating Search Bar */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[70%] lg:w-[57%] bg-white/90 backdrop-blur-md rounded-full shadow-xl flex items-center px-4 md:px-6 py-3 md:py-4 transition-all duration-300">
            <FaSearch className="text-[#540b0e] mr-3" />
            <input
              type="text"
              placeholder="Search for products, categories..."
              className="w-full h-6 outline-none bg-transparent text-base text-[#540b0e] placeholder-[#540b0e]/60"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 px-2 md:px-10 lg:px-20 bg-gradient-to-b from-[#FFF9F3] via-[#f7ede2]/60 to-[#FFF9F3] w-full overflow-x-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center text-[#540b0e] tracking-wide drop-shadow-lg">Categories</h2>
        <div className="flex flex-row gap-8 md:gap-12 overflow-x-auto px-2 md:px-8">
          {categories && categories.length > 0 ? (
            categories
              .filter(cat => cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((cat, i) => (
                <div
                  key={i}
                  className="flex flex-row items-center min-w-[220px] md:min-w-[260px] bg-white/80 rounded-2xl shadow-lg hover:shadow-2xl border border-[#e2c799]/40 cursor-pointer transition-transform duration-300 hover:scale-105 px-4 py-3 md:px-6 md:py-5"
                  onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 mr-4 md:mr-6 bg-[#f7ede2] border-2 border-[#e2c799]/60 shadow">
                    <img
                      src={`${BASE_URL}${cat.image}`}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <span className="text-lg md:text-xl font-bold text-[#540b0e] tracking-wide">
                    {cat.name}
                  </span>
                </div>
              ))
          ) : (
            <div className="text-center w-full py-8 text-[#540b0e]">
              {loading ? 'Loading categories...' : 'No categories available'}
            </div>
          )}
        </div>
      </section>

      {/* Famous Products Section */}
      <FamousProducts />

      {/* Elegant Fashion Video Section */}
      <section className="relative px-2 sm:px-4 md:px-10 lg:px-20 py-10 md:py-16 bg-gradient-to-br from-[#f7ede2] via-white to-[#EBDECD]/90 min-h-[500px] md:min-h-[700px] overflow-hidden">
        {/* Caption - now before video, large title and higher */}
        <div className="text-center mb-3 md:mb-5 relative z-10">
          <p className="text-4xl md:text-5xl font-extrabold text-[#540b0e] tracking-wide mb-1">
            Grace in Every Thread
          </p>
          <p className="text-xl md:text-2xl text-[#540b0e]/70 font-semibold">
            Experience the elegance of timeless fashion
          </p>
        </div>
        {/* Video Container - clean, no border, no circles, no header */}
        <div className="max-w-6xl mx-auto relative">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-[#540b0e]/10 to-[#e2c799]/10 relative overflow-hidden rounded-3xl flex items-center justify-center">
              <video
                src={fashionVideo}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 group-hover:brightness-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* One row of products after video, styled exactly as FamousProducts */}
      <section className="px-4 sm:px-6 py-16 bg-gradient-to-br text-[#540b0e] via-text-white to-[#EBDECD]">
        <h2 className="text-2xl sm:text-4xl md:text-4xl font-extrabold text-center text-[#540b0e] mb-10 relative">
          Featured Products
          <span className="block w-30 h-1.5 bg-[#540b0e] mx-auto mt-3 rounded-full animate-pulse"></span>
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#540b0e] text-xl">Loading products...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600 text-xl text-center">
              <p>{error}</p>
            </div>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-8xl mx-auto">
            {products
              .filter(product => product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .slice(0, 4)
              .map((product) => (
                <div
                  key={product._id}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-xl transition-all transform group flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative w-full h-[380px] overflow-hidden">
                    <img
                      src={`${BASE_URL}/uploads/${product.image}`}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform"
                    />
                    <button
                      className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 transition-colors duration-200"
                      aria-label="Add to favorites"
                    >
                      <FaHeart size={22} />
                    </button>
                  </div>
                  {/* Description */}
                  <div className="p-4 space-y-1 bg-gradient-to-t from-amber-50/50 to-white flex flex-col justify-between">
                    <div>
                      <h3 className="text-md font-semibold text-[#540b0e] truncate">{product.title}</h3>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Fabric:</span> {product.fabric}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Price:</span>{' '}
                        <span className="text-emerald-600 font-semibold">Rs. {product.price}</span>
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-gray-700">Rating:</span>
                        {Array.from({ length: product.rating || 0 }).map((_, i) => (
                          <FaStar key={`filled-${i}`} className="text-yellow-400 text-base" />
                        ))}
                        {Array.from({ length: 5 - (product.rating || 0) }).map((_, i) => (
                          <FaStar key={`empty-${i}`} className="text-gray-300 text-base" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-2 pt-2">
                      <button className="w-1/2 border-2 border-[#540b0e] text-[#540b0e] py-1 rounded-full font-medium hover:bg-[#540b0e] hover:text-white transition-colors duration-200">
                        Buy Now
                      </button>
                      <button className="w-1/2 bg-[#540b0e] text-white py-1 rounded-full font-medium hover:bg-[#704F2E] transition-colors duration-200">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#540b0e] text-xl">No products available</div>
          </div>
        )}
      </section>

      {/* Testimonials Section (after video, before footer) */}
      <section className="w-full flex flex-col items-center justify-center pt-16 pb-20">
        <div className="max-w-6xl w-full mx-auto px-2 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#540b0e] mb-10 text-center">What Our Customers Say</h2>
          <div className="relative w-full flex items-center justify-center">
            {/* Left Arrow */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-3xl text-[#540b0e] bg-white rounded-full shadow-lg p-3 border-2 border-[#e2c799] hover:bg-[#f7ede2] transition duration-200">
              &#60;
            </button>
            {/* Testimonials Cards - horizontal scroll on mobile, grid on desktop */}
            <div className="flex flex-row gap-8 overflow-x-auto w-full py-2 px-1 scrollbar-thin scrollbar-thumb-[#e2c799] scrollbar-track-[#f7ede2]">
              {/* Testimonial 1 */}
              <div className="min-w-[320px] max-w-[350px] bg-white rounded-2xl shadow-xl border border-[#e2c799]/50 flex flex-col items-center p-7 transition-transform duration-300 hover:scale-105">
                <img src="/src/assets/images/home1.png" alt="Customer" className="w-16 h-16 rounded-full object-cover border-4 border-[#e2c799] mb-4 shadow" />
                <p className="text-lg font-medium text-[#3C2A1E] mb-2 text-center">"Absolutely loved the detailing on the kurti I bought! The embroidery work is just stunning and looks even better in person."</p>
                <span className="text-sm text-[#540b0e] font-semibold mt-2">- Prashansa</span>
              </div>
              {/* Testimonial 2 */}
              <div className="min-w-[320px] max-w-[350px] bg-white rounded-2xl shadow-xl border border-[#e2c799]/50 flex flex-col items-center p-7 transition-transform duration-300 hover:scale-105">
                <img src="/src/assets/images/fav2.png" alt="Customer" className="w-16 h-16 rounded-full object-cover border-4 border-[#e2c799] mb-4 shadow" />
                <p className="text-lg font-medium text-[#3C2A1E] mb-2 text-center">"The saree I ordered was even more beautiful than in the pictures. The fabric quality and color were perfect for my event!"</p>
                <span className="text-sm text-[#540b0e] font-semibold mt-2">- Anjali</span>
              </div>
              {/* Testimonial 3 */}
              <div className="min-w-[320px] max-w-[350px] bg-white rounded-2xl shadow-xl border border-[#e2c799]/50 flex flex-col items-center p-7 transition-transform duration-300 hover:scale-105">
                <img src="/src/assets/images/about2.png" alt="Customer" className="w-16 h-16 rounded-full object-cover border-4 border-[#e2c799] mb-4 shadow" />
                <p className="text-lg font-medium text-[#3C2A1E] mb-2 text-center">"Quick delivery and excellent customer service. My lehenga fit perfectly and I received so many compliments!"</p>
                <span className="text-sm text-[#540b0e] font-semibold mt-2">- Riya</span>
              </div>
            </div>
            {/* Right Arrow */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-3xl text-[#540b0e] bg-white rounded-full shadow-lg p-3 border-2 border-[#e2c799] hover:bg-[#f7ede2] transition duration-200">
              &#62;
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
