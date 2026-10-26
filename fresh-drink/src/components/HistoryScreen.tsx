import React, { useState } from 'react';
import {
  ChevronLeft,
  Droplet,
  ChevronRight,
  ChevronDown,
  Calendar,
  Filter,
} from 'lucide-react';
import { WaterLog } from '../types';
import { DispenserIllustration } from './DispenserIllustration';

interface HistoryScreenProps {
  onBack: () => void;
  logs: WaterLog[];
}

type PeriodTab = 'week' | 'today' | 'month';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onBack,
  logs,
}) => {
  const [activeTab, setActiveTab] = useState<PeriodTab>('week');
  const [showAllLogsModal, setShowAllLogsModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('6 - 12 ก.ย. 2026');

  const weeklyChart = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const liters = logs.filter((log) => log.status === 'completed' && log.createdAt && new Date(log.createdAt).toDateString() === day.toDateString()).reduce((sum, log) => sum + log.amount / 1000, 0);
    return { day: new Intl.DateTimeFormat('th-TH', { weekday: 'short' }).format(day), dateNum: String(day.getDate()), liters, isPeak: false, isCurrent: index === 6 };
  });
  const weeklyTotal = weeklyChart.reduce((sum, item) => sum + item.liters, 0);

  // Chart max scale is 2.0 liters
  const maxScale = 2.0;

  return (
    <div className="flex flex-col pb-24 px-4 pt-2">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-sky-600 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          title="ย้อนกลับ"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          ประวัติการใช้น้ำ
        </h1>

        <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
          <Droplet className="w-4 h-4 text-sky-500" />
        </div>
      </header>

      {/* Top Summary Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4 flex items-center justify-between">
        {/* Left: Dispenser gadget illustration */}
        <div className="flex items-center gap-3">
          <DispenserIllustration size={56} />
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Fresh Drink
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Smart Water Dispenser
            </p>
          </div>
        </div>

        {/* Right: Total this week & average */}
        <div className="text-right">
          <span className="text-[11px] text-slate-500 font-medium block">
            รวมสัปดาห์นี้
          </span>
          <div className="text-2xl font-black text-sky-600 leading-tight">
            {weeklyTotal.toFixed(2)} <span className="text-sm font-semibold">ลิตร</span>
          </div>
          <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
            <span>เฉลี่ย {(weeklyTotal / 7).toFixed(2)} ลิตร/วัน</span>
          </div>
        </div>
      </div>

      {/* Segmented Filter Tab: สัปดาห์ | วันนี้ | เดือน */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('week')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'week'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          สัปดาห์
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'today'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          วันนี้
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('month')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'month'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          เดือน
        </button>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-800">
            การใช้น้ำรายวัน <span className="text-sky-600 font-normal">(ลิตร)</span>
          </h3>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer">
            <span>{selectedDateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Bar Chart Area */}
        <div className="relative h-44 w-full pt-4 pb-8 flex items-end">
          {/* Horizontal Dotted Gridlines & Y-Axis Labels */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
            <div className="flex items-center w-full">
              <span className="text-[10px] text-slate-400 w-6">2.0</span>
              <div className="flex-1 border-b border-dashed border-slate-200" />
            </div>
            <div className="flex items-center w-full">
              <span className="text-[10px] text-slate-400 w-6">1.5</span>
              <div className="flex-1 border-b border-dashed border-slate-200" />
            </div>
            <div className="flex items-center w-full">
              <span className="text-[10px] text-slate-400 w-6">1.0</span>
              <div className="flex-1 border-b border-dashed border-slate-200" />
            </div>
            <div className="flex items-center w-full">
              <span className="text-[10px] text-slate-400 w-6">0.5</span>
              <div className="flex-1 border-b border-dashed border-slate-200" />
            </div>
            <div className="flex items-center w-full">
              <span className="text-[10px] text-slate-400 w-6">0</span>
              <div className="flex-1 border-b border-slate-200" />
            </div>
          </div>

          {/* 7 Day Bars Grid */}
          <div className="w-full pl-6 grid grid-cols-7 gap-2 items-end h-full relative z-10">
            {weeklyChart.map((item, index) => {
              const heightPercent = Math.min(100, (item.liters / maxScale) * 100);
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-end h-full group"
                >
                  {/* Bar Value above */}
                  <span className="text-[9px] font-semibold text-slate-700 mb-1 leading-none group-hover:text-sky-600 transition-colors">
                    {item.liters.toFixed(2)}
                  </span>

                  {/* Bar Column */}
                  <div className="w-full max-w-[28px] h-28 flex items-end justify-center">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                        item.isPeak
                          ? 'bg-sky-500 shadow-xs'
                          : item.isCurrent
                          ? 'bg-sky-100/60 border border-sky-300'
                          : item.liters > 0
                          ? 'bg-sky-300'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Bottom Day & Date Labels */}
                  <div className="absolute -bottom-6 flex flex-col items-center">
                    <span className="text-[10px] font-medium text-slate-700">
                      {item.day}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-none">
                      {item.dateNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Logs: รายการล่าสุด */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">รายการล่าสุด</h3>
          <button
            type="button"
            onClick={() => setShowAllLogsModal(true)}
            className="flex items-center gap-0.5 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            <span>ดูทั้งหมด</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="space-y-2">
          {logs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-all"
            >
              {/* Left: Droplet Icon in Circle */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-100/60 shrink-0">
                  <Droplet className="w-4 h-4 text-sky-500" />
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <span>{log.date}</span>
                  <span className="text-slate-300 font-light">|</span>
                  <span className="text-slate-500">{log.time}</span>
                </div>
              </div>

              {/* Right: Amount & Bottle Icon */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-sky-600">
                  {log.unitDisplay}
                </span>
                {/* Bottle outline SVG */}
                <div className="w-5 h-6 text-slate-400 flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-5"
                  >
                    <path d="M6 2H10V5H6V2Z" />
                    <path d="M4 6C4 5.44772 4.44772 5 5 5H11C11.5523 5 12 5.44772 12 6V7C12 7.7 13 8.3 13.5 9C14 9.7 14 10.5 14 11.5V20C14 21.1 13.1 22 12 22H4C2.9 22 2 21.1 2 20V11.5C2 10.5 2 9.7 2.5 9C3 8.3 4 7.7 4 7V6Z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Logs Modal */}
      {showAllLogsModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowAllLogsModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-xl border border-slate-100 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  ประวัติการกดน้ำทั้งหมด ({logs.length} ครั้ง)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllLogsModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                ปิด
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50/70 rounded-2xl p-3 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100/70 flex items-center justify-center text-sky-600">
                      <Droplet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        {log.date} • {log.time}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.dispenserName}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-600">
                    {log.unitDisplay}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
