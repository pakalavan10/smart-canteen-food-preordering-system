import { useState, useEffect } from 'react';

const MenuForm = ({ initialData, categories, onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '', preparationTime: '15', tags: '', isVeg: true, isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category?._id || initialData.category || '',
        preparationTime: initialData.preparationTime || '15',
        tags: initialData.tags?.join(', ') || '',
        isVeg: initialData.isVeg !== undefined ? initialData.isVeg : true,
        isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
      });
      if (initialData.image) setPreview(initialData.image);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (imageFile) formData.append('image', imageFile);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Food Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="e.g. Chicken Biryani" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Price (₹) *</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} required className="input-field" placeholder="e.g. 150" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            <option value="">Select category</option>
            {categories?.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Prep Time (mins)</label>
          <input name="preparationTime" type="number" value={form.preparationTime} onChange={handleChange} className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="input-field resize-none" placeholder="Describe the food item..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Tags (comma-separated)</label>
        <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="e.g. spicy, popular, special" />
      </div>

      <div className="flex items-center gap-6 p-4 glass rounded-xl border border-surface-200 dark:border-surface-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isVeg" checked={form.isVeg} onChange={handleChange} className="w-4 h-4 text-success-500 rounded" />
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Vegetarian 🟢</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Menu Status:</span>
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isAvailable ? 'bg-success-500' : 'bg-surface-300 dark:bg-surface-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-xs font-bold ${form.isAvailable ? 'text-success-600 dark:text-success-400' : 'text-surface-500'}`}>
            {form.isAvailable ? '🟢 ON (Available)' : '🔴 OFF (Unavailable)'}
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Food Image</label>
        <input type="file" accept="image/*" onChange={handleImage} className="input-field" />
        {preview && (
          <img src={preview} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-xl border border-surface-200 dark:border-surface-700" />
        )}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving...' : initialData ? 'Update Food' : 'Add Food'}
      </button>
    </form>
  );
};

export default MenuForm;
