import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import MenuCard from '../../components/student/MenuCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/favorites').then(res => { setFavorites(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const removeFavorite = async (foodId) => {
    try {
      await API.delete(`/favorites/${foodId}`);
      setFavorites(prev => prev.filter(f => f._id !== foodId));
      toast.success('Removed from favorites');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><LoadingSkeleton type="card" count={6} /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">❤️ My Favorites</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-20"><p className="text-5xl mb-4">💔</p><p className="text-xl text-surface-500">No favorites yet</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(food => (
            <MenuCard key={food._id} food={food} onAddToCart={addToCart} onToggleFavorite={removeFavorite} isFavorite={true} onClick={() => navigate(`/student/menu/${food._id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
