export type TabType = 'home' | 'history' | 'notifications' | 'profile';

export type DispenserOption = {
  id: string;
  name: string;
  location: string;
  telemetryStatus: 'recent' | 'stale' | 'never';
  tds: number | null;
  ph: number | null;
  turbidity: number | null;
  temp: number | null;
  pressure: number | null;
  purity: number | null;
  filterRemainingPercent: number;
  filteredLiters: number | null;
  maxFilterLiters: number | null;
  recordedAt: string | null;
};

export type WaterLog = {
  id: string;
  date: string;
  time: string;
  createdAt: string;
  amount: number;
  unitDisplay: string;
  dispenserName: string;
  status: 'requested' | 'completed' | 'failed';
};

export type NotificationItem = {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export type UserMachineData = {
  machine: DispenserOption;
  logs: WaterLog[];
  notifications: NotificationItem[];
};
