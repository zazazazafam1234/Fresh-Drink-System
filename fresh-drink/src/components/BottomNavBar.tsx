import React from 'react';
import {
  Home,
  Clock,
  Bell,
  User,
} from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  unreadCount = 3,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 pt-2 pb-5 z-40">
      <div className="flex items-center justify-between">
        {/* Tab 1: หน้าแรก */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home'
              ? 'text-sky-600 scale-105 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Home
            className={`w-6 h-6 ${
              activeTab === 'home' ? 'fill-sky-600 text-sky-600' : 'stroke-[1.75]'
            }`}
          />
          <span className="text-[11px] leading-none">หน้าแรก</span>
        </button>

        {/* Tab 2: ประวัติ */}
        <button
          type="button"
          onClick={() => onChangeTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'history'
              ? 'text-sky-600 scale-105 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Clock
            className={`w-6 h-6 ${
              activeTab === 'history' ? 'stroke-[2.5] text-sky-600' : 'stroke-[1.75]'
            }`}
          />
          <span className="text-[11px] leading-none">ประวัติ</span>
        </button>

        {/* Tab 3: การแจ้งเตือน */}
        <button
          type="button"
          onClick={() => onChangeTab('notifications')}
          className={`flex flex-col items-center gap-1 relative transition-all ${
            activeTab === 'notifications'
              ? 'text-sky-600 scale-105 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <Bell
              className={`w-6 h-6 ${
                activeTab === 'notifications'
                  ? 'fill-sky-600 text-sky-600'
                  : 'stroke-[1.75]'
              }`}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] leading-none">แจ้งเตือน</span>
        </button>

        {/* Tab 4: โปรไฟล์ */}
        <button
          type="button"
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'profile'
              ? 'text-sky-600 scale-105 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <User
            className={`w-6 h-6 ${
              activeTab === 'profile' ? 'stroke-[2.5] text-sky-600' : 'stroke-[1.75]'
            }`}
          />
          <span className="text-[11px] leading-none">โปรไฟล์</span>
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-32 h-1 bg-slate-900/80 rounded-full mx-auto mt-3" />
    </nav>
  );
};
