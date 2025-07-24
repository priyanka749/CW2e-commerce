import { useState } from 'react';
import {
    FaChevronDown,
    FaEnvelope,
    FaFileContract,
    FaPhoneAlt,
    FaQuestionCircle,
    FaWhatsapp,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import Navbar from '../components/nav';

const faqs = [
  {
    question: 'How do I place an order?',
    answer:
      'Browse our products, add your favorites to the cart, and proceed to checkout. Follow the steps to complete your purchase.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major debit/credit cards, digital wallets, and cash on delivery (COD) in select locations.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'After your order is shipped, youll receive a tracking link via email and SMS.',
  },
  {
    question: 'Can I return or exchange a product?',
    answer:
      'Yes, we offer a 7-day easy return and exchange policy. Please visit our Returns page for more details.',
  },
];

const Help = () => {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#fffaf5] via-[#fdf9f6] to-[#EBDECD] text-[#540b0e] min-h-screen">
      <Navbar />

      <section className="w-full flex flex-col items-center py-12 px-2">
        <div className="w-full max-w-6xl min-h-[700px] bg-white/95 rounded-3xl shadow-2xl border border-[#e2c799] p-8 flex flex-col gap-10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <FaQuestionCircle className="text-4xl text-[#540b0e]" />
              <h1 className="text-4xl font-extrabold font-playfair">Help & Support</h1>
            </div>
            <div className="hidden md:flex gap-4">
              <a
                href="tel:9862182135"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9F3] border border-[#e2c799] shadow hover:bg-[#f7ede2] transition"
              >
                <FaPhoneAlt /> <span className="font-medium">9862182135</span>
              </a>
              <a
                href="mailto:ankaattire@gmail.com"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9F3] border border-[#e2c799] shadow hover:bg-[#f7ede2] transition"
              >
                <FaEnvelope /> <span className="font-medium">Email</span>
              </a>
              <button
                onClick={() => navigate('/contact')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9F3] border border-[#e2c799] shadow hover:bg-[#f7ede2] transition"
              >
                <FaFileContract className="text-[#540b0e]" />{' '}
                <span className="font-medium">Contact</span>
              </button>
            </div>
          </div>

          <p className="text-lg text-[#7c684a] mb-2 text-center md:text-left">
            Need assistance? We're here to help! Find answers to common questions or reach out to our support team.
          </p>

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-[#FFF9F3] to-[#f7ede2] rounded-2xl shadow-lg p-6 border border-[#e2c799] space-y-2">
            <h2 className="text-2xl font-bold mb-4 text-[#540b0e]">Frequently Asked Questions</h2>
            {faqs.map((faq, idx) => (
              <div key={idx} className="mb-2">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-[#540b0e] py-4 px-5 rounded-xl hover:bg-[#f7ede2] transition text-lg"
                  onClick={() => setOpen(open === idx ? null : idx)}
                >
                  <span>{faq.question}</span>
                  <FaChevronDown
                    className={`transition-transform ${open === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    open === idx ? 'max-h-40 py-3 px-5' : 'max-h-0 py-0 px-5'
                  } text-[#7c684a] bg-white rounded-xl`}
                  style={{ fontSize: '1rem' }}
                >
                  {open === idx && <div>{faq.answer}</div>}
                </div>
              </div>
            ))}
            <div className="mt-6 text-[#540b0e] text-base">
              <span className="font-semibold">Need more help?</span> Contact us using the options below.
            </div>
          </div>

          {/* Contact Options for mobile */}
          <div className="flex flex-col gap-4 md:hidden mt-6">
            <a
              href="tel:9862182135"
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#FFF9F3] border border-[#e2c799] shadow hover:bg-[#f7ede2] transition text-base"
            >
              <FaPhoneAlt /> <span className="font-medium">9862182135</span>
            </a>
            <a
              href="mailto:support@ankaattire.com"
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#FFF9F3] border border-[#e2c799] shadow hover:bg-[#f7ede2] transition text-base"
            >
              <FaEnvelope /> <span className="font-medium">support@ankaattire.com</span>
            </a>
            <a
              href="https://wa.me/9862182135"
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#FFF9F3] border border-[#e2c799] shadow hover:bg-[#f7ede2] transition text-base"
            >
              <FaWhatsapp className="text-[#25D366]" /> <span className="font-medium">WhatsApp</span>
            </a>
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#FFF9F3] border border-[#e2c799] shadow hover:bg-[#f7ede2] transition text-base"
            >
              <FaFileContract className="text-[#540b0e]" /> <span className="font-medium">Contact Page</span>
            </button>
          </div>
        </div>
      </section>

   
      <Footer />
    </div>
  );
};

export default Help;
