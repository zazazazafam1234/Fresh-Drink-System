import React from 'react';
import { Wifi } from 'lucide-react';

export const StatusBar: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-between px-6 pt-3 pb-2 select-none text-slate-900 z-50">
      {/* Time */}
      <span className="font-semibold text-sm tracking-tight">9:41</span>

      {/* Dynamic Island pill */}
      <div className="w-24 h-6 bg-slate-950 rounded-full flex items-center justify-end px-2.5 gap-1.5 shadow-xs">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-950/60 ring-1 ring-indigo-900/40" />
      </div>

      {/* Cellular, WiFi, Battery */}
      <div className="flex items-center gap-1.5 text-slate-900">
        {/* Cellular 4 bars */}
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-0.5 h-1 bg-slate-900 rounded-2xs" />
          <div className="w-0.5 h-1.5 bg-slate-900 rounded-2xs" />
          <div className="w-0.5 h-2.2 bg-slate-900 rounded-2xs" />
          <div className="w-0.5 h-3 bg-slate-900 rounded-2xs" />
        </div>

        {/* WiFi */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

        {/* Battery */}
        <div className="flex items-center">
          <div className="w-5 h-2.5 rounded-xs border border-slate-900 p-0.5 flex items-center">
            <div className="h-full w-full bg-slate-900 rounded-3xs" />
          </div>
          <div className="w-0.5 h-1 bg-slate-900 rounded-r-2xs -ml-px" />
        </div>
      </div>
    </div>
  );
};
