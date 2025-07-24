// import { useEffect, useState } from 'react';
// import { FaHeart, FaStar } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const toastStyle = {
//   style: {
//     background: '#fffaf5',
//     color: '#8B6B3E',
//     borderLeft: '6px solid #e2c799',
//     fontFamily: 'Poppins, sans-serif',
//     fontSize: '15px',
//     borderRadius: '12px',
//     boxShadow: '0 4px 24px 0 rgba(139,107,62,0.08)',
//     minWidth: '220px'
//   },
//   progressStyle: { background: '#e2c799' },
//   icon: false
// };

// const SuccessCartToast = () => (
//   <div className="flex flex-col items-center justify-center py-2 px-2">
//     <div className="rounded-full border-4 border-green-200 mb-2 flex items-center justify-center" style={{ width: 48, height: 48 }}>
//       <svg className="text-green-500" width="40" height="40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 00-1.414-1.414z" clipRule="evenodd" /></svg>
//     </div>
//     <div className="font-bold text-lg text-[#8B6B3E] mb-1">Added To The Cart!</div>
//     <div className="text-sm text-gray-500">Proceed to checkout?</div>
//   </div>
// );

// const FamousProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch('http://localhost:3000/api/products');
//       const data = await res.json();

//       if (Array.isArray(data)) {
//         setProducts(data);
//       } else if (data?.products?.length) {
//         setProducts(data.products);
//       } else if (data?.data?.length) {
//         setProducts(data.data);
//       } else {
//         throw new Error('Invalid product data format');
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddToCart = async (product) => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       toast.error("Please log in to add to cart", {
//         ...toastStyle,
//         position: "top-center",
//         autoClose: 2500,
//       });
//       return;
//     }

//     let sizeToSend = null;
//     if (product.sizes?.length) {
//       const available = product.sizes.find(s => s.stock > 0 && s.size?.trim());
//       sizeToSend = available?.size || product.sizes.find(s => s.size?.trim())?.size || null;
//     }

//     try {
//       const res = await fetch('http://localhost:3000/api/cart/add', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           productId: product._id,
//           qty: 1,
//           color: null,
//           size: sizeToSend || undefined,
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast(<SuccessCartToast />, {
//           ...toastStyle,
//           position: "top-center",
//           autoClose: 2500,
//         });

//         const res2 = await fetch('http://localhost:3000/api/cart', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const cartData = await res2.json();
//         if (cartData.success) {
//           localStorage.setItem('cartCount', cartData.cart.items.length);
//           window.dispatchEvent(new Event('cartUpdated'));
//         }
//       } else if (data.message?.toLowerCase().includes('already')) {
//         toast.info('Already added to cart!', {
//           position: "top-center",
//           autoClose: 2200,
//           toastId: "cart-already-toast"
//         });
//       } else {
//         toast.error(data.message || 'Failed to add to cart', toastStyle);
//       }
//     } catch (err) {
//       toast.error('Something went wrong', toastStyle);
//     }
//   };

//   if (loading) {
//     return <div className="text-center text-xl py-12 text-[#8B6B3E]">Loading products...</div>;
//   }

//   if (error) {
//     return (
//       <div className="text-center text-red-500 py-12">
//         <p>{error}</p>
//         <button onClick={fetchProducts} className="mt-4 bg-[#8B6B3E] text-white px-4 py-2 rounded">
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <section className="px-4 sm:px-6 py-16 bg-gradient-to-br from-white via-[#FBF6EF] to-[#EBDECD] min-h-screen text-[#8B6B3E]">
//       <h2 className="text-3xl font-extrabold text-center mb-10">
//         Famous Products
//         <span className="block w-28 h-1.5 bg-[#8B6B3E] mx-auto mt-3 rounded-full animate-pulse"></span>
//       </h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {products.map((product) => (
//           <div key={product._id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between group transition-all">
//           <div
//   className="relative w-full h-[360px] overflow-hidden cursor-pointer group"
//   onClick={() => navigate(`/product/${product._id}`)}
// >
//   <img
//     src={`http://localhost:3000/uploads/${product.image}`}
//     alt={product.title}
//     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//   />
//   <button
//     className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 z-10"
//     onClick={(e) => e.stopPropagation()}
//   >
//     <FaHeart size={22} />
//   </button>
// </div>
//             <div className="p-4 bg-gradient-to-t from-amber-50/50 to-white space-y-1">
//               <h3 className="text-md font-semibold truncate">{product.title}</h3>
//               <p className="text-sm text-gray-700"><b>Fabric:</b> {product.fabric}</p>
//               <p className="text-sm text-gray-700"><b>Price:</b> <span className="text-emerald-600 font-semibold">Rs. {product.price}</span></p>
//               <div className="flex items-center gap-1.5">
//                 <span className="text-sm text-gray-700">Rating:</span>
//                 {Array.from({ length: product.rating || 0 }).map((_, i) => (
//                   <FaStar key={`r-${i}`} className="text-yellow-400 text-base" />
//                 ))}
//                 {Array.from({ length: 5 - (product.rating || 0) }).map((_, i) => (
//                   <FaStar key={`e-${i}`} className="text-gray-300 text-base" />
//                 ))}
//               </div>
//               <div className="flex justify-between items-center gap-2 pt-2">
//                <button
//   className="w-1/2 border-2 border-[#8B6B3E] text-[#8B6B3E] py-1 rounded-full font-medium hover:bg-[#8B6B3E] hover:text-white transition-colors duration-200"
//   onClick={() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       toast.error("Please log in to buy this product", {
//         ...toastStyle,
//         position: "top-center",
//         autoClose: 2500,
//         closeOnClick: true,
//         hideProgressBar: false,
//         icon: false,
//       });
//       return;
//     }

//     // If logged in, navigate to product page
//     navigate(`/product/${product._id}`);
//   }}
// >
//   Buy Now
// </button>
//                 <button
//                   onClick={() => handleAddToCart(product)}
//                   className="w-1/2 bg-[#8B6B3E] text-white py-1 rounded-full hover:bg-[#704F2E] transition"
//                 >
//                   Add to Cart
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <ToastContainer />
//     </section>
//   );
// };

// export default FamousProducts;
import { useEffect, useState } from 'react';
import { FaHeart, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastStyle = {
  style: {
    background: '#fffaf5',
    color: '#540b0e',
    borderLeft: '6px solid #e2c799',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '15px',
    borderRadius: '12px',
    boxShadow: '0 4px 24px 0 rgba(139,107,62,0.08)',
    minWidth: '220px'
  },
  progressStyle: { background: '#e2c799' },
  icon: false
};

const SuccessCartToast = () => (
  <div className="flex flex-col items-center justify-center py-2 px-2">
    <div className="rounded-full border-4 border-green-200 mb-2 flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <svg className="text-green-500" width="40" height="40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 00-1.414-1.414z" clipRule="evenodd" /></svg>
    </div>
    <div className="font-bold text-lg text-[#8B6B3E] mb-1">Added To The Cart!</div>
   <div className="font-bold text-lg text-[#540b0e] mb-1">Added To The Cart!</div>
    <div className="text-sm text-gray-500">Proceed to checkout?</div>
  </div>
);

const FamousProducts = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
    if (user && token) fetchFavorites();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data?.products?.length) {
        setProducts(data.products);
      } else if (data?.data?.length) {
        setProducts(data.data);
      } else {
        throw new Error('Invalid product data format');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/users/favorites`, {
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

  const handleFavorite = async (productId, isFav) => {
    if (!user || !token) {
      toast.error("Please log in to use favorites", toastStyle);
      return;
    }

    const url = isFav
      ? 'http://localhost:3000/api/favorites/remove'
      : 'http://localhost:3000/api/favorites/add';

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
      localStorage.setItem('favoritesCount', updatedFavorites.length);
      window.dispatchEvent(new Event('favoritesUpdated'));

      toast[isFav ? "info" : "success"](
        isFav ? "Removed from Favourites" : "Added to Favourites",
        toastStyle
      );
    } else {
      toast.error(data.message || "Failed to update favorite", toastStyle);
    }
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      toast.error("Please log in to add to cart", {
        ...toastStyle,
        position: "top-center",
        autoClose: 2500,
      });
      return;
    }

    let sizeToSend = null;
    if (product.sizes?.length) {
      const available = product.sizes.find(s => s.stock > 0 && s.size?.trim());
      sizeToSend = available?.size || product.sizes.find(s => s.size?.trim())?.size || null;
    }

    try {
      const res = await fetch('http://localhost:3000/api/cart/add', {
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
        toast(<SuccessCartToast />, {
          ...toastStyle,
          position: "top-center",
          autoClose: 2500,
        });

        const res2 = await fetch('http://localhost:3000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = await res2.json();
        if (cartData.success) {
          localStorage.setItem('cartCount', cartData.cart.items.length);
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } else if (data.message?.toLowerCase().includes('already')) {
        toast.info('Already added to cart!', {
          position: "top-center",
          autoClose: 2200,
          toastId: "cart-already-toast"
        });
      } else {
        toast.error(data.message || 'Failed to add to cart', toastStyle);
      }
    } catch (err) {
      toast.error('Something went wrong', toastStyle);
    }
  };

  if (loading) {
    return <div className="text-center text-xl py-12 text-[#540b0e]">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>{error}</p>
        <button onClick={fetchProducts} className="mt-4 bg-[#540b0e] text-white px-4 py-2 rounded">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-6 py-16 bg-gradient-to-br from-white via-[#FBF6EF] to-[#EBDECD] min-h-screen text-[#540b0e]">
      <h2 className="text-4xl font-extrabold text-center mb-12 tracking-wide drop-shadow-lg">
        Famous Products
        <span className="block w-32 h-1.5 bg-[#540b0e] mx-auto mt-3 rounded-full animate-pulse"></span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product, idx) => (
          <div
            key={product._id}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-2 hover:shadow-amber-200/40 border-2 border-[#e2c799]/30 relative"
          >
            {/* Badge for new/featured */}
            {(idx < 4) && (
              <span className="absolute top-4 left-4 bg-[#540b0e] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 animate-pulse">Featured</span>
            )}
            <div
              className="relative w-full h-[300px] overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img
                src={`http://localhost:3000/uploads/${product.image}`}
                alt={product.title}
                className="w-full h-full object-cover rounded-t-3xl group-hover:scale-110 group-hover:brightness-105 transition-transform duration-300 border-b-2 border-[#e2c799]/30"
              />
              <button
                className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-lg border border-[#e2c799]/40 z-20 hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(product._id, favorites.includes(String(product._id)));
                }}
              >
                <FaHeart
                  size={22}
                  color={favorites.includes(String(product._id)) ? "#b91c1c" : "#fca5a5"}
                />
              </button>
            </div>
            <div className="p-5 bg-gradient-to-t from-[#e2c799]/10 to-white space-y-2 rounded-b-3xl">
              <h3 className="text-lg font-bold truncate text-[#540b0e]">{product.title}</h3>
              <p className="text-sm text-gray-700"><span className="font-semibold">Fabric:</span> {product.fabric}</p>
              <p className="text-sm text-gray-700"><span className="font-semibold">Price:</span> <span className="text-emerald-600 font-bold">Rs. {product.price}</span></p>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">Rating:</span>
                {Array.from({ length: product.rating || 0 }).map((_, i) => (
                  <FaStar key={`r-${i}`} className="text-yellow-400 text-base" />
                ))}
                {Array.from({ length: 5 - (product.rating || 0) }).map((_, i) => (
                  <FaStar key={`e-${i}`} className="text-gray-300 text-base" />
                ))}
              </div>
              <div className="flex justify-between items-center gap-2 pt-3">
                <button
                  className="w-1/2 border-2 border-[#540b0e] text-[#540b0e] py-2 rounded-full font-bold hover:bg-[#540b0e] hover:text-white transition-colors duration-200 shadow-md"
                  onClick={() => {
                    if (!token) {
                      toast.error("Please log in to buy this product", toastStyle);
                      return;
                    }
                    navigate(`/product/${product._id}`);
                  }}
                >
                  Buy Now
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-1/2 bg-[#540b0e] text-white py-2 rounded-full font-bold hover:bg-[#704F2E] transition shadow-md"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </section>
  );
};

export default FamousProducts;
