import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from '../assets/images/logo.png';
import signupDefault from '../assets/images/signup.png';
import signup1 from '../assets/images/signup1.png';
import signup2 from '../assets/images/signup2.jpg';

const images = [signup1, signup2, signupDefault];

const Signup = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    lat: '',
    lon: '',
  });

  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const data = await res.json();
          setForm((prev) => ({
            ...prev,
            address: data.display_name || '',
            lat,
            lon
          }));
        } catch {
          toast.error("Reverse geocoding failed.");
        }
      },
      () => {
        setLocationDenied(true);
      }
    );
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (form.address.length > 2 && locationDenied) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${form.address}&format=json&limit=5`);
          const data = await res.json();
          const formatted = data.map(loc => {
            const parts = loc.display_name.split(',').map(p => p.trim());
            return {
              display: parts.slice(0, 3).join(', '),
              lat: loc.lat,
              lon: loc.lon
            };
          });
          setSuggestions(formatted);
        } catch {
          console.error("Error fetching suggestions");
        }
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [form.address, locationDenied]);

  const passwordPolicy = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.';
  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = "Full name is required.";
    if (!form.email) newErrors.email = "Email is required.";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) newErrors.email = "Invalid email format.";
    }
    if (!form.phone) newErrors.phone = "Phone is required.";
    else {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(form.phone)) newErrors.phone = "Phone must be 10 digits.";
    }
    if (!form.address) newErrors.address = "Address is required.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    else {
      // Must contain uppercase, lowercase, number, symbol
      const policyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!policyRegex.test(form.password)) newErrors.password = passwordPolicy;
    }
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm your password.";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // Restrict phone to digits only, max 10
    if (name === 'phone') {
      newValue = newValue.replace(/[^0-9]/g, '').slice(0, 10);
    }
    // Restrict email to valid characters only
    if (name === 'email') {
      // Allow only valid email characters
      newValue = newValue.replace(/[^a-zA-Z0-9@._-]/g, '');
    }
    setForm({ ...form, [name]: newValue });
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSuggestionClick = (suggestion) => {
    setForm(prev => ({
      ...prev,
      address: suggestion.display,
      lat: suggestion.lat,
      lon: suggestion.lon
    }));
    setSuggestions([]);
    setErrors({ ...errors, address: undefined });
  };

  const handleSubmit = async () => {
    const fieldErrors = validate();
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    if (!form.lat || !form.lon) {
      const confirm = window.confirm("You haven't selected a geolocation. Are you sure you want to continue with just the typed address?");
      if (!confirm) return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/users/register', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
        lat: form.lat,
        lon: form.lon
      });
      toast.success("OTP sent to your email.");
      navigate('/otp', { state: { userId: response.data.userId } });
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
    }
  };

  return (
    <div className="bg-white flex items-center justify-center min-h-screen px-4 sm:px-10">
      <ToastContainer />
      <div className="bg-[#FFF9F3] shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-[85rem] min-h-[90vh] relative">

        {/* Branding */}
        <div className="w-full flex items-center px-6 pt-1 md:absolute md:top-2 md:left-0 z-10">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-14 w-14 rounded-full object-contain cursor-pointer" onClick={() => navigate('/home')} />
            <h1 className="text-xl sm:text-2xl font-semibold text-[#540b0e]">Anka Attire</h1>
          </div>
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 pt-24 pb-12">
          <div className="w-full max-w-xl space-y-7">
            {[
              { name: "fullName", type: "text", placeholder: "Full Name", icon: "user" },
              { name: "email", type: "email", placeholder: "Email", icon: "envelope" },
              { name: "phone", type: "tel", placeholder: "Phone Number", icon: "phone" },
              { name: "address", type: "text", placeholder: "Address", icon: "map-marker-alt" },
              { name: "password", type: "password", placeholder: "Password", icon: "lock", id: "password" },
              { name: "confirmPassword", type: "password", placeholder: "Confirm Password", icon: "lock", id: "confirmPassword" }
            ].map((field, i) => {
              const isPassword = field.type === "password";
              return (
                <div className="relative mb-6" key={i}>
                  <input
                    type={isPassword ? (showPasswords[field.id] ? "text" : "password") : field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 text-base border ${errors[field.name] ? 'border-red-500' : 'border-gray-400'} text-gray-800 bg-white rounded-full pl-12 pr-12 focus:outline-none focus:ring-2 ${errors[field.name] ? 'focus:ring-red-500' : 'focus:ring-[#540b0e]'} transition`}
                    autoComplete={field.name === 'password' ? 'new-password' : undefined}
                  />
                  <span className="absolute left-4 top-4 text-gray-500">
                    <i className={`fas fa-${field.icon}`} />
                  </span>
                  {isPassword && (
                    <span className="absolute right-4 top-4 text-gray-500 cursor-pointer" onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [field.id]: !prev[field.id]
                    }))}>
                      <i className={`fas ${showPasswords[field.id] ? "fa-eye" : "fa-eye-slash"}`} />
                    </span>
                  )}
                  {field.name === "password" && (
                    <div className={`text-xs mt-1 ml-2 ${form.password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password) ? 'text-green-600' : 'text-[#540b0e]'}`}>
                      {passwordPolicy}
                    </div>
                  )}
                  {field.name === "address" && suggestions.length > 0 && (
                    <ul className="absolute z-20 bg-white border mt-2 rounded-md w-full shadow-lg max-h-40 overflow-y-auto">
                      {suggestions.map((s, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {s.display}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors[field.name] && (
                    <div className="text-xs text-red-600 mt-1 ml-2">{errors[field.name]}</div>
                  )}
                </div>
              );
            })}

            <div className="text-sm text-right">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="font-bold text-[#540b0e] hover:underline cursor-pointer">Log In</span>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="px-16 py-3 bg-[#540b0e] text-white font-semibold text-2xl rounded-full hover:bg-[#7a5f36] transition flex items-center justify-center gap-2 shadow-lg"
              >
                <i className="fas fa-user-plus"></i> Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Image Side */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <div className="w-[530px] h-[600px] rounded-xl overflow-hidden shadow-lg relative top-[-28px]">
            <img src={images[currentImage]} alt="Signup Visual" className="w-full h-full object-cover object-center transition duration-1000 ease-in-out" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
