import type {
  DeviceRow, AlarmRow, HeartRateData, SleepData,
  BloodPressureData, BloodOxygenData, BodyTempData,
  HeartHealthData, PressureData, SimpleSeriesData,
  LocationData, OverviewData,
} from "../types";

const BASE = "http://localhost:3000/api";

async function get<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json() as Promise<T>;
}

export const getHealthData    = ()             => get<DeviceRow[]>(`${BASE}/health-data`);
export const getAlarms        = ()             => get<AlarmRow[]>(`${BASE}/alarms`);

export const getOverview      = (id: string)   => get<OverviewData>(`${BASE}/device/${id}/overview`);
export const getHeartRate     = (id: string)   => get<HeartRateData>(`${BASE}/device/${id}/heartrate`);
export const getSleep         = (id: string)   => get<SleepData>(`${BASE}/device/${id}/sleep`);
export const getBloodPressure = (id: string)   => get<BloodPressureData>(`${BASE}/device/${id}/bloodpressure`);
export const getBloodOxygen   = (id: string)   => get<BloodOxygenData>(`${BASE}/device/${id}/bloodoxygen`);
export const getBodyTemp      = (id: string)   => get<BodyTempData>(`${BASE}/device/${id}/bodytemp`);
export const getHeartHealth   = (id: string)   => get<HeartHealthData>(`${BASE}/device/${id}/hearthealth`);
export const getECG           = (id: string)   => get<unknown>(`${BASE}/device/${id}/ecg`);
export const getPressure      = (id: string)   => get<PressureData>(`${BASE}/device/${id}/pressure`);
export const getBloodSugar    = (id: string)   => get<SimpleSeriesData>(`${BASE}/device/${id}/bloodsugar`);
export const getBloodKetone   = (id: string)   => get<SimpleSeriesData>(`${BASE}/device/${id}/bloodketone`);
export const getUricAcid      = (id: string)   => get<SimpleSeriesData>(`${BASE}/device/${id}/uricacid`);
export const getLocationTrack = (id: string)   => get<LocationData>(`${BASE}/device/${id}/locationtrack`);
