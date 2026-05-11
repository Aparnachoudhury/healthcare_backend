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
import { getPressure } from '../../api/api';

const PressureValue = () => {

  // device id from URL
  const { id } = useParams();

  // pressure data
  const [data, setData] = useState(null);

  // loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getPressure(id)
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
    return <div>No pressure data available</div>;
  }

  return (
    <div>

      <h3
        style={{
          marginBottom: '16px',
          fontSize: '15px'
        }}
      >
        📊 Data Overview

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

      {/* Pressure Chart */}

      <ResponsiveContainer width="100%" height={220}>

        <LineChart data={data.series}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
          />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            interval={3}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
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

      {/* Statistics */}

      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '16px'
        }}
      >

        <div style={{ textAlign: 'center' }}>

          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#1a6ef5'
            }}
          >
            {data.average}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          >
            Average Pressure
          </div>

        </div>

        <div style={{ textAlign: 'center' }}>

          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#52c41a'
            }}
          >
            {data.level}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          >
            Stress Level
          </div>

        </div>

      </div>

      {/* Color Scale */}

      <div style={{ marginTop: '20px' }}>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}
        >

          <span
            style={{
              color: '#1a6ef5',
              fontSize: '12px'
            }}
          >
            ℹ
          </span>

          <span
            style={{
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Tip
          </span>

        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '4px'
          }}
        >

          <span style={{ color: '#1a6ef5' }}>Relax</span>
          <span style={{ color: '#52c41a' }}>Normal</span>
          <span style={{ color: '#fa8c16' }}>Fair</span>
          <span style={{ color: '#ff4d4f' }}>High</span>

        </div>

        <div
          style={{
            height: '12px',
            borderRadius: '6px',
            background:
              'linear-gradient(to right, #1a6ef5 0%, #52c41a 30%, #fa8c16 60%, #ff4d4f 80%, #cc0000 100%)'
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '2px'
          }}
        >

          <span>0</span>
          <span>30</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>

        </div>

      </div>

      {/* Description */}

      <div style={{ marginTop: '20px' }}>

        <p
          style={{
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '6px'
          }}
        >
          Definition
        </p>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.7
          }}
        >
          Stress is a comprehensive pattern of physiological,
          psychological and behavioral responses of an individual
          to various stimuli.

          Long-term excessive stress values can affect sleep,
          mental health, anxiety and overall wellness.
        </p>

        <p
          style={{
            fontWeight: 600,
            fontSize: '13px',
            marginTop: '12px',
            marginBottom: '6px'
          }}
        >
          Guidance and Suggestions
        </p>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.7
          }}
        >
          Maintain a healthy sleep cycle, exercise regularly,
          reduce stress, and monitor pressure values daily.
        </p>

      </div>

    </div>
  );
};

export default PressureValue;