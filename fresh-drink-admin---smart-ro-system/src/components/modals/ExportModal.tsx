import React from 'react';
import { Download, FileText, Table, X } from 'lucide-react';
import { DashboardData } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  type: 'pdf' | 'excel' | null;
  dashboard: DashboardData | null;
  onClose: () => void;
}

const csvCell = (value: unknown) => {
  const text = String(value ?? '');
  const safeText = /^[=+@\-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
};

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, type, dashboard, onClose }) => {
  if (!isOpen || !type || !dashboard) return null;
  const isPdf = type === 'pdf';

  const download = () => {
    if (isPdf) {
      onClose();
      window.setTimeout(() => window.print(), 100);
      return;
    }
    const rows: unknown[][] = [
      ['Section', 'Date/time', 'Machine', 'Details', 'Status / value'],
      ...dashboard.realtimeData.map((row) => ['Sensor', row.time, dashboard.machine.id, `Pressure ${row.pressure} bar`, `Purity ${row.purity}%`]),
      ...dashboard.alerts.map((row) => ['Alert', row.time, row.machineId, row.title, row.status]),
      ...dashboard.dispenseRequests.map((row) => ['User dispense request', row.createdAt, row.machineId, `${row.amountMl} ml`, row.status]),
      ...dashboard.flushHistory.map((row) => ['Auto Flush', row.date, dashboard.machine.id, row.triggerType, row.status]),
      ...dashboard.maintenanceLogs.map((row) => ['Maintenance', row.dateTime, row.machineId, `${row.technician}: ${row.notes}`, 'Recorded']),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dashboard.machine.id}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
      <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
      <div className="flex items-center gap-3 mb-5"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPdf ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{isPdf ? <FileText className="w-6 h-6"/> : <Table className="w-6 h-6"/>}</div><div><h2 className="text-lg font-bold text-slate-900">{isPdf ? 'Print report to PDF' : 'Download report CSV'}</h2><p className="text-xs text-slate-500">{dashboard.machine.name} ({dashboard.machine.id}) · saved data only</p></div></div>
      <p className="text-sm text-slate-600 mb-5">{isPdf ? 'Open the browser print dialog and choose Save as PDF.' : 'Exports sensor readings, alerts, flush requests and maintenance logs currently saved for this machine.'}</p>
      <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm">Cancel</button><button onClick={download} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2"><Download className="w-4 h-4"/>{isPdf ? 'Print / Save PDF' : 'Download CSV'}</button></div>
    </div>
  </div>;
};
