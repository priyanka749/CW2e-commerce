import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    price: '',
    originalPrice: '',
    description: '',
    colors: '',
    sizes: '',
    image: null,
  });

  // Fetch sale products
  const fetchSales = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/sales');
      setSales(res.data);
    } catch (err) {
      toast.error('Failed to fetch sales');
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Submit new sale product
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('price', form.price);
    data.append('originalPrice', form.originalPrice);
    data.append('description', form.description);
    data.append('colors', JSON.stringify(form.colors.split(',')));
    data.append('sizes', JSON.stringify(form.sizes.split(',')));
    data.append('image', form.image);

    try {
      await axios.post('http://localhost:3000/api/sales', data);
      toast.success('Sale product added');
      setShowModal(false);
      setForm({ title: '', price: '', originalPrice: '', description: '', colors: '', sizes: '', image: null });
      fetchSales();
    } catch (err) {
      toast.error('Failed to create sale');
    }
  };

  // Delete sale product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale product?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/sales/${id}`);
      toast.success('Sale product deleted');
      fetchSales();
    } catch (err) {
      toast.error('Failed to delete sale');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#7c5a2e]">Manage Sale Products</h1>
        <button onClick={() => setShowModal(true)} className="bg-[#7c5a2e] text-white px-4 py-2 rounded shadow">
          + Add Sale
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sales.map((sale) => (
          <div key={sale._id} className="border rounded-xl shadow p-4 flex flex-col">
            <img
              src={`http://localhost:3000/uploads/${sale.image}`}
              alt={sale.title}
              className="w-full h-48 object-cover rounded mb-3"
            />
            <h3 className="font-bold text-lg text-[#5a4632]">{sale.title}</h3>
            <p className="text-sm text-gray-600">Price: Rs. {sale.price}</p>
            <p className="text-sm text-gray-600">Original: Rs. {sale.originalPrice}</p>
            <p className="text-sm text-gray-500">Colors: {sale.colors.join(', ')}</p>
            <p className="text-sm text-gray-500 mb-2">Sizes: {sale.sizes.join(', ')}</p>
            <button onClick={() => handleDelete(sale._id)} className="mt-auto bg-red-500 text-white py-2 px-4 rounded">
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#5a4632]">Add New Sale Product</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" name="title" placeholder="Title" required className="border px-3 py-2 rounded" onChange={handleChange} />
              <input type="number" name="price" placeholder="Price" required className="border px-3 py-2 rounded" onChange={handleChange} />
              <input type="number" name="originalPrice" placeholder="Original Price" className="border px-3 py-2 rounded" onChange={handleChange} />
              <input type="text" name="colors" placeholder="Colors (comma separated)" className="border px-3 py-2 rounded" onChange={handleChange} />
              <input type="text" name="sizes" placeholder="Sizes (comma separated)" className="border px-3 py-2 rounded" onChange={handleChange} />
              <textarea name="description" placeholder="Description" rows="3" className="border px-3 py-2 rounded" onChange={handleChange}></textarea>
              <input type="file" name="image" accept="image/*" required className="border px-3 py-2 rounded" onChange={handleChange} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-600 px-4 py-2">Cancel</button>
                <button type="submit" className="bg-[#7c5a2e] text-white px-4 py-2 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSales;
