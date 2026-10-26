import React from 'react';
import {
  Bell,
  Droplets,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Table as TableIcon,
  TrendingUp,
  Info,
} from 'lucide-react';
import { FilterEfficiencyData, FrequentIssue, WaterUsageData } from '../types';
import { WaterDropLogo } from './WaterDropLogo';

interface ReportsScreenProps {
  usageData: WaterUsageData[];
  efficiencyData: FilterEfficiencyData[];
  frequentIssues: FrequentIssue[];
  onExport: (type: 'pdf' | 'excel') => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  usageData,
  efficiencyData,
  frequentIssues,
  onExport,
}) => {
  // SVG Bar Chart Dimensions
  const barChartWidth = 320;
  const barChartHeight = 150;
  const barPaddingLeft = 28;
  const barPaddingRight = 14;
  const barPaddingTop = 22;
  const barPaddingBottom = 26;
  const barPlotWidth = barChartWidth - barPaddingLeft - barPaddingRight;
  const barPlotHeight = barChartHeight - barPaddingTop - barPaddingBottom;
  const maxLiters = 800;

  // SVG Line Chart Dimensions
  const lineChartWidth = 320;
  const lineChartHeight = 130;
  const linePaddingLeft = 28;
  const linePaddingRight = 14;
  const linePaddingTop = 18;
  const linePaddingBottom = 26;
  const linePlotWidth = lineChartWidth - linePaddingLeft - linePaddingRight;
  const linePlotHeight = lineChartHeight - linePaddingTop - linePaddingBottom;
  const minPercent = 90;
  const maxPercent = 100;

  const getLineY = (val: number) => {
    return (
      linePaddingTop +
      linePlotHeight -
      ((val - minPercent) / (maxPercent - minPercent)) * linePlotHeight
    );
  };

  const getLineX = (index: number) => {
    return linePaddingLeft + (index / (efficiencyData.length - 1)) * linePlotWidth;
  };

  const efficiencyPath = efficiencyData.reduce((acc, pt, idx) => {
    const x = getLineX(idx);
    const y = getLineY(pt.percentage);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="space-y-3.5 pb-2">
      {/* Header bar matching Image 1 */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-2.5">
          <WaterDropLogo size={32} />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Fresh Drink</h1>
            <p className="text-xs text-slate-500 leading-tight">Smart RO System</p>
          </div>
        </div>
        <button
          className="p-2 -mr-2 text-slate-700 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors"
          title="การแจ้งเตือน"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Screen Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">รายงานและสถิติ</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          สรุปข้อมูลการใช้งานและประสิทธิภาพระบบ RO
        </p>
      </div>

      {/* 3 Metric Cards matching Image 1 */}
      <div className="grid grid-cols-3 gap-2">
        {/* Card 1: น้ำที่ใช้ไปทั้งหมด */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="text-[10px] text-slate-600 leading-tight">
            น้ำที่ใช้ไปทั้งหมด <span className="text-slate-400 block">(เดือนนี้)</span>
          </div>
          <div className="mt-1">
            <div className="text-sm sm:text-base font-bold text-blue-600 leading-tight">
              12,540 <span className="text-[10px] font-normal text-slate-500">ลิตร</span>
            </div>
            {/* Sparkline wave */}
            <div className="h-4 w-full mt-1">
              <svg viewBox="0 0 80 16" className="w-full h-full stroke-blue-500 fill-none">
                <path
                  d="M0 12 Q 15 4, 30 10 T 60 8 T 80 12"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: ค่าเฉลี่ยการใช้น้ำ */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-[10px] text-slate-600 leading-tight">
            ค่าเฉลี่ยการใช้น้ำ <span className="text-slate-400 block">(รายวัน)</span>
          </div>
          <div className="mt-1">
            <div className="text-sm sm:text-base font-bold text-blue-600 leading-tight">
              418 <span className="text-[10px] font-normal text-slate-500">ลิตร/วัน</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-blue-700 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>↑ 8.7%</span>
            </div>
            <span className="text-[9px] text-slate-400 block leading-tight">จากเดือนที่แล้ว</span>
          </div>
        </div>

        {/* Card 3: ประสิทธิภาพไส้กรอง */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[10px] text-slate-600 leading-tight">
            ประสิทธิภาพไส้กรอง <span className="text-slate-400 block">(เฉลี่ย)</span>
          </div>
          <div className="mt-1">
            <div className="text-sm sm:text-base font-bold text-blue-600 leading-tight">
              96.8 <span className="text-[10px] font-normal text-slate-500">%</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-blue-700 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>↑ 2.3%</span>
            </div>
            <span className="text-[9px] text-slate-400 block leading-tight">จากเดือนที่แล้ว</span>
          </div>
        </div>
      </div>

      {/* Chart 1: การใช้น้ำรายวัน (7 วันที่ผ่านมา) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            การใช้น้ำรายวัน (7 วันที่ผ่านมา)
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>18 – 24 พฤษภาคม 2567</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 -mb-1">(ลิตร)</div>

        {/* Bar chart SVG */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}
            className="w-full h-auto select-none"
          >
            {/* Grid lines */}
            {[0, 200, 400, 600, 800].map((val) => {
              const y =
                barPaddingTop +
                barPlotHeight -
                (val / maxLiters) * barPlotHeight;
              return (
                <g key={val}>
                  <line
                    x1={barPaddingLeft}
                    y1={y}
                    x2={barChartWidth - barPaddingRight}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeDasharray="2,2"
                    strokeWidth="1"
                  />
                  <text
                    x={barPaddingLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="8"
                    fill="#94A3B8"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {usageData.map((item, idx) => {
              const barCount = usageData.length;
              const barWidth = 16;
              const step = barPlotWidth / barCount;
              const x = barPaddingLeft + idx * step + (step - barWidth) / 2;
              const barHeight = (item.liters / maxLiters) * barPlotHeight;
              const y = barPaddingTop + barPlotHeight - barHeight;

              return (
                <g key={item.date}>
                  {/* Exact value displayed on top of each bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {item.liters}
                  </text>

                  {/* Rounded blue bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill="#3B82F6"
                    className="hover:fill-blue-600 transition-colors"
                  />

                  {/* Date label at bottom */}
                  <text
                    x={x + barWidth / 2}
                    y={barChartHeight - 8}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#64748B"
                  >
                    {item.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Chart 2: ประสิทธิภาพไส้กรอง (%) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            ประสิทธิภาพไส้กรอง (%)
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            <span>ประสิทธิภาพไส้กรอง (%)</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 -mb-1">(%)</div>

        {/* Line Chart SVG */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`}
            className="w-full h-auto select-none"
          >
            {/* Grid lines: 90, 92, 94, 96, 98, 100 */}
            {[90, 92, 94, 96, 98, 100].map((val) => {
              const y = getLineY(val);
              return (
                <g key={val}>
                  <line
                    x1={linePaddingLeft}
                    y1={y}
                    x2={lineChartWidth - linePaddingRight}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeDasharray="2,2"
                    strokeWidth="1"
                  />
                  <text
                    x={linePaddingLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="8"
                    fill="#94A3B8"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Line path */}
            <path
              d={efficiencyPath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points and value tags */}
            {efficiencyData.map((pt, idx) => {
              const x = getLineX(idx);
              const y = getLineY(pt.percentage);
              return (
                <g key={pt.date}>
                  {/* Number above dot */}
                  <text
                    x={x}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="7.5"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {pt.percentage}
                  </text>
                  <circle cx={x} cy={y} r="3" fill="#2563EB" />
                  {/* Date label */}
                  <text
                    x={x}
                    y={lineChartHeight - 8}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#64748B"
                  >
                    {pt.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Table: ปัญหาที่พบบ่อย */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-1.5 mb-3">
          <AlertTriangle className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">ปัญหาที่พบบ่อย</h3>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-500 pb-2 border-b border-slate-100">
          <div className="col-span-5">ปัญหา</div>
          <div className="col-span-3 text-center">จำนวนครั้ง</div>
          <div className="col-span-4 text-right">เปอร์เซ็นต์</div>
        </div>

        {/* Table rows matching Image 1 */}
        <div className="divide-y divide-slate-100/80">
          {frequentIssues.map((item) => (
            <div key={item.id} className="grid grid-cols-12 items-center py-2.5 text-xs">
              <div className="col-span-5 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-800 text-[11px] leading-tight">
                  {item.issue}
                </span>
              </div>

              {/* Middle colored bar indicator */}
              <div className="col-span-4 px-2">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${item.barColor}`}
                    style={{ width: `${item.percentage * 2}%` }}
                  ></div>
                </div>
              </div>

              {/* Count & Percentage */}
              <div className="col-span-1 text-center font-bold text-slate-800 text-xs">
                {item.count}
              </div>
              <div className="col-span-2 text-right font-bold text-slate-800 text-xs">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>ข้อมูลสรุปจากเดือนนี้ (1 – 24 พฤษภาคม 2567)</span>
        </div>
      </div>

      {/* Export Action Buttons matching Image 1 */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          id="export-pdf-btn"
          onClick={() => onExport('pdf')}
          className="bg-white hover:bg-rose-50/40 active:scale-[0.99] border border-rose-200 rounded-2xl p-3 flex items-center gap-3 shadow-2xs transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight">Export PDF</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              รายงานแบบละเอียด
            </div>
          </div>
        </button>

        <button
          id="export-excel-btn"
          onClick={() => onExport('excel')}
          className="bg-white hover:bg-emerald-50/40 active:scale-[0.99] border border-emerald-200 rounded-2xl p-3 flex items-center gap-3 shadow-2xs transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TableIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight">Export Excel</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              ข้อมูลแบบตาราง
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
