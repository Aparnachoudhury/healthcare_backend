import { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { useParams } from 'react-router-dom';
import { getBloodOxygen } from '../../api/api';

const BloodOxygen = () => {

  // device id from URL
  const { id } = useParams();

  // blood oxygen data
  const [data, setData] = useState(null);

  // loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getBloodOxygen(id)
      .then((response) => {

        setData(response);

        setLoading(false);

      })
      .catch((err) => {

        console.log(err);

        setLoading(false);

      });

  }, [id]);

  // loading UI
  if (loading) {
    return <div>Loading...</div>;
  }

  // no data UI
  if (!data) {
    return <div>No blood oxygen data available</div>;
  }

  return (
    <div>

      <h3
        style={{
          marginBottom: '16px',
          fontSize: '15px'
        }}
      >
        💧 Blood Oxygen

        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginLeft: '8px'
          }}
        >
          {data.date}
        </span>

      </h3>

      {/* Blood Oxygen Chart */}

      <ResponsiveContainer width="100%" height={220}>

        <LineChart data={data.series}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            interval={3}
          />

          <YAxis
            domain={[90, 100]}
            tick={{ fontSize: 11 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#1a6ef5"
            dot={false}
            strokeWidth={2}
          />

        </LineChart>

      </ResponsiveContainer>

      {/* Stats */}

      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '16px'
        }}
      >

        {[
          {
            label: 'Average oxygen needed',
            value: `${data.average}%`
          },
          {
            label: 'Maximum oxygen needed',
            value: `${data.max}%`
          },
          {
            label: 'Minimum oxygen needed',
            value: `${data.min}%`
          }
        ].map((item) => (

          <div
            key={item.label}
            style={{ textAlign: 'center' }}
          >

            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#1a6ef5'
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}
            >
              {item.label}
            </div>

          </div>

        ))}

      </div>

      {/* Warning Records */}

      <div
        style={{
          marginTop: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}
      >

        <strong>Blood oxygen warning records</strong>

        {data.warningRecords.length === 0 ? (

          <div style={{ marginTop: '6px' }}>
            No warning records
          </div>

        ) : (

          data.warningRecords.map((record, index) => (

            <div
              key={index}
              style={{ marginTop: '6px' }}
            >

              {record.time}
              {' - '}
              {record.value}%

            </div>

          ))

        )}

      </div>

    </div>
  );
};

export default BloodOxygen;