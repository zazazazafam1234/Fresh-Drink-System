import React, { useState } from 'react';
import { ArrowLeft, Droplet, CupSoda, AlertTriangle } from 'lucide-react';

interface DispensingScreenProps {
  onBack: () => void;
  onCompleteDispense: (amountMl: number) => Promise<void>;
  dispenserName: string;
}

const presets = [200, 350, 500, 1000];

export const DispensingScreen: React.FC<DispensingScreenProps> = ({ onBack, onCompleteDispense, dispenserName }) => {
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const requestedAmount = custom ? Number(custom) : amount;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setError('');
    try { await onCompleteDispense(requestedAmount); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'ส่งคำขอไม่สำเร็จ'); }
    finally { setSaving(false); }
  };

  return <section className="max-w-2xl mx-auto rounded-3xl bg-white border border-slate-100 shadow-sm p-5 sm:p-8">
    <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700"><ArrowLeft className="w-4 h-4"/>กลับหน้าหลัก</button>
    <div className="text-center"><div className="mx-auto mb-3 w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center"><Droplet className="w-8 h-8 fill-sky-500"/></div><h1 className="text-xl font-bold text-slate-900">ขอจ่ายน้ำ</h1><p className="text-sm text-slate-500 mt-1">{dispenserName}</p></div>
    <form onSubmit={submit} className="mt-7">
      <p className="text-sm font-semibold text-slate-800 mb-3">เลือกปริมาณ</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{presets.map((ml) => <button key={ml} type="button" onClick={() => {setAmount(ml);setCustom('');}} className={`rounded-2xl border p-4 text-center ${!custom && amount === ml ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-700'}`}><CupSoda className="w-5 h-5 mx-auto mb-1"/><span className="text-sm font-bold">{ml >= 1000 ? `${ml / 1000} L` : `${ml} ml`}</span></button>)}</div>
      <label className="block mt-4 text-sm font-medium text-slate-700">หรือกำหนดเอง (100–5,000 ml)<input type="number" min="100" max="5000" step="50" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="ปริมาณเป็น ml" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3"/></label>
      <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/><span>คำขอนี้จะถูกบันทึกในระบบ Admin แต่จะยังไม่จ่ายน้ำจริงจนกว่าจะเชื่อมต่อ controller ของเครื่องจ่ายน้ำ</span></div>
      {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={saving || !Number.isInteger(requestedAmount) || requestedAmount < 100 || requestedAmount > 5000} className="mt-5 w-full rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 px-4 py-3.5 text-white font-semibold">{saving ? 'กำลังบันทึกคำขอ…' : `ส่งคำขอ ${requestedAmount} ml`}</button>
    </form>
  </section>;
};
