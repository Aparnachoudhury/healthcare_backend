import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props { children: ReactNode; }

const DashboardLayout = ({ children }: Props) => (
  <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
    <Sidebar />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
      <Topbar />
      <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg-main)" }}>
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;
