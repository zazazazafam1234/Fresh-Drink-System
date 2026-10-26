export type TabType = 'home' | 'history' | 'notifications' | 'profile';

export type DispenserOption = {
  id: string;
  name: string;
  location: string;
  status: 'ready' | 'flushing' | 'maintenance';
  tds: number | null;
  ph: number | null;
  turbidity: number | null;
  temp: number | null;
  pressure: number | null;
  purity: number | null;
  telemetryRecordedAt?: string | null;
  filterRemainingPercent: number;
  filteredLiters: number | null;
  maxFilterLiters: number | null;
};

export type WaterLog = {
  id: string;
  createdAt?: string;
  status?: 'requested' | 'completed' | 'failed';
  date: string;
  time: string;
  amount: number; // in ml
  unitDisplay: string;
  dispenserName: string;
};

export type NotificationItem = {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionable?: boolean;
};

export type PresetVolume = {
  id: string;
  label: string;
  amountMl: number;
  iconType: 'cup-small' | 'cup-medium' | 'flask' | 'custom';
};
