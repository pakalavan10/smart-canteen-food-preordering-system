import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiOutlineLockOpen } from 'react-icons/hi2';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/admin/students').then(res => { setStudents(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleBlock = async (id, isActive) => {
    try {
      await API.patch(`/admin/students/${id}/toggle`);
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isActive: !isActive } : s));
      toast.success(isActive ? 'Student blocked' : 'Student unblocked');
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'name', label: 'Name', render: (v, row) => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">{v?.[0]}</div><span className="font-medium">{v}</span></div> },
    { key: 'email', label: 'Email' },
    { key: 'rollNumber', label: 'Roll No' },
    { key: 'department', label: 'Department' },
    { key: 'createdAt', label: 'Joined', render: (v) => formatDate(v) },
    { key: 'isActive', label: 'Status', render: (v) => <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Active' : 'Blocked'}</span> },
    { key: '_id', label: 'Actions', sortable: false, render: (v, row) => (
      <button onClick={() => toggleBlock(v, row.isActive)} className={`p-2 rounded-lg ${row.isActive ? 'hover:bg-danger-500/10 dark:hover:bg-danger-900/20' : 'hover:bg-success-500/10 dark:hover:bg-success-900/20'}`}>
        {row.isActive ? <HiOutlineLockClosed className="w-5 h-5 text-danger-500" /> : <HiOutlineLockOpen className="w-5 h-5 text-success-600" />}
      </button>
    )},
  ];

  if (loading) return <LoadingSkeleton type="table-row" count={5} />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🎓 Students ({students.length})</h1>
      <SearchBar value={search} onChange={setSearch} placeholder="Search students..." />
      <DataTable columns={columns} data={filtered} />
    </div>
  );
};

export default Students;
