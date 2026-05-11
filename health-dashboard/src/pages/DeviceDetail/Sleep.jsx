import { useEffect, useState } from 'react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { useParams } from 'react-router-dom';
import { getSleep } from '../../api/api';

const Sleep = () => {

  // device id from URL
  const { id } = useParams();

  // sleep data
  const [data, setData] = useState(null);

  // loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getSleep(id)
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
    return <div>No sleep data available</div>;
  }

  return (
    <div>

      <h3
        style={{
          marginBottom: '16px',
          fontSize: '15px'
        }}
      >
        🌙 Sleep

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

      {/* Sleep Chart */}

      <ResponsiveContainer width="100%" height={200}>

        <AreaChart data={data.series}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
          />

          <YAxis tick={{ fontSize: 11 }} />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="stage"
            stroke="#1a6ef5"
            fill="#e6f0ff"
          />

        </AreaChart>

      </ResponsiveContainer>

      {/* Sleep Stats */}

      <div
        style={{
          marginTop: '12px',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}
      >

        <div>
          Total Sleep Time:
          <strong> {data.totalMinutes} min</strong>
        </div>

        <div style={{ marginTop: '6px' }}>
          Deep Sleep:
          <strong> {data.deepSleepMinutes} min</strong>
        </div>

        <div style={{ marginTop: '6px' }}>
          Light Sleep:
          <strong> {data.lightSleepMinutes} min</strong>
        </div>

        <div style={{ marginTop: '6px' }}>
          Sleep Score:
          <strong> {data.sleepScore}</strong>
        </div>

      </div>

    </div>
  );
};

export default Sleep;