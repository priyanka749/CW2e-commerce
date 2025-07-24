import axios from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const product = state?.product;
  const amount = state?.amount;
  const products = state?.products;

  useEffect(() => {
    const initiateKhaltiPayment = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // --- Single Product Payment ---
      if (product) {
        try {
          const orderData = {
            userId,
            amount: product.price * (product.quantity || 1),
            products: [
              {
                productId: product._id,
                name: product.name,
                quantity: product.quantity,
                size: product.size,
                color: product.color, // ✅ include color if required
              },
            ],
          };
          localStorage.setItem("khaltiTempOrder", JSON.stringify(orderData));
          const res = await axios.post(
            "http://localhost:3000/api/payments/khalti/initiate",
            orderData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data.success) {
            window.location.href = res.data.payment_url;
          } else {
            toast.error("Failed to initiate payment.");
          }
        } catch (err) {
          console.error("Payment initiation error:", err);
          toast.error("Something went wrong while starting payment.");
        }
        return;
      }

      // --- Cart Payment ---
      if (amount && products && products.length > 0) {
        try {
          const orderData = {
            userId,
            amount,
            products,
          };
          localStorage.setItem("khaltiTempOrder", JSON.stringify(orderData));
          const res = await axios.post(
            "http://localhost:3000/api/payments/khalti/initiate",
            orderData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data.success) {
            window.location.href = res.data.payment_url;
          } else {
            toast.error("Failed to initiate payment.");
          }
        } catch (err) {
          console.error("Payment initiation error:", err);
          toast.error("Something went wrong while starting payment.");
        }
        return;
      }

      // --- No Payment Data ---
      toast.error("No payment data found.");
      navigate("/");
    };

    initiateKhaltiPayment();
  }, [product, amount, products, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-lg font-semibold text-[#540b0e]">
        Redirecting to Khalti for payment...
      </p>
    </div>
  );
};

export default Payment;
