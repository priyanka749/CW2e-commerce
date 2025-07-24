import { useEffect, useState } from 'react';

const ImageUploadWithName = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !imageFile) {
      setError('Please provide both name and image.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${BASE_URL}/api/categories/add`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload');
      }

      setSuccess('Category uploaded successfully!');
      setName('');
      setImageFile(null);
      setImagePreview(null);
      fetchCategories(); // refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting category');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 bg-gradient-to-br from-[#f7ede2] to-[#fffaf0]">
      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-[#e2c799]"
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-semibold text-[#8B6B3E] mb-4 text-center">Upload Image & Name</h2>

        {imagePreview && (
          <div className="relative w-full h-64 mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="object-cover w-full h-full rounded-lg shadow-md"
            />
            {name && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                <span className="text-white text-xl font-bold">{name}</span>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full mb-4 file:py-2 file:px-4 file:rounded-md file:border file:border-[#8B6B3E] file:bg-[#fdf6ee] file:text-[#8B6B3E] hover:file:bg-[#e8dbc3] transition"
          required
        />

        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-[#e2c799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B6B3E] text-[#6C5C4C] bg-[#fdf6ee]"
          required
        />

        <button
          type="submit"
          className="w-full bg-[#8B6B3E] text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-[#7a5f2d] transition"
        >
          Upload Category
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
      </form>

      {/* Display Uploaded Categories */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-6xl">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex flex-col items-center bg-white border border-[#e6dcc3] p-4 rounded-xl shadow-md"
          >
            <img
              src={`${BASE_URL}${cat.image}`}
              alt={cat.name}
              className="w-28 h-28 object-cover rounded-full border-2 border-gray-300 shadow"
            />
            <p className="mt-2 text-md font-bold text-[#8B6B3E] capitalize">{cat.name}</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => handleDelete(cat._id)}
                className="text-sm text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => alert('Update logic goes here')}
                className="text-sm text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploadWithName;
