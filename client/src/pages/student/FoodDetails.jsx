import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import { useCart } from '../../hooks/useCart';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { HiOutlineStar, HiOutlineClock, HiOutlineShoppingCart } from 'react-icons/hi2';

const FoodDetails = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodRes, reviewRes] = await Promise.all([
          API.get(`/foods/${id}`),
          API.get(`/reviews/food/${id}`),
        ]);
        setFood(foodRes.data.data);
        setReviews(reviewRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSkeleton type="text" count={3} />;
  if (!food) return <p className="text-center py-20 text-surface-500">Food not found</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div className="glass overflow-hidden">
        <img src={getImageUrl(food.image)} alt={food.name} className="w-full h-64 md:h-80 object-cover" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">{food.name}</h1>
              <p className="text-surface-500 mt-1">{food.vendor?.shopName}</p>
            </div>
            <span className="text-3xl font-display font-bold text-primary-600 dark:text-primary-400">{formatPrice(food.price)}</span>
          </div>
          <p className="text-surface-600 dark:text-surface-400 mb-4">{food.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-surface-500 mb-6">
            <span className="flex items-center gap-1"><HiOutlineClock /> {food.preparationTime} min</span>
            <span className="flex items-center gap-1"><HiOutlineStar className="text-warning-500" /> {food.rating?.toFixed(1)} ({food.totalRatings} ratings)</span>
            <span className={food.isVeg ? 'text-success-600' : 'text-danger-500'}>{food.isVeg ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}</span>
          </div>
          {food.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {food.tags.map(tag => <span key={tag} className="badge-primary">{tag}</span>)}
            </div>
          )}
          <button onClick={() => addToCart(food)} disabled={!food.isAvailable} className="btn-primary flex items-center gap-2">
            <HiOutlineShoppingCart className="w-5 h-5" /> {food.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="glass p-6">
          <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-4">Reviews ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="border-b border-surface-100 dark:border-surface-800 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-surface-900 dark:text-white">{r.student?.name}</span>
                  <span className="text-warning-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-surface-600 dark:text-surface-400">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FoodDetails;
