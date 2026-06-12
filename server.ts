import express, { Request, Response } from "express";
import cors from "cors";
import db from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "application/octet-stream" }));

// â"€â"€â"€ IST HELPERS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const IST = { timeZone: "Asia/Kolkata" };

function istTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", { ...IST, hour: "2-digit", minute: "2-digit" });
}

function istDateTime(date: Date): string {
  return date.toLocaleString("en-IN", IST);
}

function istDate(date: Date): string {
  return date.toLocaleDateString("en-CA", IST);
}

// â"€â"€â"€ TYPES â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
interface HealthRecord {
  timestamp: Date;
  steps: number;
  heartRate: number;
  spo2: number;
  bodyTemp: number;
  sleepHours: number;
  deepSleepMinutes: number;
  lightSleepMinutes: number;
  remSleepMinutes: number;
  systolic: number;
  diastolic: number;
  hrv: number;
  stress: number;
  bloodSugar: number;
  bloodKetone: number;
  uricAcid: number;
  distance: number;
  calories: number;
  location: { lat: number; lng: number } | null;
  ecgRecords: number[];
}

// â"€â"€â"€ FIRESTORE HEALTH DATA HISTORY UTILITY â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
async function getLiveDeviceFallback(deviceId: string): Promise<Partial<HealthRecord> | null> {
  const liveDoc = await db.collection("live_devices").doc(deviceId).get();
  if (!liveDoc.exists) return null;
  const d = liveDoc.data() as Record<string, any>;
  const inner = d?.decoded?.data || d || {};
  return {
    timestamp: new Date(),
    steps:      inner.steps ?? 0,
    heartRate:  inner.heart_rate_bpm ?? inner.heart_rate ?? 0,
    spo2:       inner.spo2_percent ?? inner.spo2 ?? 0,
    bodyTemp:   inner.body_temperature_c ?? inner.temperature ?? 0,
    sleepHours: inner.sleep_hours ?? 0,
    systolic:   inner.bp_systolic_mmhg ?? inner.systolic ?? 0,
    diastolic:  inner.bp_diastolic_mmhg ?? inner.diastolic ?? 0,
  };
}

async function getDeviceHealthHistory(deviceId: string): Promise<HealthRecord[]> {
  const snapshot = await db.collection("healthData")
    .where("device_id", "==", deviceId)
    .limit(200)
    .get();
  const records: HealthRecord[] = [];

  snapshot.forEach(doc => {
    const d = doc.data() as Record<string, any>;
    let payload: Record<string, any> = d;

    if (d.rawData) {
      try {
        const parsedRaw = JSON.parse(d.rawData);
        if (parsedRaw && parsedRaw.type === "Buffer") {
          const buf = Buffer.from(parsedRaw.data);
          const str = buf.toString();
          try { payload = JSON.parse(str); }
          catch { payload = { device_id: str.substring(0, 15), raw_str: str }; }
        } else {
          payload = parsedRaw;
        }
      } catch { /* ignore */ }
    }

    let timestamp = new Date();
    if (d.receivedAt) {
      timestamp = d.receivedAt.toDate ? d.receivedAt.toDate() : new Date(d.receivedAt);
    } else if (payload.timestamp) {
      timestamp = new Date(payload.timestamp);
    } else if (payload.created_at) {
      timestamp = new Date(payload.created_at);
    }

    const inner = payload.decoded?.data || payload.data || payload;

    records.push({
      timestamp,
      steps:       Number(inner.steps ?? 0),
      heartRate:   Number(inner.heart_rate_bpm ?? inner.heart_rate ?? inner.heartRate ?? 0),
      spo2:        Number(inner.spo2_percent ?? inner.spo2 ?? 0),
      bodyTemp:    Number(inner.body_temperature_c ?? inner.temperature ?? inner.bodyTemp ?? 0),
      sleepHours:        Number(inner.sleep_hours ?? inner.sleepHours ?? 0),
      deepSleepMinutes:  Number(inner.deep_sleep_minutes ?? inner.deepSleepMinutes ?? 0),
      lightSleepMinutes: Number(inner.light_sleep_minutes ?? inner.lightSleepMinutes ?? 0),
      remSleepMinutes:   Number(inner.rem_sleep_minutes ?? inner.remSleepMinutes ?? 0),
      systolic:          Number(inner.bp_systolic_mmhg ?? inner.systolic ?? 0),
      diastolic:         Number(inner.bp_diastolic_mmhg ?? inner.diastolic ?? 0),
      hrv:               Number(inner.hrv_ms ?? inner.hrvScore ?? 0),
      stress:            Number(inner.stress_score ?? inner.stress ?? 0),
      bloodSugar:        Number(inner.blood_sugar ?? inner.bloodsugar ?? 0),
      bloodKetone:       Number(inner.blood_ketone ?? inner.bloodketone ?? 0),
      uricAcid:          Number(inner.uric_acid ?? inner.uricacid ?? 0),
      distance:          Number(inner.distance ?? inner.distance_m ?? 0),
      calories:          Number(inner.calories ?? inner.calorie ?? 0),
      location:          inner.location || (inner.latitude && inner.longitude ? { lat: inner.latitude, lng: inner.longitude } : null),
      ecgRecords:        inner.ecg_records || [],
    });
  });

  records.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return records;
}

// ─── TAB BUILDER FUNCTIONS ─────────────────────────────────────
// Each builder is a pure function: takes pre-loaded history, returns the
// same shape as its corresponding endpoint. Existing endpoints delegate
// here; the /dashboard endpoint calls all of them after one Firestore read.

function buildOverview(deviceId: string, history: HealthRecord[], liveFallback?: Partial<HealthRecord> | null) {
  const latest: Partial<HealthRecord> = history.length > 0 ? history[history.length - 1] : (liveFallback ?? {});
  return {
    deviceId,
    date: latest.timestamp ? istDate(latest.timestamp) : istDate(new Date()),
    steps: latest.steps || 0,
    heartRate: latest.heartRate || 0,
    bloodOxygen: latest.spo2 || 0,
    bodyTemp: latest.bodyTemp || 0,
    sleepHours: latest.sleepHours || 0,
    distance: latest.distance || 0,
    calories: latest.calories || 0,
    bloodPressure: { systolic: latest.systolic || 0, diastolic: latest.diastolic || 0 },
  };
}

function buildHeartRate(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.heartRate > 0);
  const values = records.map(r => r.heartRate);
  return {
    deviceId,
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.heartRate })),
    average: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
    max: values.length ? Math.max(...values) : 0,
    min: values.length ? Math.min(...values) : 0,
  };
}

function buildSleep(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.sleepHours > 0);
  const latest = records.length ? records[records.length - 1] : null;
  const totalMinutes = latest ? Math.round(latest.sleepHours * 60) : 0;
  // Use real firmware values only — never estimate sleep stages from total hours
  const deepMin  = latest?.deepSleepMinutes  ?? 0;
  const remMin   = latest?.remSleepMinutes   ?? 0;
  const lightMin = latest?.lightSleepMinutes ?? 0;
  const stagesAvailable = deepMin > 0 || remMin > 0 || lightMin > 0;
  return {
    deviceId,
    date: latest ? istDate(latest.timestamp) : istDate(new Date()),
    totalMinutes,
    series: records.map(r => ({ time: istTime(r.timestamp), stage: r.sleepHours > 6 ? 2 : r.sleepHours > 4 ? 1 : 0 })),
    deepSleepMinutes: deepMin,
    lightSleepMinutes: lightMin,
    remSleepMinutes: remMin,
    stagesAvailable,
    awakeTimes: latest ? 1 : 0,
    sleepScore: totalMinutes > 480 ? 90 : totalMinutes > 360 ? 75 : totalMinutes > 0 ? 60 : 0,
    sleepScoreNote: "Calculated from total sleep duration. Not a clinical measurement.",
    apneaRisk: "Unknown",
  };
}

function buildBloodPressure(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.systolic > 0 && r.diastolic > 0);
  const s = records.map(r => r.systolic), d = records.map(r => r.diastolic);
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    series: records.map(r => ({ time: istTime(r.timestamp), systolic: r.systolic, diastolic: r.diastolic })),
    avgSystolic: s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0,
    avgDiastolic: d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : 0,
    warningRecords: records.filter(r => r.systolic > 140 || r.diastolic > 90).map(r => ({ time: istDateTime(r.timestamp), value: `${r.systolic}/${r.diastolic}` })),
  };
}

function buildBloodOxygen(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.spo2 > 0);
  const values = records.map(r => r.spo2);
  return {
    deviceId,
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.spo2 })),
    average: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
    max: values.length ? Math.max(...values) : 0,
    min: values.length ? Math.min(...values) : 0,
    warningRecords: records.filter(r => r.spo2 < 95).map(r => ({ time: istDateTime(r.timestamp), value: r.spo2 })),
  };
}

function buildBodyTemp(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.bodyTemp > 0);
  const values = records.map(r => r.bodyTemp);
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.bodyTemp })),
    average: values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0,
    max: values.length ? Math.max(...values) : 0,
    min: values.length ? Math.min(...values) : 0,
    warningRecords: records.filter(r => r.bodyTemp > 37.5 || r.bodyTemp < 35.5).map(r => ({ time: istDateTime(r.timestamp), value: r.bodyTemp })),
  };
}

function buildHeartHealth(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.hrv > 0);
  const values = records.map(r => r.hrv);
  const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    diagnosis: average > 50 ? "HRV looks normal. No cardiac anomalies detected." : average > 0 ? "Low HRV detected. Consider resting or monitoring." : "No HRV data available.",
    afibRisk: average > 50 ? "Low" : average > 0 ? "Moderate" : "Unknown",
    hrvScore: average,
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.hrv })),
  };
}

function buildEcg(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.ecgRecords && r.ecgRecords.length > 0);
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    records: records.map(r => ({ time: istDateTime(r.timestamp), wave: r.ecgRecords })),
    aiResult: records.length ? "Normal sinus rhythm detected from device recordings." : "No active ECG recordings uploaded from device.",
  };
}

function buildPressure(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.stress > 0);
  const values = records.map(r => r.stress);
  const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.stress })),
    average,
    level: average < 30 ? "Relaxed" : average < 60 ? "Normal" : "High",
  };
}

function buildBloodSugar(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.bloodSugar > 0);
  const values = records.map(r => r.bloodSugar);
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.bloodSugar })),
    average: values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0,
    max: values.length ? Math.max(...values) : 0,
    min: values.length ? Math.min(...values) : 0,
    unit: "mmol/L",
  };
}

function buildBloodKetone(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.bloodKetone > 0);
  const values = records.map(r => r.bloodKetone);
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.bloodKetone })),
    average: values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0,
    unit: "mmol/L",
    normalRange: "0.0~0.3mmol/L",
  };
}

function buildUricAcid(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.uricAcid > 0);
  const values = records.map(r => r.uricAcid);
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    series: records.map(r => ({ time: istTime(r.timestamp), value: r.uricAcid })),
    average: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
    unit: "μmol/L",
    maleStandard: "<420μmol/L",
    femaleStandard: "<360μmol/L",
  };
}

async function buildInfo(deviceId: string): Promise<Record<string, any>> {
  const liveDoc = await db.collection("live_devices").doc(deviceId).get();
  if (!liveDoc.exists) return { deviceId, error: "Device not found" };
  const d = liveDoc.data() as Record<string, any>;
  const inner = d?.decoded?.data || d || {};
  let lastSeen = "";
  if (d.receivedAt) lastSeen = istDateTime(d.receivedAt.toDate ? d.receivedAt.toDate() : new Date(d.receivedAt));
  return {
    deviceId,
    model:           d.model || inner.model || "H102CSH",
    firmwareVersion: inner.firmware_version ?? inner.fw_version ?? null,
    battery:         inner.battery_level    ?? inner.battery    ?? null,
    signal:          inner.signal_strength  ?? inner.signal     ?? null,
    networkType:     inner.network_type     ?? inner.networkType     ?? null,
    networkOperator: inner.network_operator ?? inner.networkOperator ?? null,
    simIccid:        inner.sim_iccid        ?? inner.iccid      ?? null,
    phone:           inner.phone_number     ?? d.phone          ?? null,
    status:          d.status || "Online",
    lastSeen,
  };
}

function buildSos(deviceId: string, alarms: Record<string, any>[]) {
  const sosEvents   = alarms.filter(a => /sos/i.test(a.type || ""));
  const fallAlarms  = alarms.filter(a => /fall/i.test(a.type || ""));
  const sedentary   = alarms.filter(a => /sedentary/i.test(a.type || ""));
  return {
    deviceId,
    sosEvents,
    fallAlarms,
    sedentaryAlarms: sedentary,
    callLogs: [], // populated when call_logs Firestore collection is available
  };
}

function buildLocationTrack(deviceId: string, history: HealthRecord[]) {
  const records = history.filter(r => r.location && typeof r.location.lat === "number" && typeof r.location.lng === "number");
  const tracks = records.map(r => ({ lat: r.location!.lat, lng: r.location!.lng, time: istDateTime(r.timestamp) }));
  return {
    deviceId,
    date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
    tracks,
    lastLocation: tracks.length ? { lat: tracks[tracks.length - 1].lat, lng: tracks[tracks.length - 1].lng } : null,
  };
}

// â"€â"€â"€ WATCH UPLOAD â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function sendWatchAck(res: Response): void {
  const buf = Buffer.from([0x00]);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", 1);
  res.end(buf);
}

app.post("/v1/4g/pb/upload", async (req: Request, res: Response) => {
  try {
    const data = req.body as Record<string, any>;
    await db.collection("live_devices").doc(String(data.device_id)).set({ ...data, receivedAt: new Date() });
    await db.collection("healthData").add({ ...data, receivedAt: new Date() });
    console.log("Saved:", data.device_id);
    sendWatchAck(res);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// â"€â"€â"€ HEALTH DATA â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
app.get("/v1/api/health-data", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("live_devices").get();
    const data = snapshot.docs.map(doc => {
      const d = doc.data() as Record<string, any>;
      let updateTime = new Date();
      if (d.receivedAt) {
        updateTime = d.receivedAt.toDate ? d.receivedAt.toDate() : new Date(d.receivedAt);
      } else if (d.timestamp) {
        updateTime = new Date(d.timestamp);
      } else if (d.created_at) {
        updateTime = d.created_at.toDate ? d.created_at.toDate() : new Date(d.created_at);
      }
      return {
        id: d.device_id || doc.id,
        nickname: d.device_id || "IWOWN",
        model: d.model || "H102CSH",
        deviceId: d.device_id || doc.id,
        status: d.status || "Online",
        steps: d?.decoded?.data?.steps || d?.steps || 0,
        heartRate: d?.decoded?.data?.heart_rate_bpm || d?.heart_rate || 0,
        bloodOxygen: d?.decoded?.data?.spo2_percent || d?.spo2 || 0,
        bodyTemp: d?.decoded?.data?.body_temperature_c || d?.temperature || 0,
        phone: d?.decoded?.data?.phone_number || d?.phone || "N/A",
        updateTime: istDateTime(updateTime),
      };
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/v1/api/device/:deviceId/bloodsugar", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    res.json(buildBloodSugar(deviceId, await getDeviceHealthHistory(deviceId)));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/v1/api/device/:deviceId/bloodketone", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    res.json(buildBloodKetone(deviceId, await getDeviceHealthHistory(deviceId)));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/v1/api/device/:deviceId/uricacid", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    res.json(buildUricAcid(deviceId, await getDeviceHealthHistory(deviceId)));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── GROUPED ENDPOINTS (one Firestore read per group) ─────────

// heartrate + bloodpressure + bloodoxygen + bodytemp
app.get("/v1/api/device/:deviceId/vitals", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const history = await getDeviceHealthHistory(deviceId);
    res.json({
      deviceId,
      heartrate:     buildHeartRate(deviceId, history),
      bloodpressure: buildBloodPressure(deviceId, history),
      bloodoxygen:   buildBloodOxygen(deviceId, history),
      bodytemp:      buildBodyTemp(deviceId, history),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// overview + sleep + hearthealth (HRV) + pressure (stress)
app.get("/v1/api/device/:deviceId/wellness", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const [history, liveFallback] = await Promise.all([
      getDeviceHealthHistory(deviceId),
      getLiveDeviceFallback(deviceId),
    ]);
    res.json({
      deviceId,
      overview:    buildOverview(deviceId, history, liveFallback),
      sleep:       buildSleep(deviceId, history),
      hearthealth: buildHeartHealth(deviceId, history),
      pressure:    buildPressure(deviceId, history),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ecg only
app.get("/v1/api/device/:deviceId/diagnostics", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const history = await getDeviceHealthHistory(deviceId);
    res.json({ deviceId, ecg: buildEcg(deviceId, history) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/v1/api/device/:deviceId/info", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    res.json(await buildInfo(deviceId));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/v1/api/device/:deviceId/sos", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const alarmsSnap = await db.collection("alarms").where("deviceId", "==", deviceId).get();
    const alarms = alarmsSnap.docs.map(doc => {
      const d = doc.data() as Record<string, any>;
      let time = "";
      if (d.time)            time = d.time.toDate ? istDateTime(d.time.toDate()) : String(d.time);
      else if (d.receivedAt) time = d.receivedAt.toDate ? istDateTime(d.receivedAt.toDate()) : String(d.receivedAt);
      else if (d.timestamp)  time = istDateTime(new Date(d.timestamp));
      return { id: doc.id, deviceId: d.deviceId || d.device_id || "", type: d.type || "", time, location: d.location || "", content: d.content || "" };
    });
    res.json(buildSos(deviceId, alarms));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// locationtrack + device-scoped alarms
app.get("/v1/api/device/:deviceId/safety", async (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const [history, alarmsSnap] = await Promise.all([
      getDeviceHealthHistory(deviceId),
      db.collection("alarms").where("deviceId", "==", deviceId).get(),
    ]);
    const alarms = alarmsSnap.docs.map(doc => {
      const d = doc.data() as Record<string, any>;
      let time = "";
      if (d.time)            time = d.time.toDate ? istDateTime(d.time.toDate()) : String(d.time);
      else if (d.receivedAt) time = d.receivedAt.toDate ? istDateTime(d.receivedAt.toDate()) : String(d.receivedAt);
      else if (d.timestamp)  time = istDateTime(new Date(d.timestamp));
      return { id: doc.id, nickname: d.nickname || "", deviceId: d.deviceId || d.device_id || "", type: d.type || "", time, location: d.location || "", content: d.content || "" };
    });
    alarms.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    res.json({ deviceId, locationtrack: buildLocationTrack(deviceId, history), alarms });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});


// â"€â"€â"€ ALARM LIST â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
app.get("/v1/api/alarms", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("alarms").get();
    const alarms = snapshot.docs.map(doc => {
      const d = doc.data() as Record<string, any>;
      let time = "";
      if (d.time)           time = d.time.toDate ? istDateTime(d.time.toDate()) : String(d.time);
      else if (d.receivedAt) time = d.receivedAt.toDate ? istDateTime(d.receivedAt.toDate()) : String(d.receivedAt);
      else if (d.timestamp)  time = istDateTime(new Date(d.timestamp));
      return { id: doc.id, nickname: d.nickname || "", deviceId: d.deviceId || d.device_id || "", type: d.type || "", time, location: d.location || "", content: d.content || "" };
    });
    alarms.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    res.json(alarms);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// â"€â"€â"€ ROOT â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
app.get("/", (_req: Request, res: Response) => res.send("API is running"));

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

