import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import MenuForm from '../../components/vendor/MenuForm';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const EditFood = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get(`/foods/${id}`), API.get('/categories?active=true')])
      .then(([foodRes, catRes]) => { setFood(foodRes.data.data); setCategories(catRes.data.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      await API.put(`/foods/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Food updated!');
      navigate('/vendor/menu');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSkeleton type="text" count={3} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">✏️ Edit Food Item</h1>
      <div className="glass p-6"><MenuForm initialData={food} categories={categories} onSubmit={handleSubmit} loading={saving} /></div>
    </div>
  );
};

export default EditFood;
