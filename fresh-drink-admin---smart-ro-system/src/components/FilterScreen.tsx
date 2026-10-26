import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Droplets,
  Clock,
  Zap,
  FileText,
  ChevronRight,
  Info,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { AutoFlushRecord, TabType } from '../types';
import { WaterDropLogo } from './WaterDropLogo';

interface FilterScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: TabType) => void;
  onTriggerFlush: () => void;
  onOpenReplaceModal: () => void;
  filterPercent: number;
  flushHistory: AutoFlushRecord[];
}

export const FilterScreen: React.FC<FilterScreenProps> = ({
  onBack,
  onNavigateTab,
  onTriggerFlush,
  onOpenReplaceModal,
  filterPercent,
  flushHistory,
}) => {
  const [showAllHistory, setShowAllHistory] = useState(false);

  // SVG Donut calculation
  const size = 128;
  const strokeWidth = 11;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (filterPercent / 100) * circumference;

  const displayedHistory = showAllHistory ? flushHistory : flushHistory.slice(0, 4);

  return (
    <div className="space-y-3.5 pb-2">
      {/* Top Header bar matching Image 3 */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 text-slate-700 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors"
          title="ย้อนกลับ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900">จัดการไส้กรอง</h1>
        <div className="w-8 h-8 flex items-center justify-center text-blue-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Subheader info card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <WaterDropLogo size={32} />
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Fresh Drink</h2>
            <p className="text-xs text-slate-500 leading-tight">Admin</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
          <span>สถานะ ระบบปกติ</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Main Circular Gauge Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Circular Donut Ring */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
              />
              {/* Progress arc */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#2563EB"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] text-slate-500 font-medium">ไส้กรองเหลือ</span>
              <span className="text-2xl font-extrabold text-blue-600 tracking-tight leading-tight">
                {filterPercent}%
              </span>
              <div className="inline-flex items-center gap-0.5 text-blue-700 text-[11px] font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ปกติ</span>
              </div>
            </div>
          </div>

          {/* Details list on the right */}
          <div className="flex-1 w-full space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">วันที่ติดตั้ง</div>
                <div className="font-semibold text-slate-800">15 เม.ย. 2567</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">ปริมาณน้ำที่กรองแล้ว</div>
                <div className="font-semibold text-slate-800">2,880 L <span className="font-normal text-slate-500">จาก 4,000 L</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">อายุการใช้งาน</div>
                <div className="font-semibold text-slate-800">4,000 L <span className="font-normal text-slate-500">(ประมาณ 12–18 เดือน)</span></div>
              </div>
            </div>

            {/* Horizontal progress */}
            <div className="pt-1">
              <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-700 flex items-center justify-end pr-1.5"
                  style={{ width: `${filterPercent}%` }}
                >
                  <span className="text-[9px] text-white font-bold">{filterPercent}%</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0 L</span>
                <span>4,000 L</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Flush History Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">ประวัติ Auto Flush</h3>
          </div>
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5"
          >
            {showAllHistory ? 'ย่อลง' : 'ดูทั้งหมด'} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedHistory.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {item.time}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {item.date}
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <span className="text-[11px] text-slate-600 hidden xs:inline-block">
                  {item.triggerType}
                </span>

                {item.status === 'requested' ? (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">Request saved</span>
                ) : item.status === 'success' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    สำเร็จ <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    ล้มเหลว <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>Auto Flush ช่วยชำระล้างไส้กรองอัตโนมัติเพื่อรักษาประสิทธิภาพการกรอง</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2.5 pt-1">
        <button
          id="filter-trigger-autoflush-btn"
          onClick={onTriggerFlush}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-white" />
          สั่ง Auto Flush ตอนนี้
        </button>

        <button
          id="record-filter-replacement-btn"
          onClick={onOpenReplaceModal}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] text-blue-600 font-bold text-sm border border-blue-600 shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          บันทึกการเปลี่ยนไส้กรอง
        </button>
      </div>
    </div>
  );
};
