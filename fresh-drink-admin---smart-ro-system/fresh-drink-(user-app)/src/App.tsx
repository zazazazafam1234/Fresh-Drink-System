import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle, Droplet, Home, Clock, User, AlertTriangle } from 'lucide-react';
import { DispenserOption, NotificationItem, TabType, UserMachineData, WaterLog } from './types';
import { HomeScreen } from './components/HomeScreen';
import { DispensingScreen } from './components/DispensingScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreen, SignedInUser } from './AuthScreen';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<SignedInUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isDispensingView, setIsDispensingView] = useState(false);
  const [machines, setMachines] = useState<DispenserOption[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState(localStorage.getItem('fresh-drink-machine') || '');
  const [data, setData] = useState<UserMachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { fetch('/api/auth/me?role=user').then((response) => response.json()).then((body) => setAuthUser(body.user?.role === 'user' ? body.user : null)).catch(() => setAuthUser(null)).finally(() => setAuthReady(true)); }, []);

  const loadMachines = useCallback(async () => {
    const result = await api<DispenserOption[]>('/api/user/machines');
    setMachines(result);
    return result;
  }, []);

  const reloadData = useCallback(async (machineId = selectedMachineId) => {
    if (!machineId) { setData(null); return; }
    const result = await api<UserMachineData>(`/api/user/machines/${encodeURIComponent(machineId)}/data`);
    setData(result);
    return result;
  }, [selectedMachineId]);

  useEffect(() => {
    if (!authReady || !authUser) return;
    loadMachines().then((items) => {
      if (!items.length) { setSelectedMachineId(''); return; }
      const preferred = items.some((item) => item.id === selectedMachineId) ? selectedMachineId : items[0].id;
      setSelectedMachineId(preferred);
      localStorage.setItem('fresh-drink-machine', preferred);
      setError('');
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not connect to the admin API'))
      .finally(() => setLoading(false));
  }, [loadMachines, authReady, authUser]);

  useEffect(() => {
    if (!authUser) return;
    if (!selectedMachineId) { setData(null); return; }
    setLoading(true);
    reloadData(selectedMachineId).then(() => setError(''))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load machine data'))
      .finally(() => setLoading(false));
  }, [selectedMachineId, reloadData, authUser]);

  useEffect(() => {
    if (!authUser) return;
    if (!selectedMachineId) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        reloadData(selectedMachineId).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not refresh machine data'));
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [selectedMachineId, reloadData, authUser]);

  const currentDispenser = data?.machine ?? null;
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3500); };
  const refreshFromServer = async () => {
    try { await Promise.all([loadMachines(), reloadData()]); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not refresh saved data'); }
  };
  const selectDispenser = (machine: DispenserOption) => {
    setSelectedMachineId(machine.id);
    localStorage.setItem('fresh-drink-machine', machine.id);
  };
  const submitDispense = async (amountMl: number) => {
    if (!currentDispenser) throw new Error('Select a water dispenser first');
    await api('/api/user/dispense', { method: 'POST', body: JSON.stringify({ machineId: currentDispenser.id, amountMl }) });
    await reloadData();
    setIsDispensingView(false);
    showToast('บันทึกคำขอแล้ว · รอการเชื่อมต่อเครื่องจ่ายน้ำ');
  };
  const requestFlush = async () => {
    if (!currentDispenser) throw new Error('Select a water dispenser first');
    await api('/api/user/flush', { method: 'POST', body: JSON.stringify({ machineId: currentDispenser.id }) });
    await reloadData();
    showToast('บันทึกคำขอ Auto Flush แล้ว');
  };
  const markNotificationsRead = async () => {
    const ids = data?.notifications.filter((item) => !item.read).map((item) => item.id) ?? [];
    await api('/api/user/notifications/read-all', { method: 'POST', body: JSON.stringify({ ids }) });
    await reloadData();
  };
  const unreadCount = data?.notifications.filter((item) => !item.read).length ?? 0;

  if (!authReady) return <div className="min-h-screen grid place-items-center text-slate-500">กำลังตรวจสอบบัญชี…</div>;
  if (!authUser) return <AuthScreen role="user" onSignedIn={setAuthUser}/>;

  return <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600"><Droplet className="w-6 h-6 fill-sky-500"/></div><div><h1 className="text-base font-bold text-slate-900">Fresh Drink</h1><p className="text-xs text-slate-500">ระบบจ่ายน้ำดื่ม</p></div></div>
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1">{([['home','หน้าหลัก',Home],['history','ประวัติ',Clock],['notifications','แจ้งเตือน',Bell],['profile','เครื่อง',User]] as const).map(([tab,label,Icon]) => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === tab ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'}`}><Icon className="w-4 h-4"/>{label}{tab === 'notifications' && unreadCount > 0 ? ` (${unreadCount})` : ''}</button>)}</nav><button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'user' }) }); setAuthUser(null); }} className="rounded-xl border px-3 py-2 text-xs font-semibold">Sign out</button>
        {currentDispenser && <select aria-label="เลือกเครื่องจ่ายน้ำ" value={selectedMachineId} onChange={(event) => selectDispenser(machines.find((item) => item.id === event.target.value)!)} className="max-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium">{machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.name} · {machine.id}</option>)}</select>}
      </div>
    </header>

    {toast && <div role="status" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}
    {error && <div role="alert" className="max-w-7xl w-full mx-auto px-4 pt-4"><div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0"/>{error}</div></div>}

    <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {loading && <div className="rounded-2xl bg-white p-6 text-sm text-slate-500">กำลังโหลดข้อมูลจากระบบ…</div>}
      {!loading && !error && !currentDispenser && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><Droplet className="w-9 h-9 mx-auto text-sky-600 mb-3"/><h2 className="font-bold text-slate-900">ยังไม่มีเครื่องจ่ายน้ำ</h2><p className="text-sm text-slate-500 mt-1">ให้ผู้ดูแลเพิ่มเครื่อง RO ในหน้า Machines ของระบบ Admin ก่อน</p></div>}
      {!loading && currentDispenser && <>
        {isDispensingView ? <DispensingScreen dispenserName={currentDispenser.name} onBack={() => setIsDispensingView(false)} onCompleteDispense={submitDispense}/> : <>
          {activeTab === 'home' && <HomeScreen currentDispenser={currentDispenser} allDispensers={machines} onSelectDispenser={selectDispenser} onNavigateToDispense={() => setIsDispensingView(true)} onRefreshMetrics={refreshFromServer}/>}
          {activeTab === 'history' && <HistoryScreen onBack={() => setActiveTab('home')} logs={data?.logs ?? []}/>}
          {activeTab === 'notifications' && <NotificationsScreen onBack={() => setActiveTab('home')} notifications={data?.notifications ?? []} onTriggerAutoFlush={requestFlush} onMarkAllAsRead={markNotificationsRead}/>}
          {activeTab === 'profile' && <ProfileScreen currentDispenser={currentDispenser}/>}
        </>}
      </>}
    </main>

    {!isDispensingView && <nav aria-label="เมนู" className="sticky bottom-0 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 z-30"><div className="max-w-xl mx-auto flex justify-around">{([['home','หน้าหลัก',Home],['history','ประวัติ',Clock],['notifications','แจ้งเตือน',Bell],['profile','เครื่อง',User]] as const).map(([tab,label,Icon]) => <button key={tab} onClick={() => setActiveTab(tab)} className={`relative flex flex-col items-center gap-1 px-3 py-1 text-[11px] ${activeTab === tab ? 'text-sky-700 font-bold' : 'text-slate-500'}`}><Icon className="w-5 h-5"/>{label}{tab === 'notifications' && unreadCount > 0 && <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-rose-500"/>}</button>)}</div></nav><button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'user' }) }); setAuthUser(null); }} className="rounded-xl border px-3 py-2 text-xs font-semibold">Sign out</button>}
  </div>;
}
