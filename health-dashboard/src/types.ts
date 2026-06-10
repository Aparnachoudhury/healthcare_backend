export interface DeviceRow {
  id: string;
  nickname: string;
  model: string;
  deviceId: string;
  status: string;
  steps: number;
  heartRate: number;
  bloodOxygen: number;
  bodyTemp: number;
  phone: string;
  updateTime: string;
}

export interface AlarmRow {
  id: string;
  nickname: string;
  deviceId: string;
  type: string;
  time: string;
  location: string;
  content: string;
}

export interface TimeValue {
  time: string;
  value: number;
}

export interface BPPoint {
  time: string;
  systolic: number;
  diastolic: number;
}

export interface WarningRecord {
  time: string;
  value: string | number;
}

export interface HeartRateData {
  deviceId: string;
  series: TimeValue[];
  average: number;
  max: number;
  min: number;
}

export interface SleepStagePoint {
  time: string;
  stage: number;
}

export interface SleepData {
  deviceId: string;
  date: string;
  totalMinutes: number;
  series: SleepStagePoint[];
  deepSleepMinutes: number;
  lightSleepMinutes: number;
  awakeTimes: number;
  sleepScore: number;
}

export interface BloodPressureData {
  deviceId: string;
  date: string;
  series: BPPoint[];
  avgSystolic: number;
  avgDiastolic: number;
  warningRecords: WarningRecord[];
}

export interface BloodOxygenData {
  deviceId: string;
  date: string;
  series: TimeValue[];
  average: number;
  max: number;
  min: number;
  warningRecords: WarningRecord[];
}

export interface BodyTempData {
  deviceId: string;
  date: string;
  series: TimeValue[];
  average: number;
  max: number;
  min: number;
  warningRecords: WarningRecord[];
}

export interface HeartHealthData {
  deviceId: string;
  date: string;
  diagnosis: string;
  afibRisk: string;
  hrvScore: number;
  series: TimeValue[];
}

export interface PressureData {
  deviceId: string;
  date: string;
  series: TimeValue[];
  average: number;
  level: string;
}

export interface SimpleSeriesData {
  deviceId: string;
  date: string;
  series: TimeValue[];
  average: number;
  max?: number;
  min?: number;
  unit: string;
  normalRange?: string;
  maleStandard?: string;
  femaleStandard?: string;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  time: string;
}

export interface LocationData {
  deviceId: string;
  date: string;
  tracks: LocationPoint[];
  lastLocation: { lat: number; lng: number } | null;
}

export interface OverviewData {
  deviceId: string;
  date: string;
  steps: number;
  heartRate: number;
  bloodOxygen: number;
  bodyTemp: number;
  sleepHours: number;
  bloodPressure: { systolic: number; diastolic: number };
}
