import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getHeartHealth } from '../../api/api';

const HeartHealth = () => {

  // device id from URL
  const { id } = useParams();

  // heart health data
  const [data, setData] = useState(null);

  // loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getHeartHealth(id)
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
    return <div>No heart health data available</div>;
  }

  return (
    <div>

      <h3
        style={{
          marginBottom: '16px',
          fontSize: '15px'
        }}
      >
        ❤️ Heart Health

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

      {/* Diagnosis Box */}

      <div
        style={{
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >

        <div
          style={{
            fontWeight: 600,
            marginBottom: '8px',
            color: '#52c41a'
          }}
        >
          Diagnosis conclusion
        </div>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.6
          }}
        >

          {data.diagnosis}

          <br />
          <br />

          Atrial fibrillation risk:
          <strong> {data.afibRisk}</strong>

          <br />
          <br />

          HRV Score:
          <strong> {data.hrvScore}</strong>

        </p>

      </div>

      {/* Information */}

      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}
      >
        Open the phone historical diagnosis.
        No data for now.
        Please wait for the diagnosis results.
      </p>

    </div>
  );
};

export default HeartHealth;