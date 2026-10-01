import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineDocumentArrowDown, HiOutlineTableCells } from 'react-icons/hi2';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    try {
      const response = await API.get(`/reports/export/pdf?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('PDF report downloaded!');
    } catch (err) { toast.error('Failed to export PDF'); }
  };

  const handleExportExcel = async () => {
    try {
      const response = await API.get(`/reports/export/excel?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      toast.success('Excel report downloaded!');
    } catch (err) { toast.error('Failed to export Excel'); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">📄 System Reports & Exports</h1>
      <div className="glass p-6 space-y-6">
        <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">Date Filter (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
            <HiOutlineDocumentArrowDown className="w-5 h-5" /> Export PDF Summary
          </button>
          <button onClick={handleExportExcel} className="btn-accent flex items-center gap-2">
            <HiOutlineTableCells className="w-5 h-5" /> Export Excel Detailed Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
