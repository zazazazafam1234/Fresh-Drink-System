import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Filter, RefreshCw, Bell, AlertTriangle, ChevronRight, CheckCircle2, Play, Square, Radio } from 'lucide-react';
import { AlertItem, DispenseRequest, RealtimeDataPoint, TabType } from '../types';
import { WaterDropLogo } from './WaterDropLogo';

interface DashboardScreenProps {
  machineId: string;
  onRefreshDashboard: () => Promise<unknown>;
  onNavigateTab: (tab: TabType) => void;
  onTriggerFlush: () => void;
  filterPercent: number;
  flushCountToday: number;
  lastFlushTime: string;
  alerts: AlertItem[];
  realtimeData: RealtimeDataPoint[];
  dispenseRequests: DispenseRequest[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  machineId,
  onRefreshDashboard,
  onNavigateTab,
  onTriggerFlush,
  filterPercent,
  flushCountToday,
  lastFlushTime,
  alerts,
  realtimeData,
  dispenseRequests,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '12h' | '7d'>('24h');
  const [hoveredPoint, setHoveredPoint] = useState<RealtimeDataPoint | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoError, setDemoError] = useState('');

  const sendDemoReading = useCallback(async () => {
    const response = await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machineId,
        pressure: Number((2.7 + Math.random() * 0.35).toFixed(2)),
        purity: Number((96.5 + Math.random() * 2.8).toFixed(1)),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `ส่งข้อมูลไม่สำเร็จ (${response.status})`);
    await onRefreshDashboard();
  }, [machineId, onRefreshDashboard]);

  useEffect(() => {
    if (!demoRunning) return;
    const interval = window.setInterval(() => {
      sendDemoReading().catch((reason) => {
        setDemoError(reason instanceof Error ? reason.message : 'ส่งข้อมูลจำลองไม่สำเร็จ');
        setDemoRunning(false);
      });
    }, 5000);
    return () => window.clearInterval(interval);
  }, [demoRunning, sendDemoReading]);

  const startDemo = async () => {
    setDemoError('');
    try {
      await sendDemoReading();
      setDemoRunning(true);
    } catch (reason) {
      setDemoError(reason instanceof Error ? reason.message : 'ส่งข้อมูลจำลองไม่สำเร็จ');
    }
  };

  const unreadAlerts = alerts.filter((a) => a.isUnread);
  const recentAlerts = alerts.slice(0, 2);
  const latestReading = realtimeData[realtimeData.length - 1];

  // SVG Chart Dimensions
  const svgWidth = 320;
  const svgHeight = 130;
  const paddingLeft = 32;
  const paddingRight = 32;
  const paddingTop = 12;
  const paddingBottom = 22;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Scaling helpers
  // Pressure: 0 to 4.0 bar
  const getPressureY = (val: number) => {
    return paddingTop + chartHeight - (val / 4.0) * chartHeight;
  };

  // Purity: 0 to 100 %
  const getPurityY = (val: number) => {
    return paddingTop + chartHeight - (val / 100) * chartHeight;
  };

  const getX = (index: number, total: number) => {
    return paddingLeft + (total <= 1 ? 0.5 : index / (total - 1)) * chartWidth;
  };

  // Generate SVG paths
  const pressurePath = realtimeData.reduce((acc, pt, idx) => {
    const x = getX(idx, realtimeData.length);
    const y = getPressureY(pt.pressure);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const purityPath = realtimeData.reduce((acc, pt, idx) => {
    const x = getX(idx, realtimeData.length);
    const y = getPurityY(pt.purity);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="space-y-3.5 pb-2">
      {/* Header bar matching Image 4 */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-2.5">
          <WaterDropLogo size={36} />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Fresh Drink Admin</h1>
            <p className="text-xs text-slate-500 leading-tight">Smart RO Water System</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200/60 shadow-2xs"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>Database connected</span></div>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><Radio className="h-5 w-5"/></span>
          <div><h2 className="text-sm font-bold text-amber-950">สาธิตรับส่งข้อมูลเซนเซอร์</h2><p className="mt-1 text-xs leading-relaxed text-amber-900">สร้างค่าจำลองจากซอฟต์แวร์และบันทึกลง MySQL ตาราง telemetry จริง ไม่มีการเชื่อมต่อหรือสั่งงานตู้น้ำจริง</p>{demoError && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{demoError}</p>}</div>
        </div>
        <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
          {!demoRunning ? <button type="button" onClick={startDemo} className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800"><Play className="h-4 w-4"/>เริ่มส่งข้อมูล</button> : <button type="button" onClick={() => setDemoRunning(false)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900"><Square className="h-4 w-4"/>หยุดจำลอง</button>}
        </div>
      </section>

      {dispenseRequests.length > 0 && <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-slate-900">คำขอจ่ายน้ำจาก User</h2><span className="text-[11px] text-slate-500">ข้อมูลร่วมจากฐานข้อมูล</span></div>
        <div className="space-y-2">{dispenseRequests.slice(0, 5).map((request) => <div key={request.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-xs font-semibold text-slate-800">{request.amountMl} ml · {request.machineId}</p><p className="text-[11px] text-slate-500">{request.createdAt}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${request.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : request.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>{request.status === 'requested' ? 'รอเครื่องตอบกลับ' : request.status}</span></div>)}</div>
        <p className="mt-2 text-[10px] text-slate-400">คำขอจะนับเป็นปริมาณน้ำที่จ่ายเมื่อ controller ยืนยันสถานะ completed เท่านั้น</p>
      </section>}

      {/* 2x2 Grid metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: คุณภาพน้ำ */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">คุณภาพน้ำ</span>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 mb-1">{latestReading ? `${latestReading.purity}% purity` : "No sensor data"}</div>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${latestReading ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}><span className={`w-1.5 h-1.5 rounded-full ${latestReading ? "bg-emerald-500" : "bg-slate-400"}`}></span>{latestReading ? `Last reading ${latestReading.time}` : "Waiting for sensor readings"}</div>
          </div>
        </div>

        {/* Card 2: ไส้กรองที่เหลือ */}
        <div
          onClick={() => onNavigateTab('filter')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-500 font-medium">ไส้กรองที่เหลือ</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 mb-2">{filterPercent}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${filterPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Auto Flush วันนี้ */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Auto Flush วันนี้</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 mb-0.5">{flushCountToday} ครั้ง</div>
            <div className="text-[11px] text-slate-500">ครั้งล่าสุด: {lastFlushTime}</div>
          </div>
        </div>

        {/* Card 4: การแจ้งเตือนที่ยังไม่ได้อ่าน */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-500 font-medium">การแจ้งเตือนที่ยังไม่ได้อ่าน</span>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-600 mb-0.5">{unreadAlerts.length} รายการ</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-0.5 hover:text-blue-600">
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Graph Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              กราฟข้อมูลเรียลไทม์ (24 ชั่วโมง)
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              อัปเดตอัตโนมัติทุก 5 นาที
            </div>
          </div>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 pr-6 appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="24h">24 ชั่วโมง</option>
              <option value="12h">12 ชั่วโมง</option>
              <option value="7d">7 วัน</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-400">
              ▼
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] mb-3 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-blue-600 rounded-full inline-block"></span>
            <span>แรงดันน้ำ (bar)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0 border-t border-dashed border-sky-400 inline-block"></span>
            <span>ความสะอาด (%)</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-hidden">
          {hoveredPoint && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] px-2.5 py-1 rounded-md shadow-md z-10 flex items-center gap-2">
              <span className="font-bold">{hoveredPoint.time}</span>
              <span className="text-blue-300">แรงดัน: {hoveredPoint.pressure} bar</span>
              <span className="text-sky-300">ความสะอาด: {hoveredPoint.purity}%</span>
            </div>
          )}

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Horizontal Grid lines */}
            {[0, 1, 2, 3, 4].map((barVal) => {
              const y = getPressureY(barVal);
              return (
                <g key={barVal}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                  />
                  {/* Left axis label */}
                  <text
                    x={paddingLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="8"
                    fill="#94A3B8"
                  >
                    {barVal === 0 ? '0' : `${barVal}.0`}
                  </text>
                  {/* Right axis label */}
                  <text
                    x={svgWidth - paddingRight + 6}
                    y={y + 3}
                    textAnchor="start"
                    fontSize="8"
                    fill="#94A3B8"
                  >
                    {`${barVal * 25}%`}
                  </text>
                </g>
              );
            })}

            {/* Paths */}
            {/* Dashed purity curve */}
            <path
              d={purityPath}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.8"
              strokeDasharray="4,3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Solid pressure curve */}
            <path
              d={pressurePath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive hover points */}
            {realtimeData.map((pt, idx) => {
              const x = getX(idx, realtimeData.length);
              const yPres = getPressureY(pt.pressure);
              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={x}
                    cy={yPres}
                    r="2.5"
                    fill="#2563EB"
                    className="transition-transform group-hover:scale-150"
                  />
                  {/* Invisible hit target */}
                  <rect
                    x={x - 10}
                    y={0}
                    width={20}
                    height={svgHeight}
                    fill="transparent"
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map(
              (label, i) => {
                const step = (svgWidth - paddingLeft - paddingRight) / 6;
                const x = paddingLeft + i * step;
                return (
                  <text
                    key={label}
                    x={x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#94A3B8"
                  >
                    {label}
                  </text>
                );
              }
            )}
          </svg>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">การแจ้งเตือนล่าสุด</h2>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5"
          >
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentAlerts.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab('alerts')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'critical'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {item.type === 'critical' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {item.title === 'แรงดันน้ำต่ำ'
                      ? 'แรงดันน้ำต่ำกว่าค่าปกติที่ 01:15 น.'
                      : 'ไส้กรอง RO เหลืออายุการใช้งาน 72%'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 shrink-0">{item.timestamp}</span>
                {item.isUnread && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Banner: สั่ง Auto Flush ทันที */}
      <button
        id="dashboard-autoflush-banner-btn"
        onClick={onTriggerFlush}
        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl p-4 flex items-center justify-between shadow-md shadow-blue-500/25 transition-all text-left group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">สั่ง Auto Flush ทันที</h3>
            <p className="text-xs text-blue-100 leading-tight mt-0.5">
              ระบบจะล้างไส้กรองอัตโนมัติทันที
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
