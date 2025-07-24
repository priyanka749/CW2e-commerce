import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo1.png';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#540b0e] text-white pt-3 pb-1 px-4 md:px-10">
      <div className="border-t border-white/20 mb-2"></div>
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 py-2">
        {/* Left: Logo and Brand */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <img src={logo} alt="Anka Attire Logo" className="h-20 w-20 object-cover rounded-full shadow-lg" />
          <span className="text-2xl font-extrabold tracking-wide ml-2">Anka Attire</span>
        </div>
        {/* Center: Navigation */}
        <nav className="flex-1 flex justify-center">
          <div className="flex flex-wrap gap-6 text-base font-medium">
            <button onClick={() => navigate('/about')} className="hover:text-[#e2c799] transition bg-transparent border-none">About</button>
            <button onClick={() => navigate('/products')} className="hover:text-[#e2c799] transition bg-transparent border-none">Sales</button>
            <button
              onClick={() => {
                navigate('/home#categories');
                // Optionally, add smooth scroll logic if needed
              }}
              className="hover:text-[#e2c799] transition bg-transparent border-none"
            >
              Categories
            </button>
            <button onClick={() => navigate('/new-arrivals')} className="hover:text-[#e2c799] transition bg-transparent border-none">New Available</button>
            <button onClick={() => navigate('/help')} className="hover:text-[#e2c799] transition bg-transparent border-none">Help</button>
            <button onClick={() => navigate('/settings')} className="hover:text-[#e2c799] transition bg-transparent border-none">Setting</button>
          </div>
        </nav>
        {/* Right: Contact and Socials */}
        <div className="flex flex-col items-end gap-2 min-w-[200px]">
          <button
            className="bg-[#e2c799] text-[#540b0e] px-7 py-2 rounded-full font-semibold shadow hover:bg-white hover:text-[#540b0e] transition text-base"
            onClick={() => navigate('/contact')}
          >
            Contact Us
          </button>
          <div className="flex gap-3 text-xl mt-1">
            <a href="#" className="hover:text-[#e2c799] transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-[#e2c799] transition"><FaInstagram /></a>
            <a href="#" className="hover:text-[#e2c799] transition"><FaYoutube /></a>
            <a href="#" className="hover:text-[#e2c799] transition"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-[12px] text-white/80 tracking-wide">
        &copy; {new Date().getFullYear()} Anka Attire. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;