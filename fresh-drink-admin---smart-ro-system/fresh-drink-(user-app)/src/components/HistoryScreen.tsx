import React from 'react';
import { ChevronLeft, Clock, Droplet } from 'lucide-react';
import { WaterLog } from '../types';

interface HistoryScreenProps { onBack: () => void; logs: WaterLog[]; }

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, logs }) => {
  const completedLiters = logs.filter((log) => log.status === 'completed').reduce((sum, log) => sum + log.amount / 1000, 0);
  const pendingCount = logs.filter((log) => log.status === 'requested').length;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index));
    const liters = logs.filter((log) => log.status === 'completed' && new Date(log.createdAt).toDateString() === date.toDateString()).reduce((sum, log) => sum + log.amount / 1000, 0);
    return { date, liters };
  });
  const maxLiters = Math.max(1, ...days.map((day) => day.liters));

  return <div className="max-w-5xl mx-auto space-y-4">
    <header className="flex items-center gap-3"><button type="button" onClick={onBack} className="rounded-full bg-white border p-2 text-sky-700"><ChevronLeft className="w-5 h-5"/></button><div><h1 className="text-xl font-bold text-slate-900">ประวัติการจ่ายน้ำ</h1><p className="text-xs text-slate-500">รายการที่บันทึกกับเครื่องที่เลือก</p></div></header>
    <section className="grid sm:grid-cols-2 gap-3"><div className="rounded-2xl bg-white border p-4"><p className="text-xs text-slate-500">ปริมาณจ่ายสำเร็จ</p><p className="mt-1 text-2xl font-bold text-sky-700">{completedLiters.toFixed(2)} ลิตร</p></div><div className="rounded-2xl bg-white border p-4"><p className="text-xs text-slate-500">คำขอที่รอเครื่องตอบกลับ</p><p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount} รายการ</p></div></section>
    <section className="rounded-2xl bg-white border p-5"><h2 className="font-semibold text-slate-800 mb-4">ปริมาณจ่ายสำเร็จ 7 วัน</h2><div className="h-40 grid grid-cols-7 gap-2 items-end">{days.map(({ date, liters }) => <div key={date.toISOString()} className="h-full flex flex-col items-center justify-end gap-2"><span className="text-[10px] text-slate-500">{liters.toFixed(1)}</span><div className="w-full max-w-10 rounded-t-lg bg-sky-500" style={{height: `${liters ? Math.max(5, liters / maxLiters * 75) : 2}%`}}/><span className="text-[10px] text-slate-500">{new Intl.DateTimeFormat('th-TH',{weekday:'short'}).format(date)}</span></div>)}</div></section>
    <section className="rounded-2xl bg-white border p-4"><h2 className="font-semibold text-slate-800 mb-3">รายการล่าสุด</h2>{logs.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีประวัติการจ่ายน้ำ</p> : <div className="divide-y divide-slate-100">{logs.map((log) => <div key={log.id} className="py-3 flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><span className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600"><Droplet className="w-4 h-4"/></span><div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{log.unitDisplay} · {log.dispenserName}</p><p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/>{log.date}</p></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${log.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : log.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>{log.status === 'completed' ? 'จ่ายแล้ว' : log.status === 'failed' ? 'ไม่สำเร็จ' : 'รอเครื่องตอบกลับ'}</span></div>)}</div>}</section>
  </div>;
};
