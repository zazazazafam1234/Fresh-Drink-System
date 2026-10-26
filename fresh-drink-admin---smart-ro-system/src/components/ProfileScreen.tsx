import React, { useState } from 'react';
import { CheckCircle2, Server } from 'lucide-react';
import { Machine } from '../types';

interface ProfileScreenProps {
  currentMachine: string;
  machines: Machine[];
  onSelectMachine: (machine: string) => void;
  onCreateMachine: (machine: Machine) => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentMachine, machines, onSelectMachine, onCreateMachine }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [filterPercent, setFilterPercent] = useState('100');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onCreateMachine({ id: id.trim(), name: name.trim(), location: location.trim(), filterPercent: Number(filterPercent) });
      setId(''); setName(''); setLocation(''); setFilterPercent('100');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save machine');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 pb-4">
      <div><h1 className="text-lg font-bold text-slate-900">Profile & machines</h1><p className="text-xs text-slate-500">Manage machines saved in your database.</p></div>
      <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 mb-3"><Server className="w-4 h-4 text-blue-600"/><h2 className="text-sm font-bold text-slate-900">RO machines ({machines.length})</h2></div>
        {machines.length === 0 ? <p className="text-xs text-slate-500 mb-3">No machines yet. Add the machine you want to monitor.</p> : <div className="space-y-2 mb-4">{machines.map((machine) => <button key={machine.id} onClick={() => onSelectMachine(machine.id)} className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${currentMachine === machine.id ? 'border-blue-500 bg-blue-50/40' : 'border-slate-100 bg-slate-50/50'}`}><span><span className="block text-xs font-bold text-slate-900">{machine.name} <span className="text-slate-500">({machine.id})</span></span><span className="text-[11px] text-slate-500">{machine.location || 'No location provided'}</span></span>{currentMachine === machine.id && <CheckCircle2 className="w-5 h-5 text-blue-600"/>}</button>)}</div>}
        <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
          <input required maxLength={64} value={id} onChange={(event) => setId(event.target.value)} placeholder="Machine ID (e.g. RO-01)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
          <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Machine name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
          <input maxLength={255} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location (optional)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
          <input required type="number" min="0" max="100" step="0.1" value={filterPercent} onChange={(event) => setFilterPercent(event.target.value)} aria-label="Current filter life remaining percent" placeholder="Filter life remaining (%)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
          {error && <p role="alert" className="text-xs text-rose-600 sm:col-span-2">{error}</p>}
          <button disabled={saving} className="rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-2">{saving ? 'Saving…' : 'Add machine'}</button>
        </form>
      </section>
    </div>
  );
};
