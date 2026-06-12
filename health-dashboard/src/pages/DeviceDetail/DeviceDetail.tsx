import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getVitals, getWellness, getDiagnostics, getSafety, getDeviceInfo } from "../../api/api";
import type { VitalsData, WellnessData, DiagnosticsData, SafetyData } from "../../types";
import Overview from "./Overview";
import HeartRate from "./HeartRate";
import Sleep from "./Sleep";
import BloodPressure from "./BloodPressure";
import BloodOxygen from "./BloodOxygen";
import BodyTemp from "./BodyTemp";
import HeartHealth from "./HeartHealth";
import ECG from "./ECG";
import PressureValue from "./PressureValue";
import LocationTrack from "./LocationTrack";
import BloodSugar from "./BloodSugar";
import BloodKetone from "./BloodKetone";
import UricAcid from "./UricAcid";

const tabs = ["Overview","Exercise","Heart Rate","Sleep","Blood Pressure","Blood Oxygen","Body Temperature","Heart Health","ECG"];
const moreTabs = ["Pressure Value","Location Track","blood sugar","Blood Ketone","Uric Acid"];

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showMore,  setShowMore]  = useState(false);

  const [vitals,      setVitals]      = useState<VitalsData | null>(null);
  const [wellness,    setWellness]    = useState<WellnessData | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [safety,      setSafety]      = useState<SafetyData | null>(null);
  const [deviceInfo,  setDeviceInfo]  = useState<Record<string, any> | null>(null);

  const loadData = useCallback(() => {
    if (!id) return;
    Promise.all([
      getVitals(id),
      getWellness(id),
      getDiagnostics(id),
      getSafety(id),
      getDeviceInfo(id),
    ]).then(([v, w, d, s, info]) => {
      setVitals(v);
      setWellness(w);
      setDiagnostics(d);
      setSafety(s);
      setDeviceInfo(info);
    }).catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30_000);
    return () => clearInterval(timer);
  }, [loadData]);

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "Overview":          return <Overview      data={wellness?.overview} />;
      case "Exercise":          return <Overview      data={wellness?.overview} />;
      case "Heart Rate":        return <HeartRate     data={vitals?.heartrate} />;
      case "Sleep":             return <Sleep         data={wellness?.sleep} />;
      case "Blood Pressure":    return <BloodPressure data={vitals?.bloodpressure} />;
      case "Blood Oxygen":      return <BloodOxygen   data={vitals?.bloodoxygen} />;
      case "Body Temperature":  return <BodyTemp      data={vitals?.bodytemp} />;
      case "Heart Health":      return <HeartHealth   data={wellness?.hearthealth} />;
      case "ECG":               return <ECG           data={diagnostics?.ecg} />;
      case "Pressure Value":    return <PressureValue data={wellness?.pressure} />;
      case "Location Track":    return <LocationTrack data={safety?.locationtrack} />;
      case "blood sugar":       return <BloodSugar />;
      case "Blood Ketone":      return <BloodKetone />;
      case "Uric Acid":         return <UricAcid />;
      default:                  return null;
    }
  }, [activeTab, vitals, wellness, diagnostics, safety]);

  return (
    <div className="device-detail-layout" style={{ display: "flex", gap: "20px" }}>
      <div className="device-detail-sidebar" style={{ width: "220px", flexShrink: 0 }}>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>4866</div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 2 }}>
            <div>Height: 172cm</div><div>Weight: 88KG</div><div>Birthday: 1978-12-12</div>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "12px" }}>
          <div style={{ fontWeight: 600, marginBottom: "6px", color: "#1a6ef5" }}>■ Emergency person</div>
          <div style={{ color: "var(--text-muted)" }}>alkey: 7643697877</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
          <div style={{ fontWeight: 600, marginBottom: "6px", color: "#1a6ef5" }}>■ Device Information</div>
          <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Device ID: {id}</div>
          {deviceInfo ? (
            <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              <div>Model: {deviceInfo.model ?? "N/A"}</div>
              <div>Battery: {deviceInfo.battery != null ? `${deviceInfo.battery}%` : "N/A"}</div>
              <div>Signal: {deviceInfo.signal ?? "N/A"}</div>
              <div>Network: {deviceInfo.networkType ?? "N/A"}</div>
              <div>Firmware: {deviceInfo.firmwareVersion ?? "N/A"}</div>
              <div>Last Seen: {deviceInfo.lastSeen || "N/A"}</div>
            </div>
          ) : (
            <div style={{ color: "#52c41a", fontSize: "11px" }}>● Online · 2 #s</div>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ position: "relative" }}>
          <div className="tab-bar" style={{ display: "flex", gap: "4px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setShowMore(false); }}
                style={{ padding: "6px 14px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", background: activeTab === tab ? "var(--accent-blue)" : "#f0f0f0", color: activeTab === tab ? "#fff" : "var(--text-muted)" }}>
                {tab}
              </button>
            ))}
            <button onClick={() => setShowMore(!showMore)}
              style={{ padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", background: moreTabs.includes(activeTab) ? "var(--accent-blue)" : "#f0f0f0", color: moreTabs.includes(activeTab) ? "#fff" : "var(--text-muted)" }}>
              ···
            </button>
          </div>
          {showMore && (
            <div style={{ position: "absolute", top: "40px", right: 0, background: "#fff", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "160px" }}>
              {moreTabs.map(tab => (
                <div key={tab} onClick={() => { setActiveTab(tab); setShowMore(false); }}
                  style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: activeTab === tab ? "var(--accent-blue)" : "var(--text-primary)", background: activeTab === tab ? "#f0f7ff" : "transparent" }}>
                  {tab}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px" }}>
          {tabContent}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;
