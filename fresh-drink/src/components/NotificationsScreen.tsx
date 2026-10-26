import React, { useState } from 'react';
import {
  ChevronLeft,
  Droplet,
  Bell,
  Check,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsScreenProps {
  onBack: () => void;
  notifications: NotificationItem[];
  onTriggerAutoFlush: () => void | Promise<void>;
  onMarkAllAsRead: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  notifications,
  onTriggerAutoFlush,
  onMarkAllAsRead,
}) => {
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushDoneToast, setFlushDoneToast] = useState(false);
  const [flushError, setFlushError] = useState('');

  const handleFlush = async () => {
    setIsFlushing(true);
    setFlushError('');
    try {
      await onTriggerAutoFlush();
      setFlushDoneToast(true);
      setTimeout(() => setFlushDoneToast(false), 3000);
    } catch (reason) {
      setFlushError(reason instanceof Error ? reason.message : 'Could not send Auto Flush request');
    } finally {
      setIsFlushing(false);
    }
  };

  return (
    <div className="flex flex-col pb-24 px-4 pt-2">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          title="ย้อนกลับ"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Brand Logo & Water System subtitle */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
            <Droplet className="w-4 h-4 fill-sky-500 text-sky-500" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 leading-none">
              Fresh Drink
            </span>
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider block uppercase">
              WATER SYSTEM
            </span>
          </div>
        </div>

        {/* Notification Bell with Red Dot */}
        <div className="relative w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </div>
      </header>

      {/* Page Title & Mark all as read */}
      <div className="flex items-center justify-between mt-2 mb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          การแจ้งเตือน
        </h1>
        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>อ่านทั้งหมด</span>
        </button>
      </div>

      {/* Flush Done Toast Notification */}
      {flushDoneToast && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
          <span>ส่งคำขอ Auto Flush แล้ว กำลังรอเครื่องยืนยันผล</span>
        </div>
      )}
      {flushError && <div role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{flushError}</div>}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((item) => {
          if (item.type === 'success') {
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/90 flex items-start gap-3.5 relative overflow-hidden"
              >
                {/* Green Icon Circle */}
                <div className="w-12 h-12 rounded-full bg-emerald-100/70 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-12">
                  <h3 className="text-sm font-bold text-emerald-700 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Time & Dot on Right */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">
                    {item.time}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            );
          }

          if (item.type === 'warning') {
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/90 flex items-start gap-3.5 relative overflow-hidden"
              >
                {/* Amber Icon Circle */}
                <div className="w-12 h-12 rounded-full bg-amber-100/70 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-xs">
                    <AlertTriangle className="w-4 h-4 fill-white text-amber-400 stroke-amber-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-12">
                  <h3 className="text-sm font-bold text-amber-800 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Time & Dot on Right */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">
                    {item.time}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              </div>
            );
          }

          // Error / Alert Card
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/90 flex items-start gap-3.5 relative overflow-hidden"
            >
              {/* Red Icon Circle */}
              <div className="w-12 h-12 rounded-full bg-rose-100/70 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xs">
                  <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-12">
                <h3 className="text-sm font-bold text-rose-600 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Time & Dot on Right */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                <span className="text-xs text-slate-400 font-medium">
                  {item.time}
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Auto Flush trigger action */}
      <div className="mt-6 p-4 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-sky-950">ล้างระบบท่ออัตโนมัติ</h4>
          <p className="text-[11px] text-sky-700 mt-0.5">
            สั่งรัน Auto Flush ทำความสะอาดระบบ RO ทันที
          </p>
        </div>
        <button
          type="button"
          onClick={handleFlush}
          disabled={isFlushing}
          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
          <span>{isFlushing ? 'กำลังฟลัช...' : 'สั่ง Auto Flush'}</span>
        </button>
      </div>
    </div>
  );
};
