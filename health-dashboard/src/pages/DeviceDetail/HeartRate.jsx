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
import { getHeartRate } from '../../api/api';

const HeartRate = () => {

  // device id from URL
  const { id } = useParams();

  // chart data
  const [chartData, setChartData] = useState([]);

  // statistics
  const [stats, setStats] = useState({
    avg: 0,
    max: 0,
    min: 0
  });

  // loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getHeartRate(id)
      .then((data) => {

        // chart data
        setChartData(data.series);

        // stats
        setStats({
          avg: data.average,
          max: data.max,
          min: data.min
        });

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

  return (
    <div>

      <h3
        style={{
          marginBottom: '16px',
          fontSize: '15px'
        }}
      >
        ♥ Heart Rate

        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginLeft: '8px'
          }}
        >
          2026-05-11
        </span>
      </h3>

      {/* Chart */}

      <ResponsiveContainer width="100%" height={220}>

        <LineChart data={chartData}>

          <CartesianGrid strokeDasharray="3 3" />

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
            stroke="#ff4d4f"
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
            label: 'Average heart rate/count',
            color: '#1a6ef5',
            value: stats.avg
          },
          {
            label: 'Maximum heart rate/count',
            color: '#ff4d4f',
            value: stats.max
          },
          {
            label: 'Minimum heart rate/count',
            color: '#faad14',
            value: stats.min
          },
        ].map((s) => (

          <div
            key={s.label}
            style={{ textAlign: 'center' }}
          >

            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: s.color
              }}
            >
              {s.value}
            </div>

            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}
            >
              {s.label}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default HeartRate;