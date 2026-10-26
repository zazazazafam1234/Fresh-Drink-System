import React, { useState } from 'react';
import { Activity, ChevronDown, Droplet, Gauge, RefreshCw, ShieldCheck } from 'lucide-react';
import { DispenserOption } from '../types';

interface HomeScreenProps {
  currentDispenser: DispenserOption;
  allDispensers: DispenserOption[];
  onSelectDispenser: (dispenser: DispenserOption) => void;
  onNavigateToDispense: () => void;
  onRefreshMetrics: () => Promise<void>;
}

function telemetryLabel(machine: DispenserOption) {
  if (machine.telemetryStatus === 'recent') return 'มีข้อมูลภายใน 15 นาที';
  if (machine.telemetryStatus === 'stale') return 'ข้อมูลเก่ากว่า 15 นาที';
  return 'ยังไม่มีข้อมูลเซนเซอร์';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ currentDispenser, allDispensers, onSelectDispenser, onNavigateToDispense, onRefreshMetrics }) => {
  const [showDispenserModal, setShowDispenserModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => { setRefreshing(true); try { await onRefreshMetrics(); } finally { setRefreshing(false); } };
  const sensorTime = currentDispenser.recordedAt ? new Date(currentDispenser.recordedAt).toLocaleString('th-TH') : 'ยังไม่มีข้อมูลเซนเซอร์';
  const filterPercent = Math.max(0, Math.min(100, currentDispenser.filterRemainingPercent));

  return <div className="max-w-5xl mx-auto space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Fresh Drink</h1><p className="text-sm text-slate-500">ข้อมูลเครื่องและสถานะคำขอจากฐานข้อมูล</p></div><button type="button" onClick={() => setShowDispenserModal(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800">{currentDispenser.name}<ChevronDown className="w-4 h-4"/></button></header>
    <section className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
      <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-7 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">ข้อมูลเซนเซอร์</h2><p className="mt-1 text-xs text-slate-500">เวลา telemetry ล่าสุด: {sensorTime}</p></div><button onClick={refresh} disabled={refreshing} className="rounded-xl border border-slate-200 p-2 text-slate-500 disabled:opacity-50" aria-label="โหลดข้อมูลใหม่"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}/></button></div>
        <div className="mt-6 grid sm:grid-cols-2 gap-3"><div className="rounded-2xl bg-sky-50 p-4"><div className="flex items-center gap-2 text-sky-700 text-xs"><ShieldCheck className="w-4 h-4"/>ความบริสุทธิ์</div><p className="mt-2 text-2xl font-bold text-slate-900">{currentDispenser.purity == null ? '—' : `${currentDispenser.purity}%`}</p></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="flex items-center gap-2 text-indigo-700 text-xs"><Gauge className="w-4 h-4"/>แรงดัน</div><p className="mt-2 text-2xl font-bold text-slate-900">{currentDispenser.pressure == null ? '—' : `${currentDispenser.pressure} bar`}</p></div></div>
        <p className={`mt-4 rounded-xl border p-3 text-xs ${currentDispenser.telemetryStatus === 'recent' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{telemetryLabel(currentDispenser)} · การมีข้อมูลล่าสุดไม่ใช่การยืนยันว่าเครื่องออนไลน์หรือพร้อมจ่ายน้ำ</p>
        {currentDispenser.purity == null && <p className="mt-3 text-xs text-slate-500">ยังไม่มีค่าความบริสุทธิ์จาก telemetry ในฐานข้อมูล</p>}
      </div>
      <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-7 shadow-sm"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-sky-600"/><h2 className="font-bold text-slate-900">อายุไส้กรอง</h2></div><div className="mt-5 flex items-end justify-between"><span className="text-4xl font-bold text-slate-900">{filterPercent}%</span><span className="text-xs text-slate-500">คงเหลือ</span></div><div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${filterPercent <= 20 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{width: `${filterPercent}%`}}/></div><p className="mt-3 text-xs text-slate-500">ค่าที่บันทึกไว้ในฐานข้อมูลและจัดการจากระบบ Admin</p></div>
    </section>
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-600 to-cyan-500 p-5 sm:p-7 text-white flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-bold">ส่งคำขอจ่ายน้ำ</h2><p className="mt-1 text-sm text-sky-50">เลือกปริมาณและบันทึกคำขอให้ระบบ</p></div><button onClick={onNavigateToDispense} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-sky-700 flex items-center gap-2"><Droplet className="w-4 h-4 fill-sky-600"/>เลือกปริมาณน้ำ</button></section>
    {showDispenserModal && <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setShowDispenserModal(false)}><div role="dialog" aria-modal="true" aria-labelledby="select-machine-title" className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between mb-4"><h2 id="select-machine-title" className="font-bold text-slate-900">เลือกเครื่องจ่ายน้ำ</h2><button onClick={() => setShowDispenserModal(false)} className="text-sm text-slate-500">ปิด</button></div><div className="space-y-2">{allDispensers.map((machine) => <button key={machine.id} onClick={() => {onSelectDispenser(machine);setShowDispenserModal(false);}} className={`w-full rounded-2xl border p-3 text-left ${machine.id === currentDispenser.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}><span className="block text-sm font-semibold text-slate-900">{machine.name} · {machine.id}</span><span className="block mt-1 text-xs text-slate-500">{machine.location || 'ไม่ได้ระบุตำแหน่ง'} · {telemetryLabel(machine)}</span></button>)}</div></div></div>}
  </div>;
};