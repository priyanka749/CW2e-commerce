import { useState } from 'react';
import { FaArrowLeft, FaCheckCircle, FaExchangeAlt, FaHeart, FaStar, FaTruck } from 'react-icons/fa';
import Footer from '../components/footer';
import Navbar from '../components/nav';
import { useNavigate } from 'react-router-dom';

// Example product data (replace with real data/fetch as needed)
const product = {
  id: 1,
  title: 'Anarkali Silk Set',
  image: require('../assets/images/fav.png'),
  fabric: 'Organza silk with sequins work',
  price: '4,999',
  rating: 5,
  description:
    'This beautiful Anarkali Silk Set features premium organza silk with intricate sequins work. Perfect for festive occasions and celebrations. Comes with matching dupatta and bottom.',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['#e2c799', '#8B6B3E', '#f7ede2'],
  isNew: true,
};

const ProductDetail = () => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [fav, setFav] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fffaf5] via-[#fdf9f6] to-[#EBDECD] text-[#8B6B3E]">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-16 items-start">
        {/* Product Image & Badges */}
        <div className="w-full md:w-[48%] flex flex-col items-center">
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#e2c799] bg-gradient-to-t from-[#f7ede2] to-white">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-[480px] object-cover object-top scale-105 hover:scale-110 transition-transform duration-500"
            />
            {product.isNew && (
              <span className="absolute top-6 left-6 bg-gradient-to-r from-[#e2c799] to-[#fff9f3] text-[#8B6B3E] text-xs font-bold px-6 py-2 rounded-full shadow-md uppercase tracking-wider border border-[#8B6B3E]/10">
                New Arrival
              </span>
            )}
            <button
              className="absolute top-6 right-6 text-rose-400 hover:text-rose-600 transition-colors duration-200 bg-white/90 rounded-full p-3 shadow-lg"
              aria-label="Add to favorites"
              onClick={() => setFav((f) => !f)}
            >
              <FaHeart size={28} className={fav ? 'fill-rose-500' : ''} />
            </button>
          </div>
          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-4 mt-8">
            <span className="flex items-center gap-2 bg-white/90 border border-[#e2c799] text-[#8B6B3E] px-5 py-2 rounded-full text-base font-semibold shadow hover:bg-[#f7ede2] transition">
              <FaTruck className="text-lg" /> Free Delivery
            </span>
            <span className="flex items-center gap-2 bg-white/90 border border-[#e2c799] text-[#8B6B3E] px-5 py-2 rounded-full text-base font-semibold shadow hover:bg-[#f7ede2] transition">
              <FaExchangeAlt className="text-lg" /> 7-Day Return
            </span>
            <span className="flex items-center gap-2 bg-white/90 border border-[#e2c799] text-[#8B6B3E] px-5 py-2 rounded-full text-base font-semibold shadow hover:bg-[#f7ede2] transition">
              <FaCheckCircle className="text-lg text-emerald-600" /> 100% Original
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-[52%] flex flex-col gap-8">
          <button
            className="flex items-center gap-2 text-[#8B6B3E] font-semibold mb-2 hover:underline w-fit"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-4xl font-extrabold font-playfair mb-2">{product.title}</h1>
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: product.rating }).map((_, i) => (
              <FaStar key={i} className="text-yellow-400 text-xl" />
            ))}
            {Array.from({ length: 5 - product.rating }).map((_, i) => (
              <FaStar key={i} className="text-gray-300 text-xl" />
            ))}
            <span className="ml-2 text-base text-gray-500">(12 reviews)</span>
          </div>
          <div className="text-3xl font-bold text-emerald-700 mb-3 tracking-wide">Rs. {product.price}</div>
          <p className="text-gray-700 text-lg mb-3 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-4 mb-2">
            <span className="font-semibold">Fabric:</span>
            <span className="text-[#8B6B3E]">{product.fabric}</span>
          </div>
          {/* Size Selection */}
          <div className="flex items-center gap-4 mb-2">
            <span className="font-semibold">Size:</span>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`px-6 py-2 rounded-full border font-semibold shadow-sm text-base ${
                    selectedSize === size
                      ? 'bg-[#8B6B3E] text-white border-[#8B6B3E] scale-105'
                      : 'bg-white text-[#8B6B3E] border-[#e2c799]'
                  } transition-all duration-200`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {/* Color Selection */}
          <div className="flex items-center gap-4 mb-4">
            <span className="font-semibold">Color:</span>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`w-9 h-9 rounded-full border-2 shadow ${
                    selectedColor === color ? 'border-[#8B6B3E] scale-110 ring-2 ring-[#e2c799]' : 'border-[#e2c799]'
                  } transition-all duration-200`}
                  style={{ background: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 mt-2">
            <button className="flex-1 bg-gradient-to-r from-[#8B6B3E] to-[#e2c799] text-white py-3 rounded-full font-bold text-lg shadow-xl hover:from-[#a88b5c] hover:to-[#8B6B3E] transition-all duration-200" onClick={() => navigate('/cart')}>
              Add to Cart
            </button>
            <button className="flex-1 border-2 border-[#8B6B3E] text-[#8B6B3E] py-3 rounded-full font-bold text-lg shadow-xl hover:bg-[#8B6B3E] hover:text-white transition-all duration-200">
              Buy Now
            </button>
          </div>
          {/* Delivery Info */}
          <div className="mt-8 flex flex-col gap-3 text-base text-[#8B6B3E]/80 bg-[#fff9f3] rounded-2xl p-6 border border-[#e2c799] shadow">
            <div>
              <span className="font-semibold">🚚 Delivery:</span> Free delivery within 4-7 days across India.
            </div>
            <div>
              <span className="font-semibold">🔄 Returns:</span> Easy 7-day return & exchange policy.
            </div>
            <div>
              <span className="font-semibold">🔒 Secure Payment:</span> 100% secure payment gateway.
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;