function DashboardHome() {
  const devices = [
    {
      id: 1,
      nickname: "4866",
      model: "H102CSH",
      deviceId: "860132064436520",
      status: "Online",
      heartRate: 72,
      oxygen: 98,
      temperature: 36.5,
    },
    {
      id: 2,
      nickname: "4138",
      model: "H102CSH",
      deviceId: "860132064443112",
      status: "Online",
      heartRate: 75,
      oxygen: 97,
      temperature: 36.7,
    },
    {
      id: 3,
      nickname: "8453",
      model: "BP100CH",
      deviceId: "860132064443070",
      status: "Offline",
      heartRate: 0,
      oxygen: 0,
      temperature: 0,
    },
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1>Health Device Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <input placeholder="Device ID" />
        <input placeholder="Nickname" />
        <button>Search</button>
      </div>

      <table
        border="1"
        cellPadding="15"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        <thead>
          <tr>
            <th>Serial</th>
            <th>Nickname</th>
            <th>Model</th>
            <th>Device ID</th>
            <th>Status</th>
            <th>Heart Rate</th>
            <th>Oxygen</th>
            <th>Temperature</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{device.nickname}</td>
              <td>{device.model}</td>
              <td>{device.deviceId}</td>

              <td
                style={{
                  color:
                    device.status === "Online" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {device.status}
              </td>

              <td>{device.heartRate}</td>
              <td>{device.oxygen}%</td>
              <td>{device.temperature}°C</td>

              <td>
                <button>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardHome;