import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, X } from 'lucide-react';

interface AutoFlushModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlushComplete: () => Promise<void>;
  machineName?: string;
}

export const AutoFlushModal: React.FC<AutoFlushModalProps> = ({ isOpen, onClose, onFlushComplete, machineName }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const submit = async () => {
    setSaving(true);
    try { await onFlushComplete(); setSaved(true); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save request'); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
      <button aria-label="Close" onClick={() => { setSaved(false); onClose(); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X className="w-5 h-5"/></button>
      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><RefreshCw className="w-7 h-7"/></div>
      <h2 className="text-lg font-bold text-center text-slate-900">Auto Flush request</h2>
      <p className="text-sm text-center text-slate-600 mt-2">Machine: <strong>{machineName || 'No machine selected'}</strong></p>
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/><span>This records a request in MySQL. It does not operate the RO valves until a device controller is connected.</span></div>
      {saved && <div role="status" className="mt-3 text-sm text-emerald-700 flex gap-2 items-center"><CheckCircle2 className="w-4 h-4"/>Request saved in database.</div>}
      {error && <div role="alert" className="mt-3 text-sm text-rose-700">{error}</div>}
      <div className="flex gap-2 mt-5"><button onClick={() => { setSaved(false); onClose(); }} className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm">{saved ? 'Close' : 'Cancel'}</button>{!saved && <button disabled={saving || !machineName} onClick={submit} className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save request'}</button>}</div>
    </div>
  </div>;
};
