import { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import Footer from '../components/footer';
import Navbar from '../components/nav';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 3500);
      } else {
        setError(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9f6] to-[#EBDECD] text-[#8B6B3E]">
      <Navbar />

      <section className="flex flex-col md:flex-row items-center justify-center gap-12 px-4 py-20 max-w-6xl mx-auto w-full">
        {/* Contact Info */}
        <div className="w-full md:w-1/2 space-y-10 mt-8">
          <h2 className="text-4xl font-extrabold mb-10 font-playfair text-[#8B6B3E]">Contact Us</h2>
          <p className="text-lg text-[#7c684a] mb-10">
            We'd love to hear from you! Whether you have a question about our products, need assistance, or just want to share feedback, our team is ready to help.
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <FaPhoneAlt className="text-[#8B6B3E] text-xl" />
              <span className="text-md md:text-lg font-medium">9862182135</span>
            </div>
            <div className="flex items-center gap-4">
              <FaEnvelope className="text-[#8B6B3E] text-xl" />
              <span className="text-md md:text-lg font-medium">@ankaattire.com</span>
            </div>
            <div className="flex items-center gap-4">
              <FaMapMarkerAlt className="text-[#8B6B3E] text-xl" />
              <span className="text-md md:text-lg font-medium">Kathmandu, Dillibazzar, pipalbot</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 bg-[#FFF9F3] rounded-3xl shadow-2xl p-10 flex flex-col gap-6 backdrop-blur-lg min-h-[520px]"
        >
          <h3 className="text-2xl font-bold mb-2 text-[#8B6B3E] mt-2">Send us a message</h3>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="px-5 py-3 rounded-full border border-[#e2c799] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B6B3E] text-[#8B6B3E] font-medium transition"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="px-5 py-3 rounded-full border border-[#e2c799] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B6B3E] text-[#8B6B3E] font-medium transition"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            required
            rows={6}
            className="px-5 py-3 rounded-2xl border border-[#e2c799] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B6B3E] text-[#8B6B3E] font-medium transition resize-none"
          />
          <button
            type="submit"
            className="mt-2 bg-[#8B6B3E] text-white font-bold py-3 rounded-full shadow-lg hover:from-[#a88b5c] hover:to-[#8B6B3E] transition-all text-lg"
          >
            Send Message
          </button>
          {submitted && (
            <div className="text-green-600 text-center font-semibold mt-2 animate-bounce">
              Thank you! Your message has been sent.
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center font-semibold mt-2">
              {error}
            </div>
          )}
        </form>
      </section>
<div className="h-12 md:h-14" /> {/* Spacer to push Footer further down */}

      <Footer />
    </div>
  );
};
export default Contact;