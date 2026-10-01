import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDateTime } from '../../utils/helpers';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    API.get(`/admin/activity-logs?page=${page}`).then(res => { setLogs(res.data.data); setTotalPages(res.data.pagination?.pages || 1); setLoading(false); }).catch(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'userType', label: 'Role', render: (v) => <span className="badge badge-info">{v}</span> },
    { key: 'action', label: 'Action', render: (v) => <span className="font-bold text-surface-900 dark:text-white">{v}</span> },
    { key: 'description', label: 'Description' },
    { key: 'ipAddress', label: 'IP' },
    { key: 'createdAt', label: 'Timestamp', render: (v) => formatDateTime(v) },
  ];

  if (loading) return <LoadingSkeleton type="table-row" count={5} />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">📜 Activity Logs</h1>
      <DataTable columns={columns} data={logs} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ActivityLogs;
