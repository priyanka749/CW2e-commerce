import { useEffect, useState } from 'react';
import { FaComments, FaHeart, FaShoppingBag, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import Chat from '../public/chat'; // Your Chat component

const BASE_URL = 'https://localhost:3000';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [cartCount, setCartCount] = useState(Number(localStorage.getItem('cartCount')) || 0);
  const [favoritesCount, setFavoritesCount] = useState(() => parseInt(localStorage.getItem('favoritesCount')) || 0);
  const [isFavoritesPage, setIsFavoritesPage] = useState(false); // Track if we're on the favorites page
  const [favBadge, setFavBadge] = useState(0);

  // Listen for updates to the favorites count
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      const updatedFavoritesCount = parseInt(localStorage.getItem('favoritesCount')) || 0;
      setFavoritesCount(updatedFavoritesCount);
    };

    // Event listener for updating favorites count
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (parsed && parsed._id) {
        setLoading(true);
        fetch(`${BASE_URL}/api/users/${parsed._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && !data.message) {
              setUser(data);
              localStorage.setItem('user', JSON.stringify(data));
              // Update favorites count
              setFavoritesCount(data.favorites.length); // Assuming 'favorites' is an array in the user data
              localStorage.setItem('favoritesCount', data.favorites.length); // Save to localStorage
            }
            setLoading(false);
          })
          .catch(() => {
            setError('Failed to fetch user');
            setLoading(false);
          });
      }
    }
  }, []);

useEffect(() => {
  const handleCartUpdate = () => {
    const updatedCartCount = Number(localStorage.getItem('cartCount')) || 0;
    setCartCount(updatedCartCount);
  };

  window.addEventListener('cartUpdated', handleCartUpdate);

  return () => {
    window.removeEventListener('cartUpdated', handleCartUpdate);
  };
}, []);

useEffect(() => {
  const handleFavoritesUpdate = () => {
    const updatedFavoritesCount = parseInt(localStorage.getItem('favoritesCount')) || 0;
    const seen = Number(localStorage.getItem('favoritesSeenCount')) || 0;
    setFavoritesCount(updatedFavoritesCount);
    setFavBadge(Math.max(0, updatedFavoritesCount - seen));
  };

  // 🔁 Listen + update on first render
  window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
  handleFavoritesUpdate(); // run once initially

  return () => {
    window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  };
}, []);



 const handleNavigateToFavorites = () => {
  const count = parseInt(localStorage.getItem('favoritesCount')) || 0;
  localStorage.setItem('favoritesSeenCount', count);
  window.dispatchEvent(new Event('favoritesUpdated')); // update badge to 0
  navigate('/favourite');
};


  // Add item to favorites (simulate add to favorites functionality)
  const handleAddToFavorites = () => {
    setFavoritesCount(prevCount => {
      const newCount = prevCount + 1;
      localStorage.setItem('favoritesCount', newCount); // Store updated count in localStorage
      window.dispatchEvent(new Event('favoritesUpdated')); // Trigger the event to update Navbar
      return newCount;
    });
  };

  // Remove item from favorites (simulate remove from favorites functionality)
  const handleRemoveFromFavorites = () => {
    setFavoritesCount(prevCount => {
      const newCount = prevCount - 1;
      localStorage.setItem('favoritesCount', newCount); // Store updated count in localStorage
      window.dispatchEvent(new Event('favoritesUpdated')); // Trigger the event to update Navbar
      return newCount;
    });
  };

  return (
    <>
      <div className="w-full h-25 flex justify-between items-center bg-[#540b0e] shadow-lg px-10 py-3 rounded-b-3xl border-b-4 border-[#e2c799]">
        {/* Logo */}
        <div className="flex items-center gap-4 -ml-2">
          <img
            src={logo}
            alt="Logo"
            className="h-16 w-16 object-cover cursor-pointer"
            onClick={() => navigate('/home')}
          />
        </div>

        {/* Center Links */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-12 text-white font-bold text-base">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/sales')}>Sales & Offers</span>
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/products')}>Products</span>
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/about')}>About</span>
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/new-arrivals')}>New Arrivals</span>
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/try-on')}>TryOn</span>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex gap-4 items-center text-white text-lg">
          {/* Chat */}
          <FaComments className="cursor-pointer" title="Chat" onClick={() => setShowChat((prev) => !prev)} />

          {/* Cart with badge */}
          <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
            <FaShoppingBag />
           {localStorage.getItem('token') && cartCount > 0 && (
  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
    {cartCount}
  </span>
)}

          </div>

          {/* User Info */}
          {loading ? (
            <span className="text-sm font-semibold cursor-pointer">Loading...</span>
          ) : error ? (
            <span className="text-sm font-semibold text-red-200 cursor-pointer">Error</span>
          ) : user ? (
            <div className="cursor-pointer" onClick={() => navigate('/profile')}>
              {user.image ? (
                <img
                  src={`${BASE_URL}${user.image}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-white"
                />
              ) : (
                <span className="text-sm font-semibold">{user.fullName || user.name}</span>
              )}
            </div>
          ) : (
            <FaUser className="cursor-pointer" onClick={() => navigate('/signup')} />
          )}

          {/* Favorites with badge */}
          <div className="relative cursor-pointer" onClick={() => window.location.href = '/favourite'}>
            <FaHeart className="text-2xl text-white" />
            {favBadge > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {favBadge}
              </span>
            )}
          </div>
        </div>
      </div>

  

      {/* Chat Toggle */}
      {showChat && <Chat />}
    </>
  );
};

export default Navbar;
