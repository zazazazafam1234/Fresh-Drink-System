import React, { useState } from 'react';
import { AlertTriangle, Bell, Check, CheckCheck, ChevronLeft, CircleAlert, Sparkles } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsScreenProps {
  onBack: () => void;
  notifications: NotificationItem[];
  onTriggerAutoFlush: () => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack, notifications, onTriggerAutoFlush, onMarkAllAsRead }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const runFlush = async () => { setBusy(true); setError(''); try { await onTriggerAutoFlush(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'บันทึกคำขอไม่สำเร็จ'); } finally { setBusy(false); } };
  const markRead = async () => { setBusy(true); setError(''); try { await onMarkAllAsRead(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'อัปเดตสถานะไม่สำเร็จ'); } finally { setBusy(false); } };

  return <div className="max-w-4xl mx-auto space-y-4">
    <header className="flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={onBack} className="rounded-full bg-white border p-2 text-slate-700"><ChevronLeft className="w-5 h-5"/></button><div><h1 className="text-xl font-bold text-slate-900">การแจ้งเตือน</h1><p className="text-xs text-slate-500">ข้อมูลจากเครื่องและระบบ Admin</p></div></div><button disabled={busy || !notifications.some((item) => !item.read)} onClick={markRead} className="text-xs font-semibold text-sky-700 disabled:text-slate-400 flex items-center gap-1"><CheckCheck className="w-4 h-4"/>อ่านทั้งหมด</button></header>
    {error && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</p>}
    <div className="space-y-3">{notifications.length === 0 ? <div className="rounded-2xl bg-white border p-8 text-center text-sm text-slate-500">ไม่มีการแจ้งเตือน</div> : notifications.map((item) => <article key={item.id} className={`relative rounded-2xl bg-white border p-4 flex gap-3 ${item.read ? 'border-slate-100' : 'border-sky-200'}`}><span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${item.type === 'success' ? 'bg-emerald-50 text-emerald-600' : item.type === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'}`}>{item.type === 'success' ? <Check className="w-5 h-5"/> : item.type === 'warning' ? <AlertTriangle className="w-5 h-5"/> : <CircleAlert className="w-5 h-5"/>}</span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold text-slate-900">{item.title}</h2><p className="mt-1 text-xs text-slate-600">{item.description}</p><time className="mt-2 block text-[11px] text-slate-400">{item.time}</time></div>{!item.read && <span className="w-2 h-2 rounded-full bg-sky-500 mt-1"/>}</article>)}</div>
    <section className="rounded-2xl border border-sky-100 bg-sky-50 p-4 flex items-center justify-between gap-4"><div><h2 className="text-sm font-bold text-sky-950">บันทึกคำขอ Auto Flush</h2><p className="mt-1 text-xs text-sky-800">คำขอจะถูกส่งให้ระบบ Admin; ต้องเชื่อม controller ก่อนเครื่องจะทำงานจริง</p></div><button disabled={busy} onClick={runFlush} className="shrink-0 rounded-xl bg-sky-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 flex gap-1.5 items-center"><Sparkles className="w-4 h-4"/>{busy ? 'กำลังบันทึก…' : 'ขอ Auto Flush'}</button></section>
  </div>;
};
