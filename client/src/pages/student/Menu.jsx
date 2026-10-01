import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import MenuCard from '../../components/student/MenuCard';
import CategoryFilter from '../../components/student/CategoryFilter';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, available: true };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await API.get('/foods', { params });
      setFoods(data.data);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    API.get('/categories?active=true').then(res => setCategories(res.data.data)).catch(() => {});
    API.get('/favorites').then(res => setFavorites(res.data.data?.map(f => f._id) || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  const toggleFavorite = async (foodId) => {
    try {
      if (favorites.includes(foodId)) {
        await API.delete(`/favorites/${foodId}`);
        setFavorites(prev => prev.filter(id => id !== foodId));
        toast.success('Removed from favorites');
      } else {
        await API.post('/favorites', { foodId });
        setFavorites(prev => [...prev, foodId]);
        toast.success('Added to favorites');
      }
    } catch (err) { toast.error('Failed to update favorites'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🍽️ Browse Menu</h1>
        <p className="text-surface-500 mt-1">Find your favorite food and order ahead</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search food..." className="flex-1" />
        <div className="flex gap-2">
          <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} className="input-field w-24" />
          <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} className="input-field w-24" />
        </div>
      </div>

      {/* Categories */}
      <CategoryFilter categories={categories} selected={selectedCategory} onSelect={(id) => { setSelectedCategory(id); setPage(1); }} />

      {/* Food grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <LoadingSkeleton type="card" count={8} />
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-xl text-surface-500">No food items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map(food => (
            <MenuCard
              key={food._id}
              food={food}
              onAddToCart={addToCart}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.includes(food._id)}
              onClick={() => navigate(`/student/menu/${food._id}`)}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default Menu;
