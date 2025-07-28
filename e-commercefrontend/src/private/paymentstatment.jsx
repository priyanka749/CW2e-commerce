import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCsrf } from '../public/CsrfProvider';

const PaymentManagement = () => {
  const [orders, setOrders] = useState([]);

  const { api } = useCsrf();
  const fetchOrders = async () => {
    try {
      const res = await api.get("https://localhost:3000/api/payments/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm("Are you sure you want to delete this order?");
    if (!confirmed) return;

    try {
      await api.delete(`https://localhost:3000/api/payments/orders/${orderId}`);
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#540b0e]">Payment Orders</h2>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-[#f0eae0]">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-[#5c4033]">Customer</th>
              <th className="p-4 text-left text-sm font-semibold text-[#5c4033]">Amount</th>
              <th className="p-4 text-left text-sm font-semibold text-[#5c4033]">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-[#5c4033]">Products</th>
              <th className="p-4 text-left text-sm font-semibold text-[#5c4033]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="p-4">
                    <div className="font-medium text-[#5c4033]">
                      {order.userId?.fullName || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.userId?.email || "No Email"}
                    </div>
                  </td>
                  <td className="p-4">Rs. {order.totalAmount}</td>
                  <td className="p-4 capitalize text-green-600 font-semibold">
                    {order.paymentStatus}
                  </td>
                  <td className="p-4">
                    <ul className="list-disc pl-4">
                      {order.products.map((p, idx) => (
                        <li key={idx}>
                          {p?.productId?.name || "Deleted Product"} x{p.quantity} ({p.size}, {p.color})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteOrder(order._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;
