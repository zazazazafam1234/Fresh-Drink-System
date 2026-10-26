import React, { useState } from 'react';
import {
  Droplet,
  ChevronDown,
  RefreshCw,
  Gauge,
  ShieldCheck,
  CheckCircle2,
  BarChart2,
  SlidersHorizontal,
} from 'lucide-react';
import { DispenserOption } from '../types';
import { WaterDropletHero } from './WaterDropletHero';

interface HomeScreenProps {
  currentDispenser: DispenserOption;
  allDispensers: DispenserOption[];
  onSelectDispenser: (dispenser: DispenserOption) => void;
  onNavigateToDispense: () => void;
  onRefreshMetrics: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentDispenser,
  allDispensers,
  onSelectDispenser,
  onNavigateToDispense,
  onRefreshMetrics,
}) => {
  const [showDispenserModal, setShowDispenserModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdateTime = currentDispenser.telemetryRecordedAt
    ? new Date(currentDispenser.telemetryRecordedAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'ยังไม่มีข้อมูล';

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshMetrics();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filter circle progress calculation (circumference = 2 * PI * r)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (currentDispenser.filterRemainingPercent / 100) * circumference;

  return (
    <div className="flex flex-col pb-24 px-4 pt-2">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 shadow-sm border border-sky-100">
            <Droplet className="w-6 h-6 fill-sky-500 text-sky-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              Fresh Drink
            </h1>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              ระบบจ่ายน้ำดื่มอัจฉริยะ
            </p>
          </div>
        </div>

        {/* Dispenser Selector Pill */}
        <button
          id="btn-select-dispenser"
          type="button"
          onClick={() => setShowDispenserModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all text-left text-xs text-slate-700 active:scale-95"
        >
          {/* Dispenser unit icon */}
          <div className="w-4 h-4 rounded-xs border border-sky-500 bg-sky-100/70 flex flex-col justify-between items-center p-0.5">
            <div className="w-full h-1 bg-sky-500 rounded-2xs" />
            <div className="w-1 h-1 rounded-full bg-sky-500" />
          </div>
          <span className="font-medium truncate max-w-[130px]">
            {currentDispenser.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      </header>

      {/* Main Water Quality Hero Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4 transition-all">
        {/* Top Water Drop Graphic with status */}
        <div className="flex flex-col items-center justify-center pt-1 pb-3">
          <WaterDropletHero size={130} />

          {/* Status Badge */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs ${currentDispenser.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${currentDispenser.status === 'ready' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {currentDispenser.status === 'ready' ? 'เครื่องออนไลน์' : 'รอข้อมูลจากเครื่อง'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1 font-normal text-center">
            ข้อมูลคุณภาพน้ำจะแสดงเมื่อเครื่องส่งค่าล่าสุด
          </p>
        </div>

        {/* Real-time Water Quality Section */}
        <div className="mt-2 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-semibold text-slate-800">
                คุณภาพน้ำแบบเรียลไทม์
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-600 transition-colors"
              title="กดเพื่ออัปเดตข้อมูลสด"
            >
              <RefreshCw
                className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`}
              />
              <span>ข้อมูลล่าสุด {lastUpdateTime}</span>
            </button>
          </div>

          {/* 4 Sensor Metrics Bar Columns */}
          <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            {/* 1. TDS */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-0.5 text-slate-400 text-[10px] font-medium mb-1.5">
                <Droplet className="w-3 h-3 fill-sky-400 text-sky-400" />
                <span>TDS</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                {currentDispenser.tds != null && <div className="h-full bg-emerald-500 rounded-full w-full" />}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {currentDispenser.tds == null ? '—' : `${String(currentDispenser.tds).padStart(3, '0')} ppm`}
              </span>
            </div>

            {/* 2. pH */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-0.5 text-slate-400 text-[10px] font-medium mb-1.5">
                <Droplet className="w-3 h-3 fill-sky-400 text-sky-400" />
                <span>pH</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                {currentDispenser.ph != null && <div className="h-full bg-emerald-500 rounded-full w-4/5" />}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {currentDispenser.ph == null ? '—' : currentDispenser.ph.toFixed(1)}
              </span>
            </div>

            {/* 3. TURBIDITY */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-0.5 text-slate-400 text-[10px] font-medium mb-1.5">
                <Droplet className="w-3 h-3 fill-sky-400 text-sky-400" />
                <span className="truncate">TURBIDITY</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                {currentDispenser.turbidity != null && <div className="h-full bg-emerald-500 rounded-full w-full" />}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {currentDispenser.turbidity == null ? '—' : `${currentDispenser.turbidity.toFixed(2)} NTU`}
              </span>
            </div>

            {/* 4. TEMP */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-0.5 text-slate-400 text-[10px] font-medium mb-1.5">
                <Droplet className="w-3 h-3 fill-sky-400 text-sky-400" />
                <span>TEMP</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                {currentDispenser.temp != null && <div className="h-full bg-emerald-300 rounded-full w-2/3" />}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {currentDispenser.temp == null ? '—' : `${currentDispenser.temp.toFixed(1)} °C`}
              </span>
            </div>
          </div>

          {/* Two Metric Cards Side by Side */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Pressure Card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100/80 flex items-center justify-center text-sky-600 shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 font-medium">แรงดัน</div>
                <div className="text-sm font-bold text-slate-800 leading-tight">
                  {currentDispenser.pressure == null ? '—' : `${currentDispenser.pressure.toFixed(1)} บาร์`}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${currentDispenser.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] text-slate-500 font-medium">{currentDispenser.pressure == null ? 'ยัง ไม่มี ข้อมูล' : currentDispenser.status === 'ready' ? 'ข้อมูลล่าสุด' : 'ข้อมูลเก่า'}</span>
                </div>
              </div>
            </div>

            {/* Purity Card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100/80 flex items-center justify-center text-sky-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 font-medium">ความสะอาด</div>
                <div className="text-sm font-bold text-slate-800 leading-tight">
                  {currentDispenser.purity == null ? '—' : `${currentDispenser.purity}%`}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${currentDispenser.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] text-slate-500 font-medium">{currentDispenser.purity == null ? 'ยัง ไม่มี ข้อมูล' : currentDispenser.status === 'ready' ? 'ข้อมูลล่าสุด' : 'ข้อมูลเก่า'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Status Card (สถานะไส้กรอง) */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-5">
        <h2 className="text-xs font-semibold text-slate-800 mb-3">สถานะไส้กรอง</h2>

        <div className="flex items-center gap-4">
          {/* Circular Progress Gauge */}
          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-slate-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-slate-900 leading-none">
                {currentDispenser.filterRemainingPercent}%
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 font-medium">เหลือ</span>
            </div>
          </div>

          {/* Filter Details & Progress Bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="text-xs font-bold text-slate-800">
                ไส้กรองเหลือ {currentDispenser.filterRemainingPercent}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 font-normal">
              เปลี่ยนไส้กรองเมื่อเหลือต่ำกว่า 20%
            </p>

            {/* Horizontal Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${currentDispenser.filterRemainingPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Liter Footnotes */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-50">
          <span>กรองแล้ว: {currentDispenser.filteredLiters == null ? '—' : `${currentDispenser.filteredLiters.toLocaleString()} ลิตร`}</span>
          <span>อายุการใช้งาน: {currentDispenser.maxFilterLiters == null ? '—' : `${currentDispenser.maxFilterLiters.toLocaleString()} ลิตร`}</span>
        </div>
      </div>

      {/* Main CTA Button: เติมน้ำ */}
      <button
        id="btn-main-dispense"
        type="button"
        onClick={onNavigateToDispense}
        className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-semibold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Droplet className="w-5 h-5 fill-white text-white" />
        <span>เติมน้ำ</span>
      </button>

      {/* Dispenser Selector Modal */}
      {showDispenserModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowDispenserModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-xl border border-slate-100 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-slate-800 text-sm">
                  เลือกตู้จ่ายน้ำดื่ม
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDispenserModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                ปิด
              </button>
            </div>

            <div className="space-y-2">
              {allDispensers.map((dispenser) => {
                const isSelected = dispenser.id === currentDispenser.id;
                return (
                  <button
                    key={dispenser.id}
                    type="button"
                    onClick={() => {
                      onSelectDispenser(dispenser);
                      setShowDispenserModal(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-800">
                        {dispenser.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {dispenser.location}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                        <span>TDS: {dispenser.tds == null ? '—' : `${dispenser.tds} ppm`}</span>
                        <span>•</span>
                        <span>ไส้กรอง: {dispenser.filterRemainingPercent}%</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
