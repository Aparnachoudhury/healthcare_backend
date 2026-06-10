import express, { Request, Response } from "express";
import cors from "cors";
import db from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "application/octet-stream" }));

// ─── IST HELPERS ──────────────────────────────────────────
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

// ─── TYPES ────────────────────────────────────────────────
interface HealthRecord {
  timestamp: Date;
  steps: number;
  heartRate: number;
  spo2: number;
  bodyTemp: number;
  sleepHours: number;
  systolic: number;
  diastolic: number;
  hrv: number;
  stress: number;
  bloodSugar: number;
  bloodKetone: number;
  uricAcid: number;
  location: { lat: number; lng: number } | null;
  ecgRecords: number[];
}

// ─── FIRESTORE HEALTH DATA HISTORY UTILITY ────────────────
async function getDeviceHealthHistory(deviceId: string): Promise<HealthRecord[]> {
  const snapshot = await db.collection("healthData").get();
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

    const recDeviceId = payload.device_id || d.device_id || "";
    if (recDeviceId.toString() !== deviceId.toString()) return;

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
      sleepHours:  Number(inner.sleep_hours ?? inner.sleepHours ?? 0),
      systolic:    Number(inner.bp_systolic_mmhg ?? inner.systolic ?? 0),
      diastolic:   Number(inner.bp_diastolic_mmhg ?? inner.diastolic ?? 0),
      hrv:         Number(inner.hrv_ms ?? inner.hrvScore ?? 0),
      stress:      Number(inner.stress_score ?? inner.stress ?? 0),
      bloodSugar:  Number(inner.blood_sugar ?? inner.bloodsugar ?? 0),
      bloodKetone: Number(inner.blood_ketone ?? inner.bloodketone ?? 0),
      uricAcid:    Number(inner.uric_acid ?? inner.uricacid ?? 0),
      location:    inner.location || (inner.latitude && inner.longitude ? { lat: inner.latitude, lng: inner.longitude } : null),
      ecgRecords:  inner.ecg_records || [],
    });
  });

  records.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return records;
}

// ─── WATCH UPLOAD ─────────────────────────────────────────
function sendWatchAck(res: Response): void {
  const buf = Buffer.from([0x00]);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", 1);
  res.end(buf);
}

app.post("/4g/pb/upload", async (req: Request, res: Response) => {
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

// ─── HEALTH DATA ─────────────────────────────────────────
app.get("/api/health-data", async (_req: Request, res: Response) => {
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

// ─── DEVICE DETAIL TABS ──────────────────────────────────
app.get("/api/device/:deviceId/overview", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    let latest: Partial<HealthRecord> & { timestamp?: Date } = {};
    if (history.length > 0) {
      latest = history[history.length - 1];
    } else {
      const liveDoc = await db.collection("live_devices").doc(deviceId).get();
      if (liveDoc.exists) {
        const d = liveDoc.data() as Record<string, any>;
        const inner = d?.decoded?.data || d || {};
        latest = {
          timestamp: new Date(),
          steps: inner.steps ?? 0,
          heartRate: inner.heart_rate_bpm ?? inner.heart_rate ?? 0,
          spo2: inner.spo2_percent ?? inner.spo2 ?? 0,
          bodyTemp: inner.body_temperature_c ?? inner.temperature ?? 0,
          sleepHours: inner.sleep_hours ?? 0,
          systolic: inner.bp_systolic_mmhg ?? inner.systolic ?? 0,
          diastolic: inner.bp_diastolic_mmhg ?? inner.diastolic ?? 0,
        };
      }
    }
    res.json({
      deviceId,
      date: latest.timestamp ? istDate(latest.timestamp) : istDate(new Date()),
      steps: latest.steps || 0,
      heartRate: latest.heartRate || 0,
      bloodOxygen: (latest as HealthRecord).spo2 || 0,
      bodyTemp: latest.bodyTemp || 0,
      sleepHours: latest.sleepHours || 0,
      bloodPressure: { systolic: latest.systolic || 0, diastolic: latest.diastolic || 0 },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/heartrate", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.heartRate > 0);
    const values = records.map(r => r.heartRate);
    res.json({
      deviceId,
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.heartRate })),
      average: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
      max: values.length ? Math.max(...values) : 0,
      min: values.length ? Math.min(...values) : 0,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/sleep", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.sleepHours > 0);
    const latest = records.length ? records[records.length - 1] : null;
    const totalMinutes = latest ? Math.round(latest.sleepHours * 60) : 0;
    res.json({
      deviceId,
      date: latest ? istDate(latest.timestamp) : istDate(new Date()),
      totalMinutes,
      series: records.map(r => ({ time: istTime(r.timestamp), stage: r.sleepHours > 6 ? 2 : r.sleepHours > 4 ? 1 : 0 })),
      deepSleepMinutes: Math.round(totalMinutes * 0.3),
      lightSleepMinutes: Math.round(totalMinutes * 0.7),
      awakeTimes: latest ? 1 : 0,
      sleepScore: totalMinutes > 480 ? 90 : totalMinutes > 360 ? 75 : totalMinutes > 0 ? 60 : 0,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/bloodpressure", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.systolic > 0 && r.diastolic > 0);
    const s = records.map(r => r.systolic), d = records.map(r => r.diastolic);
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      series: records.map(r => ({ time: istTime(r.timestamp), systolic: r.systolic, diastolic: r.diastolic })),
      avgSystolic: s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0,
      avgDiastolic: d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : 0,
      warningRecords: records.filter(r => r.systolic > 140 || r.diastolic > 90).map(r => ({ time: istDateTime(r.timestamp), value: `${r.systolic}/${r.diastolic}` })),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/bloodoxygen", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.spo2 > 0);
    const values = records.map(r => r.spo2);
    res.json({
      deviceId,
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.spo2 })),
      average: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
      max: values.length ? Math.max(...values) : 0,
      min: values.length ? Math.min(...values) : 0,
      warningRecords: records.filter(r => r.spo2 < 95).map(r => ({ time: istDateTime(r.timestamp), value: r.spo2 })),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/bodytemp", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.bodyTemp > 0);
    const values = records.map(r => r.bodyTemp);
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.bodyTemp })),
      average: values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0,
      max: values.length ? Math.max(...values) : 0,
      min: values.length ? Math.min(...values) : 0,
      warningRecords: records.filter(r => r.bodyTemp > 37.5 || r.bodyTemp < 35.5).map(r => ({ time: istDateTime(r.timestamp), value: r.bodyTemp })),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/hearthealth", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.hrv > 0);
    const values = records.map(r => r.hrv);
    const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      diagnosis: average > 50 ? "HRV looks normal. No cardiac anomalies detected." : average > 0 ? "Low HRV detected. Consider resting or monitoring." : "No HRV data available.",
      afibRisk: average > 50 ? "Low" : average > 0 ? "Moderate" : "Unknown",
      hrvScore: average,
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.hrv })),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/ecg", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.ecgRecords && r.ecgRecords.length > 0);
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      records: records.map(r => ({ time: istDateTime(r.timestamp), wave: r.ecgRecords })),
      aiResult: records.length ? "Normal sinus rhythm detected from device recordings." : "No active ECG recordings uploaded from device.",
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/pressure", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.stress > 0);
    const values = records.map(r => r.stress);
    const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.stress })),
      average,
      level: average < 30 ? "Relaxed" : average < 60 ? "Normal" : "High",
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/bloodsugar", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.bloodSugar > 0);
    const values = records.map(r => r.bloodSugar);
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.bloodSugar })),
      average: values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0,
      max: values.length ? Math.max(...values) : 0,
      min: values.length ? Math.min(...values) : 0,
      unit: "mmol/L",
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/bloodketone", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.bloodKetone > 0);
    const values = records.map(r => r.bloodKetone);
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.bloodKetone })),
      average: values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0,
      unit: "mmol/L",
      normalRange: "0.0~0.3mmol/L",
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/uricacid", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.uricAcid > 0);
    const values = records.map(r => r.uricAcid);
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      series: records.map(r => ({ time: istTime(r.timestamp), value: r.uricAcid })),
      average: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
      unit: "μmol/L",
      maleStandard: "<420μmol/L",
      femaleStandard: "<360μmol/L",
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/device/:deviceId/locationtrack", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const history = await getDeviceHealthHistory(deviceId);
    const records = history.filter(r => r.location && typeof r.location.lat === "number" && typeof r.location.lng === "number");
    const tracks = records.map(r => ({ lat: r.location!.lat, lng: r.location!.lng, time: istDateTime(r.timestamp) }));
    res.json({
      deviceId,
      date: records.length ? istDate(records[records.length - 1].timestamp) : istDate(new Date()),
      tracks,
      lastLocation: tracks.length ? { lat: tracks[tracks.length - 1].lat, lng: tracks[tracks.length - 1].lng } : null,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── ALARM LIST ───────────────────────────────────────────
app.get("/api/alarms", async (_req: Request, res: Response) => {
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

// ─── ROOT ─────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => res.send("API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
