import React, { useState } from 'react';
import {
  Menu,
  Bell,
  MapPin,
  Clock,
  ClipboardList,
  CheckCircle2,
  Wrench,
  Calendar,
  User,
  Save,
  AlertCircle,
  Hourglass,
  CheckCircle,
  SlidersHorizontal,
  Plus,
  Mail,
  Loader2,
} from 'lucide-react';
import { AlertItem, AlertStatus, MaintenanceRecord } from '../types';
import { WaterDropLogo } from './WaterDropLogo';

interface AlertsScreenProps {
  currentMachineId: string;
  alerts: AlertItem[];
  maintenanceLogs: MaintenanceRecord[];
  onAssignAlert: (alert: AlertItem) => void;
  onResolveAlert: (alert: AlertItem) => void;
  onAddMaintenanceLog: (log: Omit<MaintenanceRecord, 'id'>) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  currentMachineId,
  alerts,
  maintenanceLogs,
  onAssignAlert,
  onResolveAlert,
  onAddMaintenanceLog,
}) => {
  const [filter, setFilter] = useState<'all' | AlertStatus>('all');
  const [dateTime, setDateTime] = useState(() => { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 16); });
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestMessage, setEmailTestMessage] = useState('');

  const handleEmailTest = async () => {
    setEmailTestLoading(true);
    setEmailTestMessage('');
    try {
      const response = await fetch('/api/email/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `ส่งอีเมลไม่สำเร็จ (HTTP ${response.status})`);
      setEmailTestMessage('ส่งอีเมลทดสอบไปยัง Gmail ของบัญชี Admin แล้ว');
    } catch (error) {
      setEmailTestMessage(error instanceof Error ? error.message : 'ส่งอีเมลทดสอบไม่สำเร็จ');
    } finally {
      setEmailTestLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    onAddMaintenanceLog({
      dateTime,
      technician,
      machineId: currentMachineId,
      notes,
    });

    setNotes('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header bar matching Image 2 */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <button
          className="p-2 -ml-2 text-slate-700 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors"
          title="เมนู"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <WaterDropLogo size={28} />
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Fresh Drink</h1>
            <p className="text-[11px] text-slate-500 leading-tight">Water System</p>
          </div>
        </div>
        <button
          className="relative p-2 -mr-2 text-slate-700 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors"
          title="การแจ้งเตือน"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>

      {/* Screen Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">จัดการแจ้งเตือน</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleEmailTest} disabled={emailTestLoading} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60">
          {emailTestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {emailTestLoading ? 'กำลังส่ง...' : 'ส่งอีเมลทดสอบ'}
        </button>
        {emailTestMessage && <p role="status" className={`rounded-xl border px-3 py-2 text-xs ${emailTestMessage.startsWith('ส่งอีเมลทดสอบไปยัง') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{emailTestMessage}</p>}
      </div>

      {/* Filter Chips matching Image 2 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          ทั้งหมด
        </button>

        <button
          onClick={() => setFilter('new')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            filter === 'new'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          ใหม่
        </button>

        <button
          onClick={() => setFilter('in_progress')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            filter === 'in_progress'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          กำลังดำเนินการ
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          เสร็จสิ้น
        </button>
      </div>

      {/* Alert Cards List matching Image 2 */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-500 text-xs">
            ไม่มีรายการแจ้งเตือนในสถานะนี้
          </div>
        ) : (
          filteredAlerts.map((item) => {
            // Colors based on status / type
            const isRed = item.status === 'new';
            const isYellow = item.status === 'in_progress';
            const isGreen = item.status === 'completed';

            const borderColor = isRed
              ? 'border-l-4 border-l-rose-500'
              : isYellow
              ? 'border-l-4 border-l-amber-500'
              : 'border-l-4 border-l-emerald-500';

            const badgeClass = isRed
              ? 'bg-rose-500 text-white'
              : isYellow
              ? 'bg-amber-400 text-slate-900'
              : 'bg-emerald-600 text-white';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-xs transition-all hover:shadow-sm ${borderColor}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isRed
                          ? 'bg-rose-50 text-rose-600'
                          : isYellow
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isRed && <AlertCircle className="w-5 h-5 fill-rose-100 text-rose-600" />}
                      {isYellow && <Hourglass className="w-5 h-5 text-amber-600" />}
                      {isGreen && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[210px]">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${badgeClass}`}>
                    {item.statusText}
                  </span>
                </div>

                {/* Actions row: มอบหมายงาน / ปิดงาน */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100/80">
                  <button
                    onClick={() => onAssignAlert(item)}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    มอบหมายงาน
                  </button>

                  <button
                    onClick={() => onResolveAlert(item)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ปิดงาน
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Maintenance Form Section: บันทึกการบำรุงรักษา matching Image 2 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">บันทึกการบำรุงรักษา</h3>
        </div>

        {saveSuccess && (
          <div className="mb-3 bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            บันทึกข้อมูลการบำรุงรักษาเรียบร้อยแล้ว
          </div>
        )}

        <form onSubmit={handleLogSubmit} className="space-y-3">
          {/* Row 1: วันที่และเวลา */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              วันที่และเวลา
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Row 2: ช่างเทคนิค */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              ช่างเทคนิค
            </label>
            <div className="relative">
              <input type="text" required maxLength={160} value={technician} onChange={(e) => setTechnician(e.target.value)} className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Row 3: รายละเอียดงาน / หมายเหตุ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
              รายละเอียดงาน / หมายเหตุ
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกการตรวจเช็ค / การแก้ไข / อะไหล่ที่เปลี่ยน หมายเหตุเพิ่มเติม..."
              className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            บันทึกการบำรุงรักษา
          </button>
        </form>

        {/* Existing Logs History Accordion/List */}
        {maintenanceLogs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">ประวัติการบันทึกงานล่าสุด:</h4>
            <div className="space-y-2">
              {maintenanceLogs.slice(0, 2).map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 border border-slate-100 space-y-0.5"
                >
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{log.technician}</span>
                    <span className="text-slate-400 font-normal">{log.dateTime}</span>
                  </div>
                  <p className="text-slate-600">{log.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
