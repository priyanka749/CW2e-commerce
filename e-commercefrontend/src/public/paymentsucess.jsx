import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useCsrf } from './CsrfProvider';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("verifying");
  const [retryCount, setRetryCount] = useState(0);
  const [isApiReady, setIsApiReady] = useState(false);

  const { api } = useCsrf();
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const pidx = urlParams.get("pidx");
        
        if (!pidx) {
          console.error("No pidx found in URL");
          toast.error("Missing payment identifier.");
          setStatus("error");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        console.log("Starting payment verification for pidx:", pidx);

        // Wait for API to be ready with timeout
        if (!api) {
          console.log("Waiting for CSRF API...", retryCount);
          if (retryCount < 50) { // Max 5 seconds wait
            setRetryCount(prev => prev + 1);
            setTimeout(verifyPayment, 100);
            return;
          } else {
            console.error("CSRF API timeout");
            toast.error("Connection timeout. Please try again.");
            setStatus("error");
            setTimeout(() => navigate("/"), 2000);
            return;
          }
        }

        if (!isApiReady) {
          setIsApiReady(true);
          console.log("CSRF API is ready");
        }

        // Try to get order info from localStorage
        let tempOrder = {};
        try {
          tempOrder = JSON.parse(localStorage.getItem("khaltiTempOrder") || "{}");
          console.log("Retrieved order from localStorage:", tempOrder);
        } catch (e) {
          console.warn("Failed to parse khaltiTempOrder:", e);
        }

        // Validate required data
        if (!tempOrder.userId || !tempOrder.products || !tempOrder.amount) {
          console.error("Missing order data:", tempOrder);
          toast.error("Order information missing. Please try again.");
          setStatus("error");
          setTimeout(() => navigate("/cart"), 2000);
          return;
        }

        console.log("Verifying payment with backend...");
        
        // Prepare the verification payload
        const verificationPayload = { 
          pidx,
          userId: tempOrder.userId,
          products: tempOrder.products,
          amount: tempOrder.amount
        };

        console.log("Verification payload:", verificationPayload);
        
        const res = await api.post("https://localhost:3000/api/payments/khalti/verify", verificationPayload);

        console.log("Payment verification response:", res.data);

        if (res.data.success) {
          toast.success("Payment successful! Order placed.");
          localStorage.setItem('cartCount', '0');
          window.dispatchEvent(new Event('cartUpdated'));
          window.dispatchEvent(new Event('paymentSuccess'));
          localStorage.removeItem("khaltiTempOrder");
          setStatus("success");
          
          setTimeout(() => {
            console.log("Redirecting to cart...");
            navigate("/cart");
          }, 2000);
        } else {
          console.error("Payment verification failed:", res.data.message);
          toast.error(res.data.message || "Payment verification failed");
          setStatus("error");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error("Primary verification error:", err);
        
        // Enhanced fallback with better error handling
        try {
          console.log("Attempting fallback verification...");
          const urlParams = new URLSearchParams(location.search);
          const pidx = urlParams.get("pidx");
          
          const fallbackRes = await fetch("https://localhost:3000/api/payments/khalti/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            credentials: "include",
            body: JSON.stringify({ 
              pidx,
              userId: tempOrder.userId,
              products: tempOrder.products,
              amount: tempOrder.amount
            })
          });
          
          if (!fallbackRes.ok) {
            throw new Error(`HTTP ${fallbackRes.status}: ${fallbackRes.statusText}`);
          }
          
          const data = await fallbackRes.json();
          console.log("Fallback verification response:", data);
          
          if (data.success) {
            toast.success("Payment successful! Order placed.");
            localStorage.setItem('cartCount', '0');
            window.dispatchEvent(new Event('cartUpdated'));
            window.dispatchEvent(new Event('paymentSuccess'));
            localStorage.removeItem("khaltiTempOrder");
            setStatus("success");
            setTimeout(() => {
              navigate("/cart");
            }, 2000);
            return;
          } else {
            throw new Error(data.message || "Payment verification failed");
          }
        } catch (fallbackErr) {
          console.error("Fallback verification failed:", fallbackErr);
          
          if (fallbackErr.message.includes('ERR_EMPTY_RESPONSE')) {
            toast.error("Server connection error. Please check if backend is running.");
          } else if (fallbackErr.message.includes('net::ERR_')) {
            toast.error("Network error. Please check your connection.");
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
          
          setStatus("error");
          setTimeout(() => navigate("/"), 2000);
        }
      }
    };

    verifyPayment();
  }, [location, navigate, api, retryCount, isApiReady]);

  let message;
  if (status === "verifying") {
    if (!isApiReady && retryCount > 0) {
      message = `Connecting to server... (${retryCount}/50)`;
    } else {
      message = "Verifying your payment. Please wait...";
    }
  } else if (status === "success") {
    message = "Payment successful! Order placed. Redirecting to cart...";
  } else {
    message = "Payment verification failed. Redirecting to home...";
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center text-[#540b0e] font-semibold text-xl">
      <div className="text-center">
        {status === "verifying" && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#540b0e] mx-auto"></div>
          </div>
        )}
        <div>{message}</div>
        {retryCount > 30 && status === "verifying" && (
          <div className="text-sm mt-2 text-gray-600">
            If this takes too long, please check if the backend server is running.
          </div>
        )}
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default PaymentSuccess;