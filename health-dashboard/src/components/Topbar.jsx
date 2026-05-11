import { useLocation } from 'react-router-dom';

const breadcrumbMap = {
  '/': 'Homepage / Healthmanagement / Healthdata',
  '/alarmlist': 'Homepage / Healthmanagement / AlarmList',
  '/alarmbigscreen': 'Homepage / Healthmanagement / Alarm Big Screen',
};

const Topbar = () => {
  const location = useLocation();
  const breadcrumb = breadcrumbMap[location.pathname] || 'Homepage / Healthmanagement';

  return (
    <div style={{
      height: '56px', background: 'var(--topbar-bg)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>☰</span>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{breadcrumb}</span>
      </div>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', cursor: 'pointer'
      }}>
        👤
      </div>
    </div>
  );
};

export default Topbar;