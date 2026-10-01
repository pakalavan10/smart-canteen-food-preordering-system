import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const ManageMenu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'on', 'off'

  const fetchMenu = async () => {
    try {
      const { data } = await API.get('/foods/vendor/my-foods');
      setFoods(data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const toggleAvailability = async (id, name, currentStatus) => {
    try {
      const { data } = await API.patch(`/foods/${id}/toggle`);
      const newStatus = data.data.isAvailable;
      setFoods(prev => prev.map(f => f._id === id ? { ...f, isAvailable: newStatus } : f));
      if (newStatus) {
        toast.success(`🟢 ${name} is now ON & Available to students!`);
      } else {
        toast.error(`🔴 ${name} is now OFF & Disabled from ordering!`);
      }
    } catch (err) {
      toast.error('Failed to update availability status');
    }
  };

  const deleteFood = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}" from your menu?`)) return;
    try {
      await API.delete(`/foods/${id}`);
      setFoods(prev => prev.filter(f => f._id !== id));
      toast.success(`"${name}" deleted from menu`);
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const filteredFoods = foods.filter(f => {
    if (filterStatus === 'on') return f.isAvailable;
    if (filterStatus === 'off') return !f.isAvailable;
    return true;
  });

  const activeCount = foods.filter(f => f.isAvailable).length;
  const inactiveCount = foods.filter(f => !f.isAvailable).length;

  if (loading) return <LoadingSkeleton type="table-row" count={5} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🍽️ Manage Menu & Item Status</h1>
          <p className="text-sm text-surface-500 mt-1">Turn items ON or OFF anytime to control what students can order</p>
        </div>
        <Link to="/vendor/add-food" className="btn-primary text-sm">+ Add New Food Item</Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-surface-200 dark:border-surface-700 pb-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200'
          }`}
        >
          All Items ({foods.length})
        </button>
        <button
          onClick={() => setFilterStatus('on')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filterStatus === 'on'
              ? 'bg-success-600 text-white shadow-lg'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200'
          }`}
        >
          🟢 ON / Available ({activeCount})
        </button>
        <button
          onClick={() => setFilterStatus('off')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filterStatus === 'off'
              ? 'bg-danger-600 text-white shadow-lg'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200'
          }`}
        >
          🔴 OFF / Out of Stock ({inactiveCount})
        </button>
      </div>

      {foods.length === 0 ? (
        <div className="text-center py-20 glass">
          <p className="text-6xl mb-4">🍽️</p>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No menu items found</h2>
          <p className="text-surface-500 mb-6">Add your food items to start receiving orders!</p>
          <Link to="/vendor/add-food" className="btn-primary inline-block">Add Your First Item</Link>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-12 glass">
          <p className="text-surface-500">No items match the selected status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFoods.map(food => (
            <div key={food._id} className="glass p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap hover:border-primary-500/30 transition-all">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img src={getImageUrl(food.image)} alt={food.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white truncate">{food.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${food.isVeg ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300' : 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300'}`}>
                      {food.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500">
                    {food.category?.name || 'General'} • <span className="font-semibold text-primary-600 dark:text-primary-400">{formatPrice(food.price)}</span> • ⏱ {food.preparationTime} mins
                  </p>
                </div>
              </div>

              {/* ON/OFF Switch & Actions */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Switch Button */}
                <button
                  onClick={() => toggleAvailability(food._id, food.name, food.isAvailable)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md ${
                    food.isAvailable
                      ? 'bg-success-500 hover:bg-success-600 text-white shadow-success-500/20'
                      : 'bg-surface-300 dark:bg-surface-700 hover:bg-surface-400 text-surface-700 dark:text-surface-300'
                  }`}
                  title="Click to turn ON/OFF"
                >
                  <span className={`w-3 h-3 rounded-full animate-pulse ${food.isAvailable ? 'bg-white' : 'bg-danger-500'}`} />
                  <span>{food.isAvailable ? '🟢 Menu: ON' : '🔴 Menu: OFF'}</span>
                </button>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1 border-l border-surface-200 dark:border-surface-700 pl-3">
                  <Link
                    to={`/vendor/edit-food/${food._id}`}
                    className="p-2 rounded-xl text-primary-600 hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-colors"
                    title="Edit Item Details"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => deleteFood(food._id, food.name)}
                    className="p-2 rounded-xl text-danger-500 hover:bg-danger-500/10 dark:hover:bg-danger-900/20 transition-colors"
                    title="Delete Item"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageMenu;
