import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaHeart, FaStar, FaTrashAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/footer';
import Navbar from '../components/nav';
import RealtimeVirtualTryOn from '../components/RealtimeVirtualTryOn';

import mainImg from '../assets/images/detail.png';
import img1 from '../assets/images/detail1.png';
import img2 from '../assets/images/detail2.png';
import img3 from '../assets/images/detail3.png';

const SuccessCartToast = () => (
  <div className="flex flex-col items-center justify-center py-2 px-2">
    <div className="rounded-full border-4 border-green-200 mb-2 flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <FaCheckCircle className="text-green-500" size={40} />
    </div>
    <div className="font-bold text-lg text-[#540b0e] mb-1">Added To The Cart !</div>
    <div className="text-sm text-gray-500">Proceed to checkout?</div>
  </div>
);

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Added missing state
  const [error, setError] = useState(null); // Added missing state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [allReviews, setAllReviews] = useState([]);
  const [userId, setUserId] = useState(null);
  const [editReviewId, setEditReviewId] = useState(null);
  const [isVirtualTryOnOpen, setIsVirtualTryOnOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://localhost:3000/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
        setSelectedImage(`https://localhost:3000/uploads/${data.image}`);
        setSelectedColor(data.colors?.[0] || '');
        setSelectedSize(data.sizes?.[0]?.size || '');
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
         const res = await fetch(`https://localhost:3000/api/products/${id}`);
        const data = await res.json();
        setAllReviews(data.reviews || data); // Adjusted to handle response structure
      } catch {
        toast.error('Failed to load reviews');
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch('https://localhost:3000/api/products');
        const data = await res.json();
        if (Array.isArray(data)) {
          setRelatedProducts(data.filter(p => p._id !== id).slice(0, 4));
        }
      } catch {
        console.error('Failed to fetch related products');
      }
    };

    fetchProduct();
    fetchReviews();
    fetchRelatedProducts();
  }, [id]);

  const getStockForSize = (size) => {
    const sizeObj = product?.sizes?.find(s => s.size === size);
    return sizeObj?.stock || 0;
  };

  const handleAddToCart = async (prod = product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add to cart.');
      return;
    }

    const selectedStock = getStockForSize(selectedSize);
    if (quantity > selectedStock) {
      toast.error(`Only ${selectedStock} items available in stock`);
      return;
    }

    const res = await fetch('https://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: prod._id,
        qty: prod === product ? quantity : 1,
        color: prod === product ? selectedColor : null,
        size: prod === product ? selectedSize : null,
      }),
    });

    const data = await res.json();
    if (data.success) {
      toast(<SuccessCartToast />, {
        position: "top-center",
        autoClose: 1200,
        closeOnClick: true,
        hideProgressBar: false,
        icon: false,
      });

      const res2 = await fetch('https://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await res2.json();
      if (cartData.success) {
        localStorage.setItem('cartCount', cartData.cart.items.length);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } else {
      toast.error(data.message || 'Failed to add to cart');
    }
  };

  const handleBuyNowPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to make a payment', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        icon: false,
      });
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.warn('Please select size and color before proceeding', {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(
        'https://localhost:3000/api/payment/initiate',
        {
          mode: 'buy-now',
          productId: product._id,
          qty: quantity,
          color: selectedColor,
          size: selectedSize,
          return_url: 'https://localhost:5173/payment-status',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  const handleReviewSubmit = async () => {
  const token = localStorage.getItem('token');
  if (!token) return toast.error("Please log in to submit a review");
  if (!reviewRating || !reviewText.trim()) return toast.warn("Please add a rating and comment");

  try {
    const res = await fetch(`https://localhost:3000/api/reviews/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: reviewRating, comment: reviewText })
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");

    const data = isJson ? await res.json() : { message: 'Invalid server response' };

    if (res.ok) {
      toast.success("Review submitted");
      setAllReviews(prev => [...prev, data]);
      setReviewRating(0);
      setReviewText('');
    } else {
      toast.error(data.message || 'Failed to submit review');
    }
  } catch (err) {
    console.error('Review submission error:', err.message);
    toast.error("Something went wrong");
  }
};


  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`https://localhost:3000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const increaseQty = () => {
    const selectedStock = getStockForSize(selectedSize);
    if (quantity < selectedStock) {
      setQuantity(prev => prev + 1);
    } else {
      toast.warn(`Only ${selectedStock} items available`);
    }
  };

  const colors = product?.colors || [];
  const sizes = product?.sizes?.map(s => s.size) || [];
  const thumbnails = product
    ? [
        `https://localhost:3000/uploads/${product.image}`,
        ...(product.images ? product.images.map(img => `https://localhost:3000/uploads/${img}`) : [])
      ]
    : [mainImg, img1, img2, img3];

  if (loading) return <div className="text-center py-10 text-[#540b0e]">Loading product details...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!product) return null;

  return (
    <div className="bg-[#FFFBF7] text-[#540b0e] min-h-screen">
      <Navbar />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        toastClassName="!text-sm !py-2 !px-4"
      />

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-5 py-15 mt- grid grid-cols-1 md:grid-cols-2 gap-40 items-start">
        {/* Left Side */}
        <div className="flex flex-col items-center space-y-6 w-full">
          <img src={selectedImage} alt="Selected" className="w-full h-[600px] object-cover rounded-xl shadow-md" />
          <div className="flex gap-4 flex-wrap justify-center">
            {thumbnails.map((img, index) => (
              <img
                key={index}
                src={img}
                onClick={() => setSelectedImage(img)}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer shadow-sm hover:ring-2 hover:ring-[#540b0e] ${
                  selectedImage === img ? 'ring-4 ring-[#540b0e]' : ''
                }`}
                alt={`thumb-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">{product.title}</h2>
          <p className="text-sm">{product.fabric}</p>
          <p className="text-green-700 text-xl font-bold">Price: Rs. {product.price}</p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-md">Rating:</span>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < product.rating ? 'text-yellow-400' : 'text-gray-300'} />
            ))}
          </div>

          {/* Colors */}
          <div>
            <span className="block font-medium mb-2">Colors:</span>
            <div className="flex gap-4">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    selectedColor === color ? 'border-[#4B371C]' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <span className="block font-medium mb-2 mt-2">Sizes:</span>
            <div className="flex gap-3 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                  }}
                  className={`px-4 py-2 border rounded-md text-sm ${
                    selectedSize === size
                      ? 'bg-[#540b0e] text-white border-[#540b0e]'
                      : 'hover:bg-[#540b0e] hover:text-white border-[#ddd]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => {
                  if (!selectedSize) {
                    toast.warn("Please select a size first");
                    return;
                  }
                  if (quantity > 1) {
                    setQuantity(prev => prev - 1);
                  } else {
                    toast.info("Minimum quantity is 1");
                  }
                }}
                className="px-4 py-2"
              >
                -
              </button>
              <span className="px-5">{quantity}</span>
              <button
                onClick={() => {
                  if (!selectedSize) {
                    toast.warn("Please select a size first");
                    return;
                  }
                  const stock = getStockForSize(selectedSize);
                  if (quantity < stock) {
                    setQuantity(prev => prev + 1);
                  } else {
                    toast.warn(`Only ${stock} item(s) available`);
                  }
                }}
                className="px-4 py-2"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-6 mt-6 flex-wrap items-center">
            <button
              className="w-56 h-12 bg-[#540b0e] text-white rounded-full font-semibold text-lg flex items-center justify-center transition-all duration-200 hover:bg-[#6a5027]"
              onClick={() => handleAddToCart()}
            >
              Add To Cart
            </button>
            <button
              className="w-56 h-12 border-2 border-[#540b0e] text-[#540b0e] rounded-full font-semibold text-lg flex items-center justify-center transition-all duration-200 hover:bg-[#540b0e] hover:text-white bg-white"
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) {
                  toast.error('Please log in to make a payment', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    icon: false,
                  });
                  return;
                }
                navigate('/payment', {
                  state: {
                    product: {
                      _id: product._id,
                      name: product.title,
                      price: product.price,
                      quantity,
                      size: selectedSize,
                      color: selectedColor,
                    },
                  },
                });
              }}
            >
              Proceed to Payment
            </button>
          </div>

          <button 
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
            onClick={() => setIsVirtualTryOnOpen(true)}
          >
            <span>🎥</span>
            Live Virtual Try-On
            <span>✨</span>
          </button>
        </div>
      </div>

      {/* Review submission */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <h2 className="text-xl font-bold mb-3">Leave a Review</h2>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              onClick={() => setReviewRating(star)}
              className={`cursor-pointer text-xl ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review..."
          className="w-full p-3 border border-[#540b0e] rounded-lg mb-3"
          rows={4}
        />
        <button
          onClick={handleReviewSubmit}
          className="bg-[#540b0e] text-white px-5 py-2 rounded hover:bg-[#704F2E]"
        >
          Submit Review
        </button>
      </div>

      {/* Display Reviews */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
        {allReviews.length === 0 ? <p>No reviews yet.</p> : (
          <div className="grid gap-4">
            {allReviews.map((r) => (
              <div key={r._id} className="bg-white border border-[#E8DCC3] rounded-xl p-4 shadow relative">
                <div className="flex items-center mb-1 justify-between">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(i => (
                      <FaStar
                        key={i}
                        className={`text-sm ${i <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">by {r.userId?.fullName || 'Anonymous'}</span>
                  </div>
                  {userId === r.userId?._id && (
                    <div className="flex gap-2">
                      <button
                        className="text-sm text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteReview(r._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* You May Also Like */}
      <section className="pt-12 pb-20 bg-[#FFFBF7] text-[#540b0e]">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-10 text-center">
          You May Also Like
          <span className="block w-24 h-1 bg-[#540b0e] mx-auto mt-2 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-[95%] mx-auto">
          {relatedProducts.map((prod) => (
            <div
              key={prod._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#f0e2ca] relative transition hover:shadow-xl"
            >
              {/* Fixed Heart Icon */}
              <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow z-10">
                <FaHeart className="text-red-300" size={20} />
              </div>

              {/* Image Container */}
              <div className="w-full h-72 overflow-hidden relative z-0">
                <img
                  src={`https://localhost:3000/uploads/${prod.image}`}
                  alt={prod.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-1">
                <h3 className="text-md font-semibold text-[#540b0e]">{prod.title}</h3>
                <p className="text-sm text-gray-700">
                  <b>Fabric:</b> {prod.fabric}
                </p>
                <p className="text-sm text-gray-700">
                  <b>Price:</b> <span className="text-green-600">Rs. {prod.price}</span>
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <b>Rating:</b>
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-sm ${i < prod.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </p>

                {/* Buttons */}
                <div className="flex justify-between mt-3 gap-2">
                  <button
                    className="w-1/2 text-sm border border-[#540b0e] text-[#540b0e] rounded-full py-1 hover:bg-[#540b0e] hover:text-white"
                    onClick={() => navigate(`/product/${prod._id}`)}
                  >
                    Buy Now
                  </button>
                  <button
                    className="w-1/2 text-sm bg-[#540b0e] text-white rounded-full py-1 hover:bg-[#704F2E]"
                    onClick={() => handleAddToCart(prod)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      
      {/* Real-time Virtual Try-On Modal */}
      {product && (
        <RealtimeVirtualTryOn
          isOpen={isVirtualTryOnOpen}
          onClose={() => setIsVirtualTryOnOpen(false)}
          productImage={selectedImage}
          productTitle={product.title}
          clothingType={product.category?.name || 'shirt'}
        />
      )}
    </div>
  );
};

export default ProductDetail;