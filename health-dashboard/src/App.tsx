import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Healthdata from "./pages/Healthdata";
import AlarmList from "./pages/AlarmList";
import AlarmBigScreen from "./pages/AlarmBigScreen";
import DeviceDetail from "./pages/DeviceDetail/DeviceDetail";

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Healthdata />} />
          <Route path="/alarmlist" element={<AlarmList />} />
          <Route path="/alarmbigscreen" element={<AlarmBigScreen />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
