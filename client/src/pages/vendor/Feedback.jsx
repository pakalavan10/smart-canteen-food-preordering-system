import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { timeAgo } from '../../utils/helpers';
import { HiOutlineStar } from 'react-icons/hi2';

const Feedback = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    API.get(`/vendors/feedback?page=${page}`).then(res => { setReviews(res.data.data); setTotalPages(res.data.pagination?.pages || 1); setLoading(false); }).catch(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingSkeleton type="table-row" count={5} />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">💬 Customer Feedback</h1>
      {reviews.length === 0 ? (
        <div className="text-center py-20"><p className="text-5xl mb-4">💬</p><p className="text-xl text-surface-500">No reviews yet</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r._id} className="glass p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">{r.student?.name?.[0]}</div>
                  <div><p className="font-semibold text-surface-900 dark:text-white">{r.student?.name}</p><p className="text-xs text-surface-400">{timeAgo(r.createdAt)}</p></div>
                </div>
                <div className="flex items-center gap-1 text-warning-500">{Array.from({length: 5}, (_, i) => <HiOutlineStar key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : ''}`} />)}</div>
              </div>
              <p className="text-sm text-surface-500 ml-13">{r.food?.name}</p>
              {r.comment && <p className="text-surface-700 dark:text-surface-300 mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default Feedback;
