import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle, Droplet, LogOut, RefreshCw, Smartphone, AlertTriangle } from 'lucide-react';
import { DispenserOption, NotificationItem, TabType, WaterLog } from './types';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { DispensingScreen } from './components/DispensingScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreen, SignedInUser } from './AuthScreen';

type ApiMachine = { id: string; name: string; location: string; filterPercent: number; pressure: number | null; purity: number | null; telemetryStatus: string; recordedAt?: string | null };
type ApiNotification = { id: string; type: 'success' | 'warning' | 'error'; title: string; description: string; time: string; read: boolean };
type UserData = { machine: ApiMachine; logs: Array<{ id: string; date: string; time: string; createdAt: string; amount: number; unitDisplay: string; dispenserName: string; status: 'requested' | 'completed' | 'failed' }>; notifications: ApiNotification[] };

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

function mapMachine(machine: ApiMachine): DispenserOption {
  return {
    id: machine.id, name: machine.name, location: machine.location,
    status: machine.telemetryStatus === 'recent' ? 'ready' : 'maintenance',
    tds: null, ph: null, turbidity: null, temp: null, pressure: machine.pressure, purity: machine.purity,
    telemetryRecordedAt: machine.recordedAt ?? null,
    filterRemainingPercent: Number(machine.filterPercent), filteredLiters: null, maxFilterLiters: null,
  };
}

export default function App() {
  const [authUser, setAuthUser] = useState<SignedInUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isDispensingView, setIsDispensingView] = useState(false);
  const [machines, setMachines] = useState<DispenserOption[]>([]);
  const [machineId, setMachineId] = useState(localStorage.getItem('fresh-drink-machine') || '');
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => { api<{ user: SignedInUser | null }>('/api/auth/me?role=user').then(({ user }) => setAuthUser(user?.role === 'user' ? user : null)).catch(() => setAuthUser(null)).finally(() => setAuthReady(true)); }, []);

  const loadMachines = useCallback(async () => {
    const rows = await api<ApiMachine[]>('/api/user/machines');
    const mapped = rows.map(mapMachine);
    setMachines(mapped);
    if (!mapped.some((machine) => machine.id === machineId)) {
      const preferred = mapped[0]?.id || '';
      setMachineId(preferred);
      if (preferred) localStorage.setItem('fresh-drink-machine', preferred);
    }
    return mapped;
  }, [machineId]);

  const loadData = useCallback(async (id = machineId) => {
    if (!id) { setData(null); return; }
    const result = await api<UserData>(`/api/user/machines/${encodeURIComponent(id)}/data`);
    setData(result);
    setMachines((items) => items.map((machine) => machine.id === id ? mapMachine(result.machine) : machine));
  }, [machineId]);

  useEffect(() => {
    if (!authUser) return;
    let active = true;
    loadMachines().catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Cannot connect to server'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authUser, loadMachines]);

  useEffect(() => {
    if (!authUser || !machineId) return;
    setLoading(true);
    loadData(machineId).then(() => setError('')).catch((reason) => setError(reason instanceof Error ? reason.message : 'Cannot load machine data')).finally(() => setLoading(false));
  }, [authUser, machineId, loadData]);

  useEffect(() => {
    if (!authUser || !machineId) return;
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') loadData(machineId).catch(() => undefined); }, 10000);
    return () => window.clearInterval(timer);
  }, [authUser, machineId, loadData]);

  const showToast = (message: string) => { setToastMessage(message); window.setTimeout(() => setToastMessage(''), 3500); };
  const currentDispenser = data ? mapMachine(data.machine) : machines.find((machine) => machine.id === machineId) || null;
  const logs: WaterLog[] = data?.logs.map((log) => ({ ...log, unitDisplay: log.status === 'requested' ? `${log.unitDisplay} · รอเครื่อง` : log.status === 'failed' ? `${log.unitDisplay} · ไม่สำเร็จ` : log.unitDisplay })) ?? [];
  const notifications: NotificationItem[] = data?.notifications ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleCompleteDispense = async (request: Omit<WaterLog, 'id'>) => {
    if (!currentDispenser) return;
    await api('/api/user/dispense', { method: 'POST', body: JSON.stringify({ machineId: currentDispenser.id, amountMl: request.amount }) });
    await loadData();
    setIsDispensingView(false);
    showToast('บันทึกคำขอแล้ว กำลังรอเครื่องยืนยันการจ่ายน้ำ');
  };

  const handleAutoFlush = async () => {
    if (!currentDispenser) return;
    await api('/api/user/flush', { method: 'POST', body: JSON.stringify({ machineId: currentDispenser.id }) });
    await loadData();
    showToast('ส่งคำขอ Auto Flush แล้ว กำลังรอเครื่องยืนยัน');
  };

  const handleMarkRead = async () => {
    const ids = notifications.filter((item) => !item.read).map((item) => item.id);
    try {
      await api('/api/user/notifications/read-all', { method: 'POST', body: JSON.stringify({ ids }) });
      await loadData();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not mark notifications read'); }
  };

  if (!authReady) return <div className="min-h-screen grid place-items-center text-slate-500">กำลังตรวจสอบบัญชี…</div>;
  if (!authUser) return <AuthScreen role="user" onSignedIn={setAuthUser} />;

  return <div className="min-h-screen bg-slate-100 flex flex-col items-center p-0 sm:p-5 font-['Prompt',sans-serif]">
    <main className="relative min-h-screen sm:min-h-[820px] w-full max-w-[440px] overflow-hidden bg-[#f8fafc] sm:rounded-[32px] sm:border sm:border-slate-200 sm:shadow-xl flex flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-sky-50 text-sky-500"><Droplet className="h-5 w-5 fill-sky-500" /></span><div><div className="text-sm font-bold text-slate-900">Fresh Drink</div><div className="text-[10px] text-slate-500">{authUser.email}</div></div></div>
        <div className="flex items-center gap-2"><button type="button" title="Refresh" onClick={() => loadData().catch((reason) => setError(reason.message))} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"><RefreshCw className="h-4 w-4" /></button><button type="button" title="Sign out" onClick={async () => { await api('/api/auth/logout', { method: 'POST', body: JSON.stringify({ role: 'user' }) }); setAuthUser(null); }} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"><LogOut className="h-4 w-4" /></button></div>
      </header>
      {toastMessage && <div role="status" className="absolute left-4 right-4 top-16 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 px-4 py-3 text-xs text-white shadow-lg"><CheckCircle className="h-4 w-4 text-emerald-400" />{toastMessage}</div>}
      {error && <div role="alert" className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>}
      {loading && <div className="px-4 py-3 text-xs text-slate-400">กำลังโหลดข้อมูล…</div>}
      {!loading && !machines.length && !error && <div className="m-4 rounded-2xl border border-slate-200 bg-white p-6 text-center"><Smartphone className="mx-auto mb-2 h-7 w-7 text-sky-500" /><h2 className="font-bold text-slate-800">ยังไม่มีเครื่องจ่ายน้ำ</h2><p className="mt-1 text-xs text-slate-500">ให้ผู้ดูแลเพิ่มเครื่องจากหน้า Admin ก่อน</p></div>}
      <div className="flex-1 overflow-y-auto pb-24">
        {currentDispenser && !isDispensingView && activeTab === 'home' && <HomeScreen currentDispenser={currentDispenser} allDispensers={machines} onSelectDispenser={(machine) => { setMachineId(machine.id); setData(null); localStorage.setItem('fresh-drink-machine', machine.id); }} onNavigateToDispense={() => setIsDispensingView(true)} onRefreshMetrics={() => loadData().catch((reason) => setError(reason.message))} />}
        {currentDispenser && isDispensingView && <DispensingScreen onBack={() => setIsDispensingView(false)} onCompleteDispense={handleCompleteDispense} dispenserName={currentDispenser.name} />}
        {!isDispensingView && activeTab === 'history' && <HistoryScreen onBack={() => setActiveTab('home')} logs={logs} />}
        {!isDispensingView && activeTab === 'notifications' && <NotificationsScreen onBack={() => setActiveTab('home')} notifications={notifications} onTriggerAutoFlush={handleAutoFlush} onMarkAllAsRead={() => { void handleMarkRead(); }} />}
        {!isDispensingView && activeTab === 'profile' && currentDispenser && <ProfileScreen currentDispenser={currentDispenser} user={authUser} onSignOut={async () => { await api('/api/auth/logout', { method: 'POST', body: JSON.stringify({ role: 'user' }) }); setAuthUser(null); }} />}
      </div>
      {!isDispensingView && <BottomNavBar activeTab={activeTab} onChangeTab={setActiveTab} unreadCount={unreadCount} />}
    </main>
  </div>;
}
