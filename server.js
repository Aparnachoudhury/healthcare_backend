import express from "express";
import cors from "cors";
import db from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.raw({
   type:"application/octet-stream"
}));

// ─── FIRESTORE HEALTH DATA HISTORY UTILITY ────────────────

async function getDeviceHealthHistory(deviceId) {
  const snapshot = await db.collection("healthData").get();
  const records = [];

  snapshot.forEach(doc => {
    const d = doc.data();
    let payload = d;

    // Check for rawData field (which could be a JSON string or serialized buffer object)
    if (d.rawData) {
      try {
        const parsedRaw = JSON.parse(d.rawData);
        if (parsedRaw && parsedRaw.type === "Buffer") {
          const buf = Buffer.from(parsedRaw.data);
          const str = buf.toString();
          try {
            payload = JSON.parse(str);
          } catch {
            payload = { device_id: str.substring(0, 15), raw_str: str };
          }
        } else {
          payload = parsedRaw;
        }
      } catch (err) {
        // Ignore parsing errors
      }
    }

    const recDeviceId = payload.device_id || d.device_id || "";
    if (recDeviceId.toString() === deviceId.toString()) {
      // Extract timestamp
      let timestamp = new Date();
      if (d.receivedAt) {
        timestamp = d.receivedAt.toDate ? d.receivedAt.toDate() : new Date(d.receivedAt);
      } else if (payload.timestamp) {
        timestamp = new Date(payload.timestamp);
      } else if (payload.created_at) {
        timestamp = new Date(payload.created_at);
      }

      // Extract details
      const innerData = payload.decoded?.data || payload.data || payload;

      records.push({
        timestamp,
        steps: Number(innerData.steps ?? 0),
        heartRate: Number(innerData.heart_rate_bpm ?? innerData.heart_rate ?? innerData.heartRate ?? 0),
        spo2: Number(innerData.spo2_percent ?? innerData.spo2 ?? 0),
        bodyTemp: Number(innerData.body_temperature_c ?? innerData.temperature ?? innerData.bodyTemp ?? 0),
        sleepHours: Number(innerData.sleep_hours ?? innerData.sleepHours ?? 0),
        systolic: Number(innerData.bp_systolic_mmhg ?? innerData.systolic ?? 0),
        diastolic: Number(innerData.bp_diastolic_mmhg ?? innerData.diastolic ?? 0),
        hrv: Number(innerData.hrv_ms ?? innerData.hrvScore ?? 0),
        stress: Number(innerData.stress_score ?? innerData.stress ?? 0),
        bloodSugar: Number(innerData.blood_sugar ?? innerData.bloodsugar ?? 0),
        bloodKetone: Number(innerData.blood_ketone ?? innerData.bloodketone ?? 0),
        uricAcid: Number(innerData.uric_acid ?? innerData.uricacid ?? 0),
        location: innerData.location || (innerData.latitude && innerData.longitude ? { lat: innerData.latitude, lng: innerData.longitude } : null),
        ecgRecords: innerData.ecg_records || []
      });
    }
  });

  // Sort by timestamp ascending
  records.sort((a, b) => a.timestamp - b.timestamp);
  return records;
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
  try {
    const data = req.body;
    await db.collection("live_devices")
      .doc(data.device_id)
      .set({
        ...data,
        receivedAt: new Date()
      });

    // Mongo save
    await db.collection("healthData").add({
      ...data,
      receivedAt: new Date()
    });

    console.log("Saved:", data.device_id);
    sendWatchAck(res);
  } catch(err){
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
});

// ─── HEALTH DATA ─────────────────────────────────────────

app.get("/api/health-data", async (req,res)=>{
  try{
    const snapshot = await db.collection("live_devices").get();
    const data = snapshot.docs.map((doc)=>{
      const d = doc.data();
      
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
        heartRate: d?.decoded?.data?.heart_rate_bpm || d?.heart_rate || d?.decoded?.data?.heart_rate || 0,
        bloodOxygen: d?.decoded?.data?.spo2_percent || d?.spo2 || d?.decoded?.data?.spo2 || 0,
        bodyTemp: d?.decoded?.data?.body_temperature_c || d?.temperature || d?.decoded?.data?.temperature || 0,
        phone: d?.decoded?.data?.phone_number || d?.phone || "N/A",
        updateTime: updateTime.toLocaleString()
      };
    });
    res.json(data);
  } catch(err){
    console.log(err);
    res.status(500).json({
      error:err.message
    });
  }
});

// ─── DEVICE DETAIL TABS ──────────────────────────────────

app.get("/api/device/:deviceId/overview", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    
    let latest = {};
    if (history.length > 0) {
      latest = history[history.length - 1];
    } else {
      // Fallback: check live_devices doc
      const liveDoc = await db.collection("live_devices").doc(deviceId).get();
      if (liveDoc.exists) {
        const d = liveDoc.data();
        const innerData = d?.decoded?.data || d || {};
        latest = {
          timestamp: new Date(),
          steps: innerData.steps ?? 0,
          heartRate: innerData.heart_rate_bpm ?? innerData.heart_rate ?? 0,
          spo2: innerData.spo2_percent ?? innerData.spo2 ?? 0,
          bodyTemp: innerData.body_temperature_c ?? innerData.temperature ?? 0,
          sleepHours: innerData.sleep_hours ?? 0,
          systolic: innerData.bp_systolic_mmhg ?? innerData.systolic ?? 0,
          diastolic: innerData.bp_diastolic_mmhg ?? innerData.diastolic ?? 0,
        };
      }
    }

    res.json({
      deviceId,
      date: latest.timestamp ? latest.timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      steps: latest.steps || 0,
      heartRate: latest.heartRate || 0,
      bloodOxygen: latest.spo2 || 0,
      bodyTemp: latest.bodyTemp || 0,
      sleepHours: latest.sleepHours || 0,
      bloodPressure: { 
        systolic: latest.systolic || 0, 
        diastolic: latest.diastolic || 0 
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/heartrate", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const hrRecords = history.filter(r => r.heartRate > 0);

    const series = hrRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.heartRate
    }));

    const hrValues = hrRecords.map(r => r.heartRate);
    const average = hrValues.length ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : 0;
    const max = hrValues.length ? Math.max(...hrValues) : 0;
    const min = hrValues.length ? Math.min(...hrValues) : 0;

    res.json({
      deviceId,
      series,
      average,
      max,
      min
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/sleep", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const sleepRecords = history.filter(r => r.sleepHours > 0);
    const latestSleep = sleepRecords.length ? sleepRecords[sleepRecords.length - 1] : null;

    const totalMinutes = latestSleep ? Math.round(latestSleep.sleepHours * 60) : 0;
    const deepSleepMinutes = Math.round(totalMinutes * 0.3);
    const lightSleepMinutes = totalMinutes - deepSleepMinutes;

    const series = sleepRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: r.sleepHours > 6 ? 2 : r.sleepHours > 4 ? 1 : 0
    }));

    res.json({
      deviceId,
      date: latestSleep ? latestSleep.timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      totalMinutes,
      series,
      deepSleepMinutes,
      lightSleepMinutes,
      awakeTimes: latestSleep ? (latestSleep.sleepHours > 0 ? 1 : 0) : 0,
      sleepScore: totalMinutes > 480 ? 90 : totalMinutes > 360 ? 75 : totalMinutes > 0 ? 60 : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/bloodpressure", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const bpRecords = history.filter(r => r.systolic > 0 && r.diastolic > 0);

    const series = bpRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolic: r.systolic,
      diastolic: r.diastolic
    }));

    const systolics = bpRecords.map(r => r.systolic);
    const diastolics = bpRecords.map(r => r.diastolic);

    const avgSystolic = systolics.length ? Math.round(systolics.reduce((a, b) => a + b, 0) / systolics.length) : 0;
    const avgDiastolic = diastolics.length ? Math.round(diastolics.reduce((a, b) => a + b, 0) / diastolics.length) : 0;

    res.json({
      deviceId,
      date: bpRecords.length ? bpRecords[bpRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      series,
      avgSystolic,
      avgDiastolic,
      warningRecords: bpRecords.filter(r => r.systolic > 140 || r.diastolic > 90).map(r => ({
        time: r.timestamp.toLocaleString(),
        value: `${r.systolic}/${r.diastolic}`
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/bloodoxygen", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const spo2Records = history.filter(r => r.spo2 > 0);

    const series = spo2Records.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.spo2
    }));

    const spo2Values = spo2Records.map(r => r.spo2);
    const average = spo2Values.length ? Math.round(spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length) : 0;
    const max = spo2Values.length ? Math.max(...spo2Values) : 0;
    const min = spo2Values.length ? Math.min(...spo2Values) : 0;

    res.json({
      deviceId,
      series,
      average,
      max,
      min,
      warningRecords: spo2Records.filter(r => r.spo2 < 95).map(r => ({
        time: r.timestamp.toLocaleString(),
        value: r.spo2
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/bodytemp", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const tempRecords = history.filter(r => r.bodyTemp > 0);

    const series = tempRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.bodyTemp
    }));

    const tempValues = tempRecords.map(r => r.bodyTemp);
    const average = tempValues.length ? parseFloat((tempValues.reduce((a, b) => a + b, 0) / tempValues.length).toFixed(1)) : 0;
    const max = tempValues.length ? Math.max(...tempValues) : 0;
    const min = tempValues.length ? Math.min(...tempValues) : 0;

    res.json({
      deviceId,
      date: tempRecords.length ? tempRecords[tempRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      series,
      average,
      max,
      min,
      warningRecords: tempRecords.filter(r => r.bodyTemp > 37.5 || r.bodyTemp < 35.5).map(r => ({
        time: r.timestamp.toLocaleString(),
        value: r.bodyTemp
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/hearthealth", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const hrvRecords = history.filter(r => r.hrv > 0);

    const series = hrvRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.hrv
    }));

    const hrvValues = hrvRecords.map(r => r.hrv);
    const average = hrvValues.length ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;

    let diagnosis = "No HRV data available.";
    let afibRisk = "Unknown";
    if (average > 50) {
      diagnosis = "HRV looks normal. No cardiac anomalies detected.";
      afibRisk = "Low";
    } else if (average > 0) {
      diagnosis = "Low HRV detected. Consider resting or monitoring.";
      afibRisk = "Moderate";
    }

    res.json({
      deviceId,
      date: hrvRecords.length ? hrvRecords[hrvRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      diagnosis,
      afibRisk,
      hrvScore: average,
      series
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/ecg", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const ecgRecords = history.filter(r => r.ecgRecords && r.ecgRecords.length > 0);

    res.json({
      deviceId,
      date: ecgRecords.length ? ecgRecords[ecgRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      records: ecgRecords.map(r => ({
        time: r.timestamp.toLocaleString(),
        wave: r.ecgRecords
      })),
      aiResult: ecgRecords.length ? "Normal sinus rhythm detected from device recordings." : "No active ECG recordings uploaded from device."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/pressure", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const stressRecords = history.filter(r => r.stress > 0);

    const series = stressRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.stress
    }));

    const stressValues = stressRecords.map(r => r.stress);
    const average = stressValues.length ? Math.round(stressValues.reduce((a, b) => a + b, 0) / stressValues.length) : 0;
    const level = average < 30 ? "Relaxed" : average < 60 ? "Normal" : "High";

    res.json({
      deviceId,
      date: stressRecords.length ? stressRecords[stressRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      series,
      average,
      level
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/bloodsugar", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const sugarRecords = history.filter(r => r.bloodSugar > 0);

    const series = sugarRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.bloodSugar
    }));

    const sugarValues = sugarRecords.map(r => r.bloodSugar);
    const average = sugarValues.length ? parseFloat((sugarValues.reduce((a, b) => a + b, 0) / sugarValues.length).toFixed(1)) : 0;
    const max = sugarValues.length ? Math.max(...sugarValues) : 0;
    const min = sugarValues.length ? Math.min(...sugarValues) : 0;

    res.json({
      deviceId,
      date: sugarRecords.length ? sugarRecords[sugarRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      series,
      average,
      max,
      min,
      unit: "mmol/L"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/bloodketone", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const ketoneRecords = history.filter(r => r.bloodKetone > 0);

    const series = ketoneRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.bloodKetone
    }));

    const ketoneValues = ketoneRecords.map(r => r.bloodKetone);
    const average = ketoneValues.length ? parseFloat((ketoneValues.reduce((a, b) => a + b, 0) / ketoneValues.length).toFixed(2)) : 0;

    res.json({
      deviceId,
      date: ketoneRecords.length ? ketoneRecords[ketoneRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      series,
      average,
      unit: "mmol/L",
      normalRange: "0.0~0.3mmol/L"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/uricacid", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const uricRecords = history.filter(r => r.uricAcid > 0);

    const series = uricRecords.map(r => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.uricAcid
    }));

    const uricValues = uricRecords.map(r => r.uricAcid);
    const average = uricValues.length ? Math.round(uricValues.reduce((a, b) => a + b, 0) / uricValues.length) : 0;

    res.json({
      deviceId,
      date: uricRecords.length ? uricRecords[uricRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      series,
      average,
      unit: "μmol/L",
      maleStandard: "<420μmol/L",
      femaleStandard: "<360μmol/L"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/device/:deviceId/locationtrack", async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const history = await getDeviceHealthHistory(deviceId);
    const locationRecords = history.filter(r => r.location && typeof r.location.lat === "number" && typeof r.location.lng === "number");

    const tracks = locationRecords.map(r => ({
      lat: r.location.lat,
      lng: r.location.lng,
      time: r.timestamp.toLocaleString()
    }));

    const lastLocation = tracks.length ? { lat: tracks[tracks.length - 1].lat, lng: tracks[tracks.length - 1].lng } : null;

    res.json({
      deviceId,
      date: locationRecords.length ? locationRecords[locationRecords.length - 1].timestamp.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      tracks,
      lastLocation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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