import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCheckCircle, FaTimes } from 'react-icons/fa';

const API_URL = 'http://localhost:3000/api/products';
const CATEGORY_API = 'http://localhost:3000/api/categories';

const themeColor = '#8B6B3E';

const AdminAddProduct = () => {
  const [form, setForm] = useState({
    title: '',
    fabric: '',
    price: '',
    rating: 1,
    category: '',
    colors: ['#4B371C'],
    sizes: [{ size: '', stock: '' }]
  });

  const [categories, setCategories] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [variantImages, setVariantImages] = useState([]);
  const [previewMain, setPreviewMain] = useState(null);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch(CATEGORY_API);
    const data = await res.json();
    setCategories(data);
  };

  const fetchProducts = async () => {
    setLoadingList(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoadingList(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    setMainImage(file);
    setPreviewMain(file ? URL.createObjectURL(file) : null);
  };

  const handleAddVariantImage = (e) => {
    if (e.target.files[0]) {
      setVariantImages(prev => [...prev, e.target.files[0]]);
    }
  };

  const handleRemoveVariantImage = (idx) => {
    setVariantImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleColorChange = (i, val) => {
    const updated = [...form.colors];
    updated[i] = val;
    setForm({ ...form, colors: updated });
  };

  const handleSizeChange = (i, key, val) => {
    const updated = [...form.sizes];
    updated[i][key] = key === 'stock' ? Number(val) : val;
    setForm({ ...form, sizes: updated });
  };

  const addColor = () => {
    setForm({ ...form, colors: [...form.colors, '#000000'] });
  };

  const addSize = () => {
    setForm({ ...form, sizes: [...form.sizes, { size: '', stock: 0 }] });
  };

  const handleEdit = async (productId) => {
    const res = await fetch(`${API_URL}/${productId}`);
    const data = await res.json();
    setForm({
      title: data.title,
      fabric: data.fabric,
      price: data.price,
      rating: data.rating,
      category: data.category?._id || data.category,
      colors: data.colors || ['#4B371C'],
      sizes: data.sizes && data.sizes.length > 0 ? data.sizes : [{ size: '', stock: '' }],
    });
    setMainImage(null);
    setPreviewMain(data.image ? `http://localhost:3000/uploads/${data.image}` : null);
    setVariantImages([]);
    setEditingProductId(productId);
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditingProductId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sizes.length || form.sizes.some(s => !s.size || !s.stock)) {
      setMessage('❌ Please enter at least one size and stock');
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'colors' || key === 'sizes') {
        data.append(key, JSON.stringify(val));
      } else {
        data.append(key, val);
      }
    });
    if (mainImage) data.append('image', mainImage);
    variantImages.forEach(file => data.append('images', file));
    try {
      let res, result;
      if (editingProductId) {
        res = await fetch(`${API_URL}/${editingProductId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: data
        });
        result = await res.json();
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: data
        });
        result = await res.json();
      }
      if (result.success) {
        setMessage(editingProductId ? '✅ Product updated successfully' : '✅ Product added successfully');
        resetForm();
        setEditingProductId(null);
        fetchProducts();
      } else {
        setMessage('❌ Failed to save product');
      }
    } catch {
      setMessage('❌ Server error');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      fabric: '',
      price: '',
      rating: 1,
      category: '',
      colors: ['#4B371C'],
      sizes: [{ size: '', stock: '' }]
    });
    setMainImage(null);
    setVariantImages([]);
    setPreviewMain(null);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch {
      alert('Server error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f6f2] pb-20">
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-[${themeColor}] text-center drop-shadow">Add New Product</h2>
        {message && <div className="mb-4 font-medium text-green-700 text-center">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-10 border border-[#e2c799] max-w-4xl mx-auto mb-12">
          <div className="flex flex-col gap-4">
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="border p-3 rounded-lg focus:ring-2 focus:ring-[#8B6B3E]" />
            <input name="fabric" placeholder="Fabric" value={form.fabric} onChange={handleChange} className="border p-3 rounded-lg focus:ring-2 focus:ring-[#8B6B3E]" />
            <input name="price" placeholder="Price" value={form.price} onChange={handleChange} type="number" className="border p-3 rounded-lg focus:ring-2 focus:ring-[#8B6B3E]" />
            <input name="rating" placeholder="Rating" value={form.rating} onChange={handleChange} type="number" min="1" max="5" className="border p-3 rounded-lg focus:ring-2 focus:ring-[#8B6B3E]" />
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-2">
            <label className="block font-medium mb-1 text-[#8B6B3E]">Main Image:</label>
            <input type="file" accept="image/*" onChange={handleMainImage} className="block" />
            {previewMain && <img src={previewMain} alt="Main Preview" className="w-24 h-24 mt-2 object-cover rounded shadow border-2 border-[#e2c799]" />}
          </div>
          <div>
            <label className="block font-medium mb-1 text-[#8B6B3E]">Add Variant Image:</label>
            <input type="file" onChange={handleAddVariantImage} />
            <div className="flex gap-2 mt-2 flex-wrap">
              {variantImages.map((file, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`variant-${idx}`}
                    className="w-14 h-14 object-cover rounded border border-[#e2c799] mb-1"
                  />
                  <span className="text-xs">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariantImage(idx)}
                    className="text-red-600 underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2 text-[#8B6B3E]">Colors:</label>
            <div className="flex gap-2 items-center">
              {form.colors.map((color, i) => (
                <input key={i} type="color" value={color} onChange={(e) => handleColorChange(i, e.target.value)} className="w-10 h-10 border-2 border-[#e2c799] rounded-full" />
              ))}
              <button type="button" onClick={addColor} className="text-[#8B6B3E] underline font-semibold">+ Add Color</button>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2 text-[#8B6B3E]">Sizes:</label>
            {form.sizes.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Size"
                  value={s.size}
                  onChange={(e) => handleSizeChange(i, 'size', e.target.value)}
                  className="border p-2 w-24 rounded-lg focus:ring-2 focus:ring-[#8B6B3E]"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={s.stock}
                  onChange={(e) => handleSizeChange(i, 'stock', e.target.value)}
                  className="border p-2 w-24 rounded-lg focus:ring-2 focus:ring-[#8B6B3E]"
                  min="0"
                />
              </div>
            ))}
            <button type="button" onClick={addSize} className="text-[#8B6B3E] underline font-semibold">+ Add Size</button>
          </div>
          <button type="submit" className="bg-[#8B6B3E] text-white px-8 py-3 rounded-lg shadow hover:bg-[#a4844b] transition font-bold text-lg w-full">
            {editingProductId ? 'Update Product' : 'Add Product'}
          </button>
        </form>

        {/* Product List */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-[#8B6B3E] text-center">All Products</h2>
          {loadingList ? (
            <div className="text-lg text-[#8B6B3E] text-center">Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-center">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow border border-[#e2c799] text-sm">
                <thead>
                  <tr className="bg-[#f8f5f0] text-[#8B6B3E] text-left">
                    <th className="py-3 px-4 font-semibold">Image</th>
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Stock</th>
                    <th className="py-3 px-4 font-semibold">Price</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-t border-[#e2c799] hover:bg-[#f9f6f2] transition">
                      <td className="py-2 px-4">
                        <img
                          src={`http://localhost:3000/uploads/${product.image}`}
                          alt={product.title}
                          className="w-14 h-14 object-cover rounded border border-[#e2c799]"
                        />
                      </td>
                      <td className="py-2 px-4 text-[#8B6B3E] font-semibold">{product.title}</td>
                      <td className="py-2 px-4">
                        {product.totalStock === 0 ? (
                          <span className="text-red-600 font-semibold">Out of stock</span>
                        ) : (
                          <>
                            <span className="text-green-600 font-semibold">In stock</span>
                            <span className="ml-1 text-gray-500">({product.totalStock})</span>
                          </>
                        )}
                      </td>
                      <td className="py-2 px-4 font-semibold">₹{product.price}</td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product._id)}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-[#e2c799] text-[#8B6B3E] font-semibold hover:bg-[#8B6B3E] hover:text-white transition text-sm"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deleting === product._id}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-600 hover:text-white transition text-sm"
                          >
                            <FaTrash /> {deleting === product._id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;
