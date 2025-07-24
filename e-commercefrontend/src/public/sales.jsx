// import React, { useEffect, useState } from 'react';
// import Navbar from '../components/nav';
// import Footer from '../components/footer';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import home3Img from '../assets/images/home3.png';
// import fusionImg from '../assets/images/fusion.png';
// import about3Img from '../assets/images/about3.png';
// import fav1Img from '../assets/images/fav1.png';
// import home4Img from '../assets/images/home4.png';

// const heroImages = [home3Img, fusionImg, about3Img, fav1Img, home4Img];

// const Sales = () => {
//   const [currentHero, setCurrentHero] = useState(0);
//   const [products, setProducts] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentHero((prev) => (prev + 1) % heroImages.length);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     // Fetch products for featured deals
//     const fetchProducts = async () => {
//       try {
//         const res = await fetch('http://localhost:3000/api/products');
//         const data = await res.json();
//         setProducts(data.slice(0, 8)); // Show only first 8 as featured
//       } catch (err) {
//         setProducts([]);
//       }
//     };
//     fetchProducts();
//   }, []);

//   // Helper to generate a fake old price (30% higher, rounded to nearest 100)
//   const getFakeOldPrice = (realPrice) => {
//     if (!realPrice) return '';
//     return Math.round((realPrice * 1.3) / 100) * 100;
//   };

//   return (
//     <div className="min-h-screen flex flex-col text-[#5a4632] relative overflow-x-hidden">
//       <Navbar />
//       {/* Hero Section - Text part bigger, image part smaller */}
//       <section className="w-full flex flex-col md:flex-row items-stretch justify-between px-0 md:px-0 min-h-[520px] h-[520px]" style={{background: 'linear-gradient(90deg, #f5eee6 0%, #e2c799 100%)'}}>
//         {/* Left: Up to 50% Off, Text, Button (w-3/5) */}
//         <div className="w-full md:w-3/5 flex flex-col justify-center items-center md:items-start gap-4 max-w-2xl px-4 md:px-16">
//           <div className="w-full mb-2 flex items-center">
//             <span className="block text-2xl md:text-4xl font-extrabold tracking-wider text-[#bfa06a] shadow-md px-6 py-2 rounded-full bg-[#f8ecd7] border border-[#e2c799] uppercase" style={{letterSpacing: '0.12em', boxShadow: '0 2px 12px 0 #e2c79955'}}>UP TO 50% OFF</span>
//           </div>
//           <h1 className="uppercase text-4xl md:text-5xl font-extrabold text-[#7c5a2e] mb-1 tracking-widest leading-tight">SALE SALE SALE</h1>
//           <p className="text-[#5a4632] text-lg md:text-xl mb-2 max-w-md text-center md:text-left font-medium italic">Step into style. Discover exclusive deals on our bestsellers.</p>
//           <button className="bg-[#a67c52] text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-[#7c5a2e] transition-all mt-2 text-lg tracking-wide" style={{boxShadow: '0 2px 8px 0 rgba(166,124,82,0.10)'}}>Shop Now</button>
//         </div>
//         {/* Right: Full Image (w-2/5, full height) */}
//         <div className="w-full md:w-2/5 h-72 md:h-full flex-shrink-0 flex-grow-0 relative flex items-center justify-center">
//           <img
//             src={heroImages[currentHero]}
//             alt="Sale Model"
//             className="w-full h-full object-cover object-center border-l-8 border-[#e2c799] rounded-l-3xl shadow-xl"
//             style={{ boxShadow: '0 8px 32px 0 rgba(166,124,82,0.15)' }}
//           />
//           {/* Optional: Soft overlay for contrast */}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent pointer-events-none" />
//         </div>
//       </section>
//       {/* Featured Products Grid - White Background */}
//       <section className="relative z-10 px-0 sm:px-2 py-12 md:py-16 w-full bg-white">
//         {/* <h2 className="text-2xl md:text-4xl font-bold text-center mb-12 text-[#7c5a2e] tracking-wide relative">
//           Featured Deals
//           <span className="block w-32 h-1.5 bg-[#bfa06a] mx-auto mt-2 rounded-full animate-pulse"></span>
//         </h2> */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
//           {products.length === 0 ? (
//             <p className="text-center text-gray-400 col-span-full">No featured deals found.</p>
//           ) : (
//             products.map((product) => (
//               <div
//                 key={product._id}
//                 className="relative bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between border border-[#e2c799] group transition-transform hover:-translate-y-2 hover:shadow-2xl"
//               >
//                 {/* Discount Badge */}
//                 <div className="absolute top-4 left-4 z-10 bg-[#bfa06a] text-white px-5 py-1.5 rounded-full text-base font-bold shadow-md">
//                   -{Math.round(((getFakeOldPrice(product.price) - product.price) / getFakeOldPrice(product.price)) * 100)}%
//                 </div>
//                 <div className="relative w-full h-[380px] overflow-hidden cursor-pointer flex items-center justify-center" onClick={() => navigate(`/product/${product._id}`)}>
//                   <img
//                     src={`http://localhost:3000/uploads/${product.image}`}
//                     alt={product.title}
//                     className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
//                   />
//                 </div>
//                 <div className="p-4 flex flex-col justify-between flex-1">
//                   <h3 className="text-md font-semibold text-[#7c5a2e] truncate mb-2">{product.title}</h3>
//                   <div className="flex items-end gap-3 mb-4">
//                     <span className="text-lg font-bold text-[#e53935] line-through">
//                       Rs. {getFakeOldPrice(product.price)}
//                     </span>
//                     <span className="text-2xl font-extrabold text-emerald-600">
//                       Rs. {product.price}
//                     </span>
//                   </div>
//                   <button
//                     className="w-full mt-auto bg-[#a67c52] text-white font-bold py-2.5 rounded-full shadow hover:bg-[#7c5a2e] transition-all text-base"
//                     onClick={() => navigate(`/product/${product._id}`)}
//                   >
//                     Shop Now
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </section>
//       <Footer />
//     </div>
//   );
// };

// export default Sales;
// Sales.jsx - Updated to fetch from /api/sales and render sale products
// Sales.jsx - Updated with Buy Now (Payment) and color indicators
// Sales.jsx - Updated with Buy Now (Payment) and color indicators
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import about3Img from '../assets/images/about3.png';
import fav1Img from '../assets/images/fav1.png';
import fusionImg from '../assets/images/fusion.png';
import home3Img from '../assets/images/home3.png';
import home4Img from '../assets/images/home4.png';
import Footer from '../components/footer';
import Navbar from '../components/nav';

const heroImages = [home3Img, fusionImg, about3Img, fav1Img, home4Img];

const Sales = () => {
  const [currentHero, setCurrentHero] = useState(0);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/sales');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        toast.error('Failed to fetch sale products.');
        setProducts([]);
      }
    };
    fetchSales();
  }, []);

  const getDiscountPercent = (original, sale) => {
    return Math.round(((original - sale) / original) * 100);
  };

  const goToPayment = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in first');
      return;
    }
    navigate('/payment', { state: { product, qty: 1, fromSales: true } });
  };

  return (
    <div className="min-h-screen flex flex-col text-[#540b0e] relative overflow-x-hidden">
      <Navbar />
      <section className="w-full flex flex-col lg:flex-row items-stretch justify-between px-0 min-h-[500px] h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-r from-[#fdf8f1] to-[#f0d8a8] rounded-2xl shadow-xl">
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start gap-6 max-w-3xl px-4 sm:px-8 lg:px-16 py-8">
          <div className="w-fit mb-4 animate-slide-up">
            <span className="block text-xl sm:text-2xl lg:text-3xl font-bold tracking-widest text-[#540b0e] bg-[#fffaf0] border border-[#e6d3a3] px-8 py-3 rounded-lg uppercase shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1" 
                  style={{ letterSpacing: '0.15em', boxShadow: '0 6px 20px rgba(184,151,120,0.3)' }}>
              UP TO 60% OFF
            </span>
          </div>
          <h1 className="uppercase text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#540b0e] tracking-widest leading-tight animate-slide-up delay-100 drop-shadow-md">
            WINTER CLEARANCE
          </h1>
          <p className="text-[#540b0e] text-base sm:text-lg lg:text-xl max-w-lg text-center lg:text-left font-medium italic animate-slide-up delay-200">
            Elevate your wardrobe with exclusive deals on our premium collections.
          </p>
          <button className="bg-[#540b0e] text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-[#3a0708] transition-all mt-2 text-lg tracking-wide animate-slide-up delay-300" style={{boxShadow: '0 2px 8px 0 rgba(84,11,14,0.10)'}}>Shop Now</button>
        </div>
        <div className="w-full lg:w-1/2 h-[300px] lg:h-full relative flex items-center justify-center">
          <img
            src={heroImages[currentHero]}
            alt={`Sale Model ${currentHero + 1}`}
            className="w-full h-full object-cover object-center border-l-4 border-[#540b0e] rounded-r-2xl shadow-2xl transition-opacity duration-500"
            style={{ boxShadow: '0 15px 50px rgba(184,151,120,0.3)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#5c4033]/30 via-[#5c4033]/10 to-transparent pointer-events-none rounded-r-2xl" />
          <div className="absolute bottom-6 right-6 flex gap-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full ${index === currentHero ? 'bg-[#540b0e] scale-110' : 'bg-[#d9c3a5]'} transition-all duration-300 border border-[#540b0e] hover:bg-[#a67c52]`}
                onClick={() => setCurrentHero(index)}
                style={{ boxShadow: index === currentHero ? '0 0 8px rgba(212,160,23,0.5)' : 'none' }}
              />
            ))}
          </div>
        </div>
      </section>
      {/* Sale Products Section */}
      <section className="relative z-10 px-0 sm:px-2 py-12 md:py-16 w-full bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {products.length === 0 ? (
            <p className="text-center text-gray-400 col-span-full">No sale products available.</p>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="relative bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between border border-[#e2c799] group transition-transform hover:-translate-y-2 hover:shadow-2xl"
              >
                {product.originalPrice && (
                  <div className="absolute top-4 left-4 z-10 bg-[#540b0e] text-white px-5 py-1.5 rounded-full text-base font-bold shadow-md">
                    -{getDiscountPercent(product.originalPrice, product.price)}%
                  </div>
                )}
                <div
                  className="relative w-full h-[380px] overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={`http://localhost:3000/uploads/${product.image}`}
                    alt={product.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <h3 className="text-md font-semibold text-[#7c5a2e] truncate mb-1">{product.title}</h3>
                  {product.colors?.length > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">Colors:</span>
                      {product.colors.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color === 'red' ? 'red' : color }}
                        />
                      ))}
                    </div>
                  )}
                  {product.sizes?.length > 0 && (
                    <p className="text-sm text-gray-600 mb-1">Sizes: {product.sizes.join(', ')}</p>
                  )}
                  <div className="flex items-end gap-3 mb-4">
                    {product.originalPrice && (
                      <span className="text-lg font-bold text-[#e53935] line-through">
                        Rs. {product.originalPrice}
                      </span>
                    )}
                    <span className="text-2xl font-extrabold text-emerald-600">
                      Rs. {product.price}
                    </span>
                  </div>
                  <button
                    className="w-full mt-auto bg-[#540b0e] text-white font-bold py-2.5 rounded-full shadow hover:bg-[#3a0708] transition-all text-base"
                    onClick={() => goToPayment(product)}
                  >
                    Buy Now
                  </button>
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

export default Sales;
