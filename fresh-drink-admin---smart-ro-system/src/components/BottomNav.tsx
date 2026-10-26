import React from 'react';
import { LayoutGrid, Filter, Bell, BarChart2, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadAlertCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadAlertCount,
}) => {
  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutGrid },
    { id: 'filter', label: 'ไส้กรอง', icon: Filter },
    { id: 'alerts', label: 'การแจ้งเตือน', icon: Bell },
    { id: 'reports', label: 'รายงาน', icon: BarChart2 },
    { id: 'profile', label: 'โปรไฟล์', icon: User },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-30 select-none"
    >
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            id={`nav-tab-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 text-blue-600' : 'text-slate-400'
                }`}
              />

              {item.id === 'alerts' && unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-2xs">
                  {unreadAlertCount}
                </span>
              )}
            </div>

            <span
              className={`text-[10px] mt-1 transition-colors leading-tight ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
