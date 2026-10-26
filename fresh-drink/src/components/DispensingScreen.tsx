import React, { useState } from 'react';
import {
  ChevronLeft,
  Coffee,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Droplets,
} from 'lucide-react';
import { WaterDropletHero } from './WaterDropletHero';
import { WaterLog } from '../types';

interface DispensingScreenProps {
  onBack: () => void;
  onCompleteDispense: (log: Omit<WaterLog, 'id'>) => void;
  dispenserName?: string;
}

type VolumePreset = '200' | '500' | '1000' | 'custom';

export const DispensingScreen: React.FC<DispensingScreenProps> = ({
  onBack,
  onCompleteDispense,
  dispenserName = 'ตู้น้ำชั้น 3 อาคารวิทย์',
}) => {
  const [selectedVolume, setSelectedVolume] = useState<VolumePreset>('200');
  const [customMl, setCustomMl] = useState<number>(350);
  const [showCustomSlider, setShowCustomSlider] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const progress = 0;
  const isDispensing = false;

  // Calculate target ml
  const targetMl =
    selectedVolume === '200'
      ? 200
      : selectedVolume === '500'
      ? 500
      : selectedVolume === '1000'
      ? 1000
      : customMl;

  const handleFinish = async () => {
    setSubmitting(true);
    setError('');
    const now = new Date();
    const amount = targetMl;
    const unitDisplay = amount >= 1000 ? `${(amount / 1000).toFixed(1)} L` : `${amount} ml`;
    try {
      await onCompleteDispense({ date: now.toLocaleDateString(), time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount, unitDisplay, dispenserName });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not submit request');
      setSubmitting(false);
    }
  };

  // Circular gauge math (radius = 90, circumference = 2 * PI * 90 ≈ 565.48)
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col pb-24 px-4 pt-2 min-h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-2">
        <button
          id="btn-dispense-back"
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-sky-600 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          title="ย้อนกลับ"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-sky-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
            </div>
            <span className="text-xs font-bold text-sky-900 tracking-tight">
              Fresh Drink
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Smart RO Water System
          </p>
        </div>

        <span className="text-xs text-slate-400">{dispenserName}</span>
      </div>

      {/* Screen Title */}
      <h2 className="text-center text-lg font-bold text-slate-900 mb-3 tracking-tight">
        เลือกปริมาณน้ำ
      </h2>

      {/* Main Circular Progress Gauge Card */}
      <div className="flex flex-col items-center justify-center relative py-4 mb-3">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* SVG Gauge */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="7"
              fill="transparent"
            />

            {/* Active Progress Ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Center Content: Water Droplet + Percentage + Status */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="scale-85 mb-0.5">
              <WaterDropletHero size={90} animated={isDispensing} withRipples={true} />
            </div>

            <div className="text-2xl font-black text-slate-900 leading-tight">
              {progress}%
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              เลือกปริมาณ แล้วส่งคำขอไปยังเครื่อง
            </div>
          </div>
        </div>
      </div>

      {/* Card: เลือกปริมาณน้ำ */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-3">
        <h3 className="text-xs font-bold text-center text-slate-800 mb-3">
          เลือกปริมาณ<span className="text-sky-600">น้ำ</span>
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {/* Preset 1: 200 ml */}
          <button
            type="button"
            onClick={() => {
              setSelectedVolume('200');
              setShowCustomSlider(false);
            }}
            className={`relative py-3 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all ${
              selectedVolume === '200'
                ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {selectedVolume === '200' && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <Coffee className="w-6 h-6 text-slate-700 stroke-[1.75] mb-1.5" />
            <span className="text-xs font-bold text-sky-900">200 ml</span>
          </button>

          {/* Preset 2: 500 ml */}
          <button
            type="button"
            onClick={() => {
              setSelectedVolume('500');
              setShowCustomSlider(false);
            }}
            className={`relative py-3 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all ${
              selectedVolume === '500'
                ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {selectedVolume === '500' && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <Coffee className="w-6 h-6 text-slate-700 stroke-[1.75] mb-1.5" />
            <span className="text-xs font-bold text-slate-800">500 ml</span>
          </button>

          {/* Preset 3: 1 ลิตร */}
          <button
            type="button"
            onClick={() => {
              setSelectedVolume('1000');
              setShowCustomSlider(false);
            }}
            className={`relative py-3 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all ${
              selectedVolume === '1000'
                ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {selectedVolume === '1000' && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <Coffee className="w-6 h-6 text-slate-700 stroke-[1.75] mb-1.5" />
            <span className="text-xs font-bold text-slate-800">1 ลิตร</span>
          </button>

          {/* Preset 4: กำหนดเอง */}
          <button
            type="button"
            onClick={() => {
              setSelectedVolume('custom');
              setShowCustomSlider(true);
            }}
            className={`relative py-3 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all ${
              selectedVolume === 'custom'
                ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {selectedVolume === 'custom' && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            <Sliders className="w-6 h-6 text-slate-700 stroke-[1.75] mb-1.5" />
            <span className="text-xs font-bold text-slate-800">
              {selectedVolume === 'custom' ? `${customMl} ml` : 'กำหนดเอง'}
            </span>
          </button>
        </div>

        {/* Custom Slider Drawer if opened */}
        {showCustomSlider && (
          <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
              <span>ปรับปริมาณตามต้องการ</span>
              <span className="font-bold text-sky-600">{customMl} ml</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={customMl}
              onChange={(e) => setCustomMl(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>100 ml</span>
              <span>1,000 ml</span>
              <span>2,000 ml</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Status Card: กำลังจ่ายน้ำ */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-3">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-100/70 flex items-center justify-center text-sky-600 shrink-0">
            <Droplets className="w-5 h-5 fill-sky-500 text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {submitting ? 'กำลังส่งคำขอ…' : 'พร้อมส่งคำขอ'}
              </span>
              <span className="text-xs font-bold text-sky-600">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 font-normal">
          ระบบจะบันทึกคำขอและแจ้งผลเมื่อเครื่องตอบกลับ
        </p>
      </div>

      {/* Security Quality Badge */}
      <div className="flex items-center gap-2 px-2 py-1 mb-4 text-xs font-medium text-slate-700">
        <div className="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span>น้ำสะอาดจากระบบ Smart RO</span>
      </div>

      {error && <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      <button id="btn-dispense-request" type="button" disabled={submitting} onClick={() => { void handleFinish(); }} className="mt-auto w-full rounded-2xl bg-sky-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition-all hover:bg-sky-600 active:scale-[0.98] disabled:opacity-50">
        {submitting ? 'กำลังส่งคำขอ…' : `ส่งคำขอจ่ายน้ำ ${targetMl} ml`}
      </button>
    </div>
  );
};
