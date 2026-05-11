import { useEffect, useState } from 'react';
import { getAlarms } from '../api/api';

const AlarmList = () => {

  const [alarms, setAlarms] = useState([]);

  useEffect(() => {

    getAlarms()
      .then((data) => {
        setAlarms(data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px' }}>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>

        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>

            {[
              'Serial number',
              'Nickname',
              'Device ID',
              'Alarm type',
              'Alarm time',
              'Geographic location',
              'Alarm content',
              'Device homepage'
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {h}
              </th>
            ))}

          </tr>
        </thead>

        <tbody>

          {alarms.map((a, i) => (

            <tr
              key={a.id}
              style={{ borderBottom: '1px solid var(--border)' }}
            >

              <td style={{ padding: '12px' }}>
                {i + 1}
              </td>

              <td style={{ padding: '12px' }}>
                {a.nickname}
              </td>

              <td style={{ padding: '12px' }}>
                {a.deviceId}
              </td>

              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    background:
                      a.type === 'Sleep'
                        ? '#e6f7ff'
                        : '#fff7e6',

                    color:
                      a.type === 'Sleep'
                        ? '#1890ff'
                        : '#fa8c16',

                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {a.type}
                </span>
              </td>

              <td style={{ padding: '12px' }}>
                {a.time}
              </td>

              <td style={{ padding: '12px' }}>
                {a.location}
              </td>

              <td
                style={{
                  padding: '12px',
                  color: 'var(--text-muted)'
                }}
              >
                {a.content}
              </td>

              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    color: 'var(--accent-blue)',
                    cursor: 'pointer'
                  }}
                >
                  Enter
                </span>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default AlarmList;