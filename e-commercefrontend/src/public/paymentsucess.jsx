import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(location.search);
      const pidx = urlParams.get("pidx");
      
      if (!pidx) {
        toast.error("Missing payment identifier.");
        setStatus("error");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      // Get order info from localStorage
      const tempOrder = JSON.parse(localStorage.getItem("khaltiTempOrder") || "{}");
      const userId = tempOrder.userId;
      const amount = tempOrder.amount;
      const products = tempOrder.products;

      try {
        const res = await axios.post("http://localhost:3000/api/payments/khalti/verify", {
          pidx,
          userId,
          amount,
          products,
        });

     if (res.data.success) {
  toast.success("Payment successful! Order placed.");

  // 🧹 Clear local cart count and notify UI
  localStorage.setItem('cartCount', '0');
  window.dispatchEvent(new Event('cartUpdated'));
  window.dispatchEvent(new Event('paymentSuccess'));

  localStorage.removeItem("khaltiTempOrder");
  setStatus("success");

  setTimeout(() => {
    navigate(`/product/${products[0].productId}`);
  }, 2000);
}
 else {
          toast.error(res.data.message || "Payment verification failed");
          setStatus("error");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error("Verification Error:", err);
        toast.error("Payment verification failed");
        setStatus("error");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    verifyPayment();
  }, [location, navigate]);

  let message;
  if (status === "verifying") {
    message = "Verifying your payment. Please wait...";
  } else if (status === "success") {
    message = "Payment successful! Order placed. Redirecting...";
  } else {
    message = "Payment verification failed. Redirecting...";
  }

  return (
    <div className="h-screen flex items-center justify-center text-[#540b0e] font-semibold text-xl">
      {message}
    </div>
  );
};

export default PaymentSuccess;