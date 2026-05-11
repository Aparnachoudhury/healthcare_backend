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
import { getBodyTemp } from '../../api/api';

const BodyTemp = () => {

  // device id from URL
  const { id } = useParams();

  // body temperature data
  const [data, setData] = useState(null);

  // loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getBodyTemp(id)
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
    return <div>No body temperature data available</div>;
  }

  return (
    <div>

      <h3
        style={{
          marginBottom: '16px',
          fontSize: '15px'
        }}
      >
        🌡 Body Temperature

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

      {/* Body Temperature Chart */}

      <ResponsiveContainer width="100%" height={220}>

        <LineChart data={data.series}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            interval={3}
          />

          <YAxis
            domain={[35, 39]}
            tick={{ fontSize: 11 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#fa8c16"
            dot={false}
            strokeWidth={2}
          />

        </LineChart>

      </ResponsiveContainer>

      {/* Statistics */}

      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '16px'
        }}
      >

        {[
          {
            label: 'Average temperature',
            value: `${data.average}°C`
          },
          {
            label: 'Maximum temperature',
            value: `${data.max}°C`
          },
          {
            label: 'Minimum temperature',
            value: `${data.min}°C`
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
                color: '#fa8c16'
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

        <strong>Body temperature warning records</strong>

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
              {record.value}°C

            </div>

          ))

        )}

      </div>

    </div>
  );
};

export default BodyTemp;