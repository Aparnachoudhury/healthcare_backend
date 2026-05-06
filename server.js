import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.raw({ type: "*/*" }));

const OK = Buffer.from([0x00]);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.post("/4g/pb/upload", (req, res) => {
  console.log("📡 Health data received");
  console.log("Headers:", req.headers);
  console.log("Raw Data:", req.body);
  res.status(200).send(OK);
});

app.post("/4g/alarm/upload", (req, res) => {
  console.log("⏰ Alarm data received");
  console.log(req.body);
  res.status(200).send(OK);
});

app.post("/4g/call_log/upload", (req, res) => {
  console.log("📞 Call/SOS data received");
  console.log(req.body);
  res.status(200).send(OK);
});

app.post("/4g/deviceinfo/upload", (req, res) => {
  console.log("⌚ Device info received");
  console.log(req.body);
  res.status(200).send(OK);
});

app.post("/4g/status/notify", (req, res) => {
  console.log("📶 Device status notification");
  console.log(req.body);
  res.status(200).send(OK);
});

app.post("/4g/health/sleep", (req, res) => {
  console.log("😴 Sleep data received");
  console.log(req.body);
  res.status(200).send(OK);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});