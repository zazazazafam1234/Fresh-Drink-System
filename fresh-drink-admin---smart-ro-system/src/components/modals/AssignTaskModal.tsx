import React, { useState } from 'react';
import { AlertItem } from '../../types';
import { CheckSquare, UserCheck, Wrench, X } from 'lucide-react';

interface AssignTaskModalProps {
  isOpen: boolean;
  alert: AlertItem | null;
  mode: 'assign' | 'resolve';
  onClose: () => void;
  onConfirm: (alertId: string, technician?: string, resolutionNote?: string) => Promise<void>;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, alert, mode, onClose, onConfirm }) => {
  const [technician, setTechnician] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen || !alert) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try { await onConfirm(alert.id, technician, note); setTechnician(''); setNote(''); onClose(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update alert'); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
      <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
      <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">{mode === 'assign' ? <UserCheck className="w-6 h-6"/> : <CheckSquare className="w-6 h-6"/>}</div><div><h2 className="text-lg font-bold text-slate-900">{mode === 'assign' ? 'Assign maintenance task' : 'Resolve alert'}</h2><p className="text-xs text-slate-500">{alert.title}</p></div></div>
      <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 mb-4">{alert.location} · {alert.time}</p>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'assign' && <label className="block text-xs font-semibold text-slate-700">Assigned technician<div className="relative mt-1"><Wrench className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/><input required maxLength={160} value={technician} onChange={(event) => setTechnician(event.target.value)} className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm"/></div></label>}
        <label className="block text-xs font-semibold text-slate-700">{mode === 'assign' ? 'Instructions (optional)' : 'Resolution notes'}<textarea required={mode === 'resolve'} rows={3} maxLength={10000} value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
        {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
        <div className="flex gap-2 pt-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm">Cancel</button><button disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-50">{saving ? 'Saving…' : mode === 'assign' ? 'Assign task' : 'Resolve alert'}</button></div>
      </form>
    </div>
  </div>;
};
