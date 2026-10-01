import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import MenuForm from '../../components/vendor/MenuForm';
import toast from 'react-hot-toast';

const AddFood = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { API.get('/categories?active=true').then(res => setCategories(res.data.data)).catch(() => {}); }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await API.post('/foods', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Food item added!');
      navigate('/vendor/menu');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">➕ Add Food Item</h1>
      <div className="glass p-6"><MenuForm categories={categories} onSubmit={handleSubmit} loading={loading} /></div>
    </div>
  );
};

export default AddFood;
