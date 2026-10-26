import React, { useCallback, useEffect, useState } from 'react';
import { AlertItem, DashboardData, Machine, TabType } from './types';
import { DashboardScreen } from './components/DashboardScreen';
import { FilterScreen } from './components/FilterScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav } from './components/BottomNav';
import { AutoFlushModal } from './components/modals/AutoFlushModal';
import { AssignTaskModal } from './components/modals/AssignTaskModal';
import { FilterReplaceModal } from './components/modals/FilterReplaceModal';
import { ExportModal } from './components/modals/ExportModal';
import { WaterDropLogo } from './components/WaterDropLogo';
import { Zap, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { AuthScreen, SignedInUser } from './AuthScreen';

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<SignedInUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [flushOpen, setFlushOpen] = useState(false);
  const [assignAlert, setAssignAlert] = useState<AlertItem | null>(null);
  const [assignMode, setAssignMode] = useState<'assign' | 'resolve'>('assign');
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | null>(null);

  useEffect(() => { fetch('/api/auth/me?role=admin').then((response) => response.json()).then((body) => setAuthUser(body.user?.role === 'admin' ? body.user : null)).catch(() => setAuthUser(null)).finally(() => setAuthReady(true)); }, []);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3500); };
  const reloadMachines = useCallback(async () => {
    const items = await api<Machine[]>('/api/machines');
    setMachines(items);
    return items;
  }, []);
  const reloadDashboard = useCallback(async (machineId: string) => {
    const data = await api<DashboardData>(`/api/dashboard?machineId=${encodeURIComponent(machineId)}`);
    setDashboard(data);
    return data;
  }, []);

  useEffect(() => {
    if (!authReady || !authUser) return;
    reloadMachines().then((items) => { if (items.length) setSelectedMachine(items[0].id); setError(''); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not connect to the API'))
      .finally(() => setLoading(false));
  }, [reloadMachines, authReady, authUser]);

  useEffect(() => {
    if (!authUser) return;
    if (!selectedMachine) { setDashboard(null); return; }
    setLoading(true);
    reloadDashboard(selectedMachine)
      .then(() => setError(''))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load machine data'))
      .finally(() => setLoading(false));
  }, [selectedMachine, reloadDashboard, authUser]);

  const updateDashboard = async (message: string, action: () => Promise<unknown>) => {
    try { await action(); if (selectedMachine) await reloadDashboard(selectedMachine); notify(message); }
    catch (reason) { notify(reason instanceof Error ? reason.message : 'Could not save changes'); }
  };

  const alerts = dashboard?.alerts ?? [];
  const unreadCount = alerts.filter((alert) => alert.isUnread).length;
  const machine = dashboard?.machine;
  const handleCreateMachine = async (newMachine: Machine) => {
    await api('/api/machines', { method: 'POST', body: JSON.stringify(newMachine) });
    await reloadMachines();
    setSelectedMachine(newMachine.id);
    setActiveTab('dashboard');
  };
  const handleAssign = async (alertId: string, technician?: string, notes?: string) => {
    await api(`/api/alerts/${encodeURIComponent(alertId)}`, {
      method: 'PATCH', body: JSON.stringify({ status: assignMode === 'assign' ? 'in_progress' : 'completed', technician, notes }),
    });
    await reloadDashboard(selectedMachine);
    notify('Alert updated.');
  };
  const handleMaintenance = async (log: { technician: string; machineId: string; notes: string; dateTime: string }) => {
    await updateDashboard('Maintenance record saved.', () => api('/api/maintenance', {
      method: 'POST', body: JSON.stringify({ ...log, machineId: selectedMachine }),
    }));
  };
  const handleReplacement = async (date: string, technician: string, filterType: string) => {
    await api('/api/filter-replacements', {
      method: 'POST', body: JSON.stringify({ machineId: selectedMachine, date, technician, filterType }),
    });
    await reloadDashboard(selectedMachine);
    notify('Filter replacement saved.');
  };
  const handleFlush = async () => {
    await api('/api/flush', { method: 'POST', body: JSON.stringify({ machineId: selectedMachine }) });
    await reloadDashboard(selectedMachine);
    notify('Flush request saved. Connect a device controller to operate the machine.');
  };

  if (!authReady) return <div className="min-h-screen grid place-items-center text-slate-500">กำลังตรวจสอบบัญชี…</div>;
  if (!authUser) return <AuthScreen role="admin" onSignedIn={setAuthUser}/>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs px-3 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3"><WaterDropLogo size={32}/><div><div className="flex items-center gap-2"><span className="font-bold text-slate-900 text-sm sm:text-base">Fresh Drink Admin</span><span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">Smart RO System</span></div><p className="text-[11px] text-slate-500">{machine ? `${machine.name} · ${machine.id}` : 'Water system management'}</p></div></div>
          <nav aria-label="Main navigation" className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs">
            {([['dashboard','แดชบอร์ด'],['filter','ไส้กรอง'],['alerts','แจ้งเตือน'],['reports','รายงาน'],['profile','เครื่อง RO']] as [TabType,string][]).map(([tab,label]) => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap ${activeTab === tab ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>{label}{tab === 'alerts' && unreadCount > 0 ? ` (${unreadCount})` : ''}</button>)}
          </nav>
          <div className="flex items-center gap-2"><button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'admin' }) }); setAuthUser(null); }} className="rounded-xl border px-3 py-2 text-xs font-semibold">Sign out</button><button disabled={!selectedMachine} onClick={() => setFlushOpen(true)} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 fill-white"/>ขอ Auto Flush</button></div>
        </div>
      </header>

      {toast && <div role="status" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs"><CheckCircle2 className="w-4 h-4 text-emerald-400"/><span>{toast}</span></div>}
      {error && <div role="alert" className="max-w-7xl w-full mx-auto mt-4 px-4"><div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0"/>{error}</div></div>}

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {loading && <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">Loading saved data…</div>}
        {!loading && !selectedMachine && !error && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><Database className="w-8 h-8 text-blue-600 mx-auto mb-3"/><h1 className="text-lg font-bold text-slate-900">Add your first RO machine</h1><p className="text-sm text-slate-500 mt-1 mb-4">Machine data and activity will be saved in your MySQL database.</p><button onClick={() => setActiveTab('profile')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Open machine settings</button></div>}
        {!loading && activeTab === 'profile' && <ProfileScreen currentMachine={selectedMachine} machines={machines} onSelectMachine={setSelectedMachine} onCreateMachine={handleCreateMachine}/>}
        {!loading && selectedMachine && dashboard && activeTab !== 'profile' && <>
          {activeTab === 'dashboard' && <DashboardScreen machineId={selectedMachine} onRefreshDashboard={() => reloadDashboard(selectedMachine)} onNavigateTab={setActiveTab} onTriggerFlush={() => setFlushOpen(true)} filterPercent={dashboard.filterPercent} flushCountToday={dashboard.flushCountToday} lastFlushTime={dashboard.lastFlushTime} alerts={dashboard.alerts} realtimeData={dashboard.realtimeData} dispenseRequests={dashboard.dispenseRequests}/>}
          {activeTab === 'filter' && <FilterScreen onBack={() => setActiveTab('dashboard')} onNavigateTab={setActiveTab} onTriggerFlush={() => setFlushOpen(true)} onOpenReplaceModal={() => setReplaceOpen(true)} filterPercent={dashboard.filterPercent} flushHistory={dashboard.flushHistory}/>}
          {activeTab === 'alerts' && <AlertsScreen currentMachineId={selectedMachine} alerts={dashboard.alerts} maintenanceLogs={dashboard.maintenanceLogs} onAssignAlert={(alert) => {setAssignAlert(alert);setAssignMode('assign');}} onResolveAlert={(alert) => {setAssignAlert(alert);setAssignMode('resolve');}} onAddMaintenanceLog={handleMaintenance}/>}
          {activeTab === 'reports' && <ReportsScreen usageData={dashboard.usageData} efficiencyData={dashboard.efficiencyData} frequentIssues={dashboard.frequentIssues} onExport={setExportType}/>}
        </>}
        {!loading && selectedMachine && !dashboard && !error && <p className="bg-white rounded-xl p-5 text-sm text-slate-500">No saved data for this machine.</p>}
      </main>
      <div className="sticky bottom-0 md:hidden"><BottomNav currentTab={activeTab} onSelectTab={setActiveTab} unreadAlertCount={unreadCount}/></div>

      <AutoFlushModal isOpen={flushOpen} onClose={() => setFlushOpen(false)} onFlushComplete={handleFlush} machineName={machine ? `${machine.name} (${machine.id})` : ''}/>
      <AssignTaskModal isOpen={!!assignAlert} alert={assignAlert} mode={assignMode} onClose={() => setAssignAlert(null)} onConfirm={handleAssign}/>
      <FilterReplaceModal isOpen={replaceOpen} onClose={() => setReplaceOpen(false)} onConfirm={handleReplacement}/>
      <ExportModal isOpen={!!exportType} type={exportType} dashboard={dashboard} onClose={() => setExportType(null)}/>
    </div>
  );
}
