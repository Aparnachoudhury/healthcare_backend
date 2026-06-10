import { useState, ReactElement } from "react";
import { useParams } from "react-router-dom";
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

const tabComponents: Record<string, ReactElement> = {
  "Overview":          <Overview />,
  "Exercise":          <Overview />,
  "Heart Rate":        <HeartRate />,
  "Sleep":             <Sleep />,
  "Blood Pressure":    <BloodPressure />,
  "Blood Oxygen":      <BloodOxygen />,
  "Body Temperature":  <BodyTemp />,
  "Heart Health":      <HeartHealth />,
  "ECG":               <ECG />,
  "Pressure Value":    <PressureValue />,
  "Location Track":    <LocationTrack />,
  "blood sugar":       <BloodSugar />,
  "Blood Ketone":      <BloodKetone />,
  "Uric Acid":         <UricAcid />,
};

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showMore,  setShowMore]  = useState(false);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ width: "220px", flexShrink: 0 }}>
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
          <div style={{ color: "#52c41a", fontSize: "11px" }}>● Online · 2 #s</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
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
          {tabComponents[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;
