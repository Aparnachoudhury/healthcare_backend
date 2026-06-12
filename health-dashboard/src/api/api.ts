import type {
  DeviceRow, AlarmRow, SimpleSeriesData,
  VitalsData, WellnessData, DiagnosticsData, SafetyData,
} from "../types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/v1/api";

async function get<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json() as Promise<T>;
}

// ─── Global (non-device) endpoints ────────────────────────────
export const getHealthData = () => get<DeviceRow[]>(`${BASE}/health-data`);
export const getAlarms     = () => get<AlarmRow[]>(`${BASE}/alarms`);

// ─── Grouped device endpoints (one Firestore read per group) ──
export const getVitals      = (id: string) => get<VitalsData>(`${BASE}/device/${id}/vitals`);
export const getWellness    = (id: string) => get<WellnessData>(`${BASE}/device/${id}/wellness`);
export const getDiagnostics = (id: string) => get<DiagnosticsData>(`${BASE}/device/${id}/diagnostics`);
export const getSafety      = (id: string) => get<SafetyData>(`${BASE}/device/${id}/safety`);

// ─── New endpoints ─────────────────────────────────────────────
export const getDeviceInfo = (id: string) => get<Record<string, any>>(`${BASE}/device/${id}/info`);
export const getSos        = (id: string) => get<Record<string, any>>(`${BASE}/device/${id}/sos`);

// ─── Individual endpoints still used by "more" tabs ───────────
export const getBloodSugar  = (id: string) => get<SimpleSeriesData>(`${BASE}/device/${id}/bloodsugar`);
export const getBloodKetone = (id: string) => get<SimpleSeriesData>(`${BASE}/device/${id}/bloodketone`);
export const getUricAcid    = (id: string) => get<SimpleSeriesData>(`${BASE}/device/${id}/uricacid`);
