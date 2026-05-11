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
import { getBloodSugar } from '../../api/api';

const BloodSugar = () => {

  const { id } = useParams();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getBloodSugar(id)
      .then((response) => {

        setData(response);

        setLoading(false);

      })
      .catch((err) => {

        console.log(err);

        setLoading(false);

      });

  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No blood sugar data available</div>;
  }

  return (
    <div>

      <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>
        🩸 Blood Sugar

        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginLeft: '12px'
          }}
        >
          {data.date}
        </span>
      </h3>

      <ResponsiveContainer width="100%" height={220}>

        <LineChart data={data.series}>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            interval={3}
          />

          <YAxis tick={{ fontSize: 11 }} />

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

      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '16px'
        }}
      >

        {[
          {
            label: 'Average',
            value: `${data.average} ${data.unit}`
          },
          {
            label: 'Maximum',
            value: `${data.max} ${data.unit}`
          },
          {
            label: 'Minimum',
            value: `${data.min} ${data.unit}`
          }
        ].map((item) => (

          <div key={item.label} style={{ textAlign: 'center' }}>

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

    </div>
  );
};

export default BloodSugar;