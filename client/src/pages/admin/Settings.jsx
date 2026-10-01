import { useState } from 'react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    canteenName: 'Campus Central Canteen',
    currency: 'INR (₹)',
    taxRate: '5',
    serviceFee: '0',
    orderTimeoutMins: '30',
    allowPreOrdersDays: '1',
    maintenanceMode: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved for this session (demo only — not persisted)');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">⚙️ System Settings</h1>
      <div className="p-4 glass rounded-2xl bg-warning-500/10 border border-warning-500/25 text-warning-700 dark:text-warning-300 text-xs leading-relaxed">
        ⚠️ Demo only — these settings are stored in the browser session and are <strong>not persisted</strong> to the backend. Changes are not applied server-side.
      </div>
      <div className="glass p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Canteen System Name</label>
            <input value={settings.canteenName} onChange={e => setSettings({...settings, canteenName: e.target.value})} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Currency Symbol</label>
              <input value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">GST/Tax Rate (%)</label>
              <input type="number" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Auto-Cancel Timeout (mins)</label>
              <input type="number" value={settings.orderTimeoutMins} onChange={e => setSettings({...settings, orderTimeoutMins: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Advance Pre-Order Limit (days)</label>
              <input type="number" value={settings.allowPreOrdersDays} onChange={e => setSettings({...settings, allowPreOrdersDays: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})} className="w-5 h-5 text-danger-500 rounded" />
              <div>
                <span className="font-semibold text-surface-900 dark:text-white">Maintenance Mode</span>
                <p className="text-xs text-surface-400">Temporarily disable student orders</p>
              </div>
            </label>
          </div>
          <button type="submit" className="btn-primary w-full">Save System Configurations</button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
