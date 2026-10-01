import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFoods = async () => {
    try {
      setLoading(true);
      // Fetch all pages (capped at 100 per request server-side)
      const pageSize = 100;
      const first = await API.get(`/foods?limit=${pageSize}`);
      const { total, pages } = first.data.pagination;
      let all = [...first.data.data];
      for (let p = 2; p <= pages; p++) {
        const { data } = await API.get(`/foods?limit=${pageSize}&page=${p}`);
        all = all.concat(data.data);
      }
      setFoods(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const toggleAvailability = async (id) => {
    try {
      const { data } = await API.patch(`/foods/admin/${id}/toggle`);
      toast.success(`Food ${data.data.isAvailable ? 'enabled' : 'disabled'}`);
      fetchFoods();
    } catch (err) { toast.error('Failed'); }
  };

  const deleteFood = async (id) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    try {
      await API.delete(`/foods/admin/${id}`);
      toast.success('Food deleted');
      fetchFoods();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filtered = foods.filter(f => 
    f.name?.toLowerCase().includes(search.toLowerCase()) || 
    f.vendor?.shopName?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'image', label: 'Item', render: (v, row) => (
      <div className="flex items-center gap-3">
        <img src={getImageUrl(v)} alt={row.name} className="w-12 h-12 rounded-xl object-cover" />
        <div>
          <p className="font-bold text-surface-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-surface-400">{row.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</p>
        </div>
      </div>
    )},
    { key: 'vendor', label: 'Vendor', render: (v) => v?.shopName || 'Unknown' },
    { key: 'category', label: 'Category', render: (v) => v?.name || 'N/A' },
    { key: 'price', label: 'Price', render: (v) => <span className="font-bold text-primary-600 dark:text-primary-400">{formatPrice(v)}</span> },
    { key: 'isAvailable', label: 'Status', render: (v) => <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Available' : 'Disabled'}</span> },
    { key: '_id', label: 'Actions', sortable: false, render: (v, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => toggleAvailability(v)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800" title="Toggle availability">
          {row.isAvailable ? <HiOutlineEyeSlash className="w-5 h-5 text-surface-500" /> : <HiOutlineEye className="w-5 h-5 text-success-600" />}
        </button>
        <button onClick={() => deleteFood(v)} className="p-1.5 rounded-lg hover:bg-danger-500/10 dark:hover:bg-danger-900/20 text-danger-500">
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    )},
  ];

  if (loading) return <LoadingSkeleton type="table-row" count={5} />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🍱 All Foods ({foods.length})</h1>
      <SearchBar value={search} onChange={setSearch} placeholder="Search foods or vendor shops..." />
      <DataTable columns={columns} data={filtered} />
    </div>
  );
};

export default Foods;
