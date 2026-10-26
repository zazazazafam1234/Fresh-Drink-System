import React, { useState } from 'react';
import {
  User,
  Shield,
  Wifi,
  PhoneCall,
  BellRing,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { DispenserOption } from '../types';

interface ProfileScreenProps {
  currentDispenser: DispenserOption;
  user: { name: string; email: string; picture?: string };
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentDispenser, user, onSignOut }) => {
  const [notifSound, setNotifSound] = useState(true);
  const [autoFlushDaily, setAutoFlushDaily] = useState(true);

  return (
    <div className="flex flex-col pb-24 px-4 pt-2">
      {/* Header */}
      <header className="py-2 mb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          โปรไฟล์และระบบ
        </h1>
        <p className="text-xs text-slate-400">ข้อมูลผู้ใช้งานและเครื่องจ่ายน้ำที่เชื่อมต่อ</p>
      </header>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4 flex items-center gap-3.5">
        <div className="w-13 h-13 rounded-2xl bg-sky-500/10 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-lg shrink-0">
          <User className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {user.name}</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
              Verified User
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          <p className="text-[11px] text-sky-600 font-medium mt-1">
            บัญชี Google ที่ยืนยันแล้ว
          </p>
        </div>
      </div>

      <button type="button" onClick={onSignOut} className="mb-4 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700">Sign out</button>
      {/* Connected Machine Spec Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800">เครื่องที่เชื่อมต่ออยู่</span>
          </div>
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${currentDispenser.status === 'ready' ? 'text-emerald-600' : 'text-amber-600'}`}>
            <span className={`w-2 h-2 rounded-full ${currentDispenser.status === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {currentDispenser.status === 'ready' ? 'ออนไลน์ (Online)' : 'ไม่มีข้อมูลล่าสุด'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-slate-400">ชื่ออุปกรณ์:</span>
            <span className="font-semibold text-slate-800">{currentDispenser.name}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">ตำแหน่งติดตั้ง:</span>
            <span className="font-medium text-slate-700 text-right max-w-[200px] truncate">
              {currentDispenser.location}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">ระบบกรอง:</span>
            <span className="font-semibold text-sky-600">Smart RO 5-Stage Purification</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">หมายเลขซีเรียล:</span>
            <span className="font-mono text-[11px] text-slate-600">{currentDispenser.id}</span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">การตั้งค่าการแจ้งเตือน</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-700 font-medium">เตือนเปลี่ยนไส้กรองล่วงหน้า</span>
            </div>
            <input
              type="checkbox"
              checked={notifSound}
              onChange={() => setNotifSound(!notifSound)}
              className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-700 font-medium">ระบบ Auto Flush อัตโนมัติทุกวัน 04:00 น.</span>
            </div>
            <input
              type="checkbox"
              checked={autoFlushDaily}
              onChange={() => setAutoFlushDaily(!autoFlushDaily)}
              className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Support & Contact */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4 space-y-2">
        <a
          href="tel:021234567"
          className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700"
        >
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-4 h-4 text-sky-600" />
            <span>ติดต่อช่างบริการ / สั่งซื้อไส้กรอง</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        <div className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>คู่มือการใช้งานและค่ามาตรฐาน TDS/pH</span>
          </div>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
      </div>
    </div>
  );
};
