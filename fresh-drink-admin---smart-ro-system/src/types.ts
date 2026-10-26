export type TabType = 'dashboard' | 'filter' | 'alerts' | 'reports' | 'profile';

export type AlertStatus = 'new' | 'in_progress' | 'completed';
export type AlertSeverity = 'critical' | 'warning' | 'normal';

export interface AlertItem {
  id: string;
  title: string;
  type: AlertSeverity;
  status: AlertStatus;
  statusText: string;
  machineId: string;
  location: string;
  time: string;
  timestamp: string;
  isUnread?: boolean;
}

export interface MaintenanceRecord {
  id: string;
  dateTime: string;
  technician: string;
  machineId: string;
  notes: string;
}

export interface AutoFlushRecord {
  id: string;
  time: string;
  date: string;
  triggerType: string;
  status: 'requested' | 'success' | 'failed';
}

export interface WaterUsageData {
  date: string;
  liters: number;
}

export interface FilterEfficiencyData {
  date: string;
  percentage: number;
}

export interface FrequentIssue {
  id: string;
  issue: string;
  count: number;
  percentage: number;
  color: string;
  barColor: string;
}

export interface RealtimeDataPoint {
  time: string;
  pressure: number; // in bar
  purity: number; // in %
}

export interface Machine {
  id: string;
  name: string;
  location: string;
  filterPercent: number;
}

export interface DashboardData {
  machine: Machine;
  alerts: AlertItem[];
  flushHistory: AutoFlushRecord[];
  maintenanceLogs: MaintenanceRecord[];
  filterPercent: number;
  flushCountToday: number;
  lastFlushTime: string;
  realtimeData: RealtimeDataPoint[];
  usageData: WaterUsageData[];
  efficiencyData: FilterEfficiencyData[];
  frequentIssues: FrequentIssue[];
  dispenseRequests: DispenseRequest[];
}

export interface DispenseRequest {
  id: string;
  machineId: string;
  amountMl: number;
  status: 'requested' | 'completed' | 'failed';
  createdAt: string;
}
