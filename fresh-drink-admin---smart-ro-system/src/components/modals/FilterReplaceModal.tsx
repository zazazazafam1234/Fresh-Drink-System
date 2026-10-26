import React, { useState } from 'react';
import { Calendar, ShieldCheck, User, X } from 'lucide-react';

interface FilterReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, technician: string, filterType: string) => Promise<void>;
}

export const FilterReplaceModal: React.FC<FilterReplaceModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [technician, setTechnician] = useState('');
  const [filterType, setFilterType] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try { await onConfirm(date, technician, filterType); onClose(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save filter replacement'); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
      <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
      <div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck className="w-6 h-6"/></div><div><h2 className="text-lg font-bold text-slate-900">Record filter replacement</h2><p className="text-xs text-slate-500">This resets the selected machine filter to 100%.</p></div></div>
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700">Replacement date<div className="relative mt-1"><Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/><input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm"/></div></label>
        <label className="block text-xs font-semibold text-slate-700">Technician<div className="relative mt-1"><User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/><input required maxLength={160} value={technician} onChange={(event) => setTechnician(event.target.value)} className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm"/></div></label>
        <label className="block text-xs font-semibold text-slate-700">Filter type<input required maxLength={160} value={filterType} onChange={(event) => setFilterType(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/></label>
        {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
        <div className="flex gap-2 pt-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm">Cancel</button><button disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save record'}</button></div>
      </form>
    </div>
  </div>;
};
