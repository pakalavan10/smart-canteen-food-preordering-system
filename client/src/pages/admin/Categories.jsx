import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🍽️', description: '', sortOrder: 0 });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: '', icon: '🍽️', description: '', sortOrder: categories.length + 1 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, icon: cat.icon || '🍽️', description: cat.description || '', sortOrder: cat.sortOrder || 0 });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, form);
        toast.success('Category updated!');
      } else {
        await API.post('/categories', form);
        toast.success('Category created!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = async (id) => {
    try {
      const { data } = await API.patch(`/categories/${id}/toggle`);
      toast.success(`Category ${data.data.isActive ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (err) { toast.error('Failed'); }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const columns = [
    { key: 'icon', label: 'Icon', render: (v) => <span className="text-2xl">{v}</span> },
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-surface-900 dark:text-white">{v}</span> },
    { key: 'description', label: 'Description' },
    { key: 'sortOrder', label: 'Order' },
    { key: 'isActive', label: 'Status', render: (v) => <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Active' : 'Inactive'}</span> },
    { key: '_id', label: 'Actions', sortable: false, render: (v, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => toggleCategory(v)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800" title="Toggle Active">
          {row.isActive ? <HiOutlineEyeSlash className="w-5 h-5 text-surface-500" /> : <HiOutlineEye className="w-5 h-5 text-success-600" />}
        </button>
        <button onClick={() => handleOpenEdit(row)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-primary-600">
          <HiOutlinePencil className="w-5 h-5" />
        </button>
        <button onClick={() => deleteCategory(v)} className="p-1.5 rounded-lg hover:bg-danger-500/10 dark:hover:bg-danger-900/20 text-danger-500">
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    )},
  ];

  if (loading) return <LoadingSkeleton type="table-row" count={4} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🏷️ Categories ({categories.length})</h1>
        <button onClick={handleOpenAdd} className="btn-primary text-sm">+ Add Category</button>
      </div>

      <DataTable columns={columns} data={categories} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" placeholder="e.g. Breakfast" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Icon</label>
              <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} required className="input-field text-center text-xl" placeholder="🌅" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value) || 0})} className="input-field" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
