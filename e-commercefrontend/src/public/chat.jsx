import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo1.png';

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const [open, setOpen] = useState(true);
  const recognitionRef = useRef(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [paymentContext, setPaymentContext] = useState(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: 'Hello! I\'m your Anka Attire assistant. How can I help you today? You can ask about products, payments, or any other questions!'
      }
    ]);
  }, []);

  const handlePaymentFlow = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check if user wants to make a payment
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('buy')) {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          sender: 'bot',
          text: 'Please log in first to make a payment. You can login from the top navigation menu.'
        };
      }

      // Check if user has items in cart
      try {
        const cartResponse = await axios.get('http://localhost:3000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (cartResponse.data.success && cartResponse.data.cart.items.length > 0) {
          setPaymentContext('cart');
          return {
            sender: 'bot',
            text: `I can see you have ${cartResponse.data.cart.items.length} item(s) in your cart. Would you like to proceed to payment? Type "yes" to continue or "view cart" to see your items.`
          };
        } else {
          return {
            sender: 'bot',
            text: 'Your cart is empty. Please add some products to your cart first before proceeding to payment.'
          };
        }
      } catch (error) {
        return {
          sender: 'bot',
          text: 'Sorry, I couldn\'t check your cart. Please try again or visit the cart page directly.'
        };
      }
    }

    // Handle payment confirmation
    if (paymentContext === 'cart' && (lowerMessage.includes('yes') || lowerMessage.includes('proceed'))) {
      setPaymentContext(null);
      return {
        sender: 'bot',
        text: 'Great! I\'ll redirect you to the payment page. Please complete your payment there.',
        action: 'redirect_to_payment'
      };
    }

    // Handle cart viewing
    if (lowerMessage.includes('view cart') || lowerMessage.includes('cart')) {
      setPaymentContext(null);
      return {
        sender: 'bot',
        text: 'I\'ll show you your cart. You can view and manage your items there.',
        action: 'redirect_to_cart'
      };
    }

    return null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentInput = input; // Store the current input
    setInput(''); // Clear input immediately

    const userMessage = { sender: 'user', text: currentInput };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Check for payment-related messages first
      const paymentResponse = await handlePaymentFlow(currentInput);
      
      if (paymentResponse) {
        setMessages((prev) => [...prev, paymentResponse]);
        
        // Handle actions
        if (paymentResponse.action === 'redirect_to_payment') {
          setTimeout(() => {
            navigate('/payment');
          }, 2000);
        } else if (paymentResponse.action === 'redirect_to_cart') {
          setTimeout(() => {
            navigate('/cart');
          }, 2000);
        }
      } else {
        // Regular chat response
        const response = await axios.post('http://localhost:3000/api/chat', {
          message: currentInput,
        });

        const botMessage = { sender: 'bot', text: response.data.reply };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Something went wrong. Please try again.' },
      ]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setListening(true);
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setTimeout(() => {
          setInput('');
          const userMessage = { sender: 'user', text: transcript };
          setMessages((prev) => [...prev, userMessage]);
          
          // Handle voice input with payment flow
          handlePaymentFlow(transcript).then(paymentResponse => {
            if (paymentResponse) {
              setMessages((prev) => [...prev, paymentResponse]);
              if (paymentResponse.action === 'redirect_to_payment') {
                setTimeout(() => navigate('/payment'), 2000);
              } else if (paymentResponse.action === 'redirect_to_cart') {
                setTimeout(() => navigate('/cart'), 2000);
              }
            } else {
              axios.post('http://localhost:3000/api/chat', { message: transcript })
                .then((response) => {
                  const botMessage = { sender: 'bot', text: response.data.reply };
                  setMessages((prev) => [...prev, botMessage]);
                })
                .catch((error) => {
                  console.error('Error sending message:', error);
                  setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: 'Something went wrong. Please try again.' },
                  ]);
                });
            }
          });
        }, 100);
      };
      setVoiceSupported(true);
    }
  }, [navigate]);

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      toast.error('Voice recognition is not supported in this browser.');
    }
  };

  const handleClose = () => {
    toast.info('Chat closed. You can reopen it anytime!', {
      position: "top-right",
      autoClose: 2000,
    });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-0 w-[380px] h-[480px] bg-white border border-[#540b0e] shadow-xl rounded-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-[#540b0e] text-white px-4 py-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <img src={logo} alt="Bot Logo" className="h-10 w-10 rounded-full p-0.5" />
          Chat with Anka Attire
        </span>
        <button 
          onClick={handleClose} 
          className="hover:bg-[#a48454] rounded-full p-2 transition-all duration-200 hover:scale-110 group"
          title="Close chat"
        >
          <XMarkIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Listening indicator */}
      {listening && (
        <div className="text-center py-2 text-[#540b0e] text-xs font-medium animate-pulse bg-yellow-50 border-b border-yellow-200">
          🎤 Listening... Speak now
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#f9f6f1]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-3 text-sm rounded-xl max-w-[80%] shadow-md ${
              msg.sender === 'user'
                ? 'bg-[#540b0e] text-white rounded-br-none'
                : 'bg-white text-[#2d2618] rounded-bl-none border border-[#E8DCC3]'
            }`}>
              {msg.text}
              {msg.action && (
                <div className="mt-2 text-xs opacity-75">
                  Redirecting...
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#E8DCC3] px-3 py-3 bg-white flex items-center gap-2">
        {voiceSupported && (
          <button
            className={`p-2 rounded-full transition-all duration-200 hover:scale-105 ${
              listening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'hover:bg-[#f9f6f1] text-[#540b0e]'
            }`}
            onClick={handleVoiceInput}
            title={listening ? "Listening..." : "Voice Input"}
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
        )}
        <input
          type="text"
          placeholder="Type your message or ask about payments..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 bg-[#f9f6f1] border border-[#540b0e] rounded-lg px-3 py-2 text-sm placeholder:text-[#540b0e]/60 text-[#2d2618] focus:outline-none focus:ring-2 focus:ring-[#540b0e] focus:border-transparent"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-[#540b0e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#3a0708] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
