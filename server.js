import express from "express";
import cors from "cors";
import db from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.raw({ type: "*/*" }));

// ─── SYNTHETIC DATA GENERATORS ───────────────────────────

const devices = [
  { id: 1, nickname: "Ayen",   model: "H102CSH", deviceId: "863758060992848", status: "Online",  phone: "",                    updateTime: "2026-05-11 00:00:00" },
  { id: 2, nickname: "Bruni",  model: "H102CSH", deviceId: "861045080003026", status: "Online",  phone: "",                    updateTime: "2026-05-11 00:00:00" },
  { id: 3, nickname: "Wolli",  model: "H102CSH", deviceId: "861045080059689", status: "Online",  phone: "",                    updateTime: "2026-05-11 00:00:00" },
  { id: 4, nickname: "Mama",   model: "H102CSH", deviceId: "863957077864525", status: "Offline", phone: "",                    updateTime: "2026-05-11 00:00:00" },
  { id: 5, nickname: "Mutter", model: "BP100CH", deviceId: "861045080041505", status: "Online",  phone: "3470444962@qq.com",   updateTime: "2026-05-11 00:00:00" },
];

function generateTimeSeries(baseValue, variance, hours = 24) {
  return Array.from({ length: hours }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    value: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
  }));
}

function generateDeviceStats(deviceId) {
  return {
    deviceId,
    steps: Math.floor(Math.random() * 8000) + 1000,
    heartRate: Math.floor(Math.random() * 20) + 65,
    bloodOxygen: Math.floor(Math.random() * 4) + 96,
    bodyTemp: parseFloat((36.2 + Math.random() * 1.2).toFixed(1)),
  };
}

// ─── WATCH UPLOAD ENDPOINTS ───────────────────────────────
// These MUST return a single raw 0x00 byte — nothing else.
// The iwown test tool checks for exactly this response.

function sendWatchAck(res) {
  const buf = Buffer.from([0x00]);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", 1);
  res.end(buf);
}

app.post("/4g/pb/upload", async (req, res) => {
   console.log("🩺 Health data received");

   await db.collection("healthData").add(req.body);

   sendWatchAck(res);
});
app.post("/4g/alarm/upload",      (req, res) => { console.log("⏰ Alarm data received");     sendWatchAck(res); });
app.post("/4g/call_log/upload",   (req, res) => { console.log("📞 Call/SOS data received"); sendWatchAck(res); });
app.post("/4g/deviceinfo/upload", (req, res) => { console.log("⌚ Device info received");   sendWatchAck(res); });
app.post("/4g/status/notify",     (req, res) => { console.log("📶 Status notification");    sendWatchAck(res); });
app.post("/4g/health/sleep",      (req, res) => { console.log("😴 Sleep data received");    sendWatchAck(res); });

// ─── HEALTH DATA ─────────────────────────────────────────

app.get("/api/health-data", (req, res) => {
  const data = devices.map((d) => ({
    ...d,
    ...generateDeviceStats(d.deviceId),
  }));
  res.json(data);
});

// ─── DEVICE DETAIL TABS ──────────────────────────────────

app.get("/api/device/:deviceId/overview", (req, res) => {
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    steps: Math.floor(Math.random() * 8000) + 1000,
    heartRate: Math.floor(Math.random() * 20) + 65,
    bloodOxygen: Math.floor(Math.random() * 4) + 96,
    bodyTemp: parseFloat((36.2 + Math.random() * 1.2).toFixed(1)),
    sleepHours: parseFloat((5 + Math.random() * 3).toFixed(1)),
    bloodPressure: { systolic: Math.floor(Math.random() * 20) + 110, diastolic: Math.floor(Math.random() * 15) + 70 },
  });
});

app.get("/api/device/:deviceId/heartrate", (req, res) => {
  const series = generateTimeSeries(72, 20);
  const values = series.map((s) => s.value);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series,
    average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    max: Math.max(...values),
    min: Math.min(...values),
    warningThreshold: 110,
    warningRecords: series.filter((s) => s.value > 100).map((s) => ({ time: s.time, value: s.value, type: "High" })),
  });
});

app.get("/api/device/:deviceId/sleep", (req, res) => {
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    totalMinutes: Math.floor(Math.random() * 120) + 360,
    series: Array.from({ length: 8 }, (_, i) => ({
      time: `${22 + i}:00`,
      stage: Math.floor(Math.random() * 3),
    })),
    deepSleepMinutes: Math.floor(Math.random() * 90) + 60,
    lightSleepMinutes: Math.floor(Math.random() * 120) + 180,
    awakeTimes: Math.floor(Math.random() * 4),
    sleepScore: Math.floor(Math.random() * 30) + 70,
  });
});

app.get("/api/device/:deviceId/bloodpressure", (req, res) => {
  const systolicSeries = generateTimeSeries(120, 15);
  const diastolicSeries = generateTimeSeries(80, 10);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series: systolicSeries.map((s, i) => ({
      time: s.time,
      systolic: s.value,
      diastolic: diastolicSeries[i].value,
    })),
    avgSystolic: 118,
    avgDiastolic: 76,
    warningRecords: [],
  });
});

app.get("/api/device/:deviceId/bloodoxygen", (req, res) => {
  const series = generateTimeSeries(97, 3);
  const values = series.map((s) => s.value);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series,
    average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    max: Math.max(...values),
    min: Math.min(...values),
    warningRate: "5%",
    warningRecords: series.filter((s) => s.value < 95),
  });
});

app.get("/api/device/:deviceId/bodytemp", (req, res) => {
  const series = generateTimeSeries(36.5, 0.8);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series,
    average: 36.5,
    max: Math.max(...series.map((s) => s.value)),
    min: Math.min(...series.map((s) => s.value)),
    warningRecords: series.filter((s) => s.value > 37.5),
  });
});

app.get("/api/device/:deviceId/hearthealth", (req, res) => {
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    diagnosis: "There is no abnormality in the data normally.",
    afibRisk: "Low",
    hrvScore: Math.floor(Math.random() * 30) + 60,
    series: generateTimeSeries(65, 10),
  });
});

app.get("/api/device/:deviceId/ecg", (req, res) => {
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    records: [],
    aiResult: "Normal sinus rhythm detected.",
  });
});

app.get("/api/device/:deviceId/pressure", (req, res) => {
  const series = generateTimeSeries(35, 20);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series,
    average: Math.round(series.reduce((a, b) => a + b.value, 0) / series.length),
    level: "Normal",
  });
});

app.get("/api/device/:deviceId/bloodsugar", (req, res) => {
  const series = generateTimeSeries(5.5, 1.5);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series,
    average: 5.4,
    max: Math.max(...series.map((s) => s.value)),
    min: Math.min(...series.map((s) => s.value)),
    unit: "mmol/L",
  });
});

app.get("/api/device/:deviceId/bloodketone", (req, res) => {
  const series = generateTimeSeries(0.2, 0.15);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series,
    average: 0.2,
    unit: "mmol/L",
    normalRange: "0.0~0.3mmol/L",
  });
});

app.get("/api/device/:deviceId/uricacid", (req, res) => {
  const series = generateTimeSeries(320, 80);
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    series,
    average: Math.round(series.reduce((a, b) => a + b.value, 0) / series.length),
    unit: "μmol/L",
    maleStandard: "<420μmol/L",
    femaleStandard: "<360μmol/L",
  });
});

app.get("/api/device/:deviceId/locationtrack", (req, res) => {
  res.json({
    deviceId: req.params.deviceId,
    date: "2026-05-11",
    tracks: [],
    lastLocation: null,
  });
});

// ─── ALARM LIST ───────────────────────────────────────────

app.get("/api/alarms", (req, res) => {
  res.json([
    { id: 1,  nickname: "Ayen",        deviceId: "863758060992848", type: "Not worn",          time: "2026-05-11 10:46:00", location: "", content: "The watch has detected that it is not worn." },
    { id: 2,  nickname: "",            deviceId: "863758060992848", type: "Not worn",          time: "2026-05-11 09:55:59", location: "", content: "The watch has detected that it is not worn." },
    { id: 3,  nickname: "",            deviceId: "863758060992848", type: "Not worn",          time: "2026-05-11 08:16:01", location: "", content: "The watch has detected that it is not worn." },
    { id: 4,  nickname: "Bruni",       deviceId: "861045080003026", type: "Not worn",          time: "2026-05-11 07:30:01", location: "", content: "The watch has detected that it is not worn." },
    { id: 5,  nickname: "Wolli",       deviceId: "861045080059689", type: "Sleep",             time: "2026-05-11 06:53:00", location: "", content: "The watch has entered the sleep mode." },
    { id: 6,  nickname: "",            deviceId: "861045080003026", type: "Not worn",          time: "2026-05-11 06:50:01", location: "", content: "The watch has detected that it is not worn." },
    { id: 7,  nickname: "Mama",        deviceId: "863957077864525", type: "Not worn",          time: "2026-05-11 06:28:01", location: "", content: "The watch has detected that it is not worn." },
    { id: 8,  nickname: "Mutter",      deviceId: "861045080041505", type: "Sleep",             time: "2026-05-11 06:27:00", location: "", content: "The watch has entered the sleep mode." },
    { id: 9,  nickname: "Reloj Ángel", deviceId: "862688076415040", type: "Sleep",             time: "2026-05-11 06:26:00", location: "", content: "The watch has entered the sleep mode." },
    { id: 10, nickname: "",            deviceId: "862688076415040", type: "Heart rate warning", time: "2026-05-11 06:11:00", location: "", content: "The watch has detected a heart rate warning." },
  ]);
});

// ─── ROOT ─────────────────────────────────────────────────

app.get("/", (req, res) => res.send("API is running 🚀"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));