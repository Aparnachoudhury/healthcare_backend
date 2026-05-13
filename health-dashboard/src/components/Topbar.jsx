import { useLocation } from 'react-router-dom';

const breadcrumbMap = {
  '/':               'Homepage / Healthmanagement / Health Data',
  '/alarmlist':      'Homepage / Healthmanagement / Alarm List',
  '/alarmbigscreen': 'Homepage / Healthmanagement / Alarm Big Screen',
};

const Topbar = () => {
  const location = useLocation();

  const getBreadcrumb = () => {
    if (location.pathname.startsWith('/device'))
      return 'Homepage / Healthmanagement / Health Data / Device Detail';
    return breadcrumbMap[location.pathname] || 'Homepage / Healthmanagement';
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long', day: '2-digit', year: 'numeric',
  });

  return (
    <div style={{
      height: '56px',
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>☰</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{getBreadcrumb()}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '20px',
          padding: '5px 14px',
          fontSize: '12px',
          color: '#065F46',
          fontWeight: 500,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#10B981" strokeWidth="1.3"/>
            <path d="M4 1v2M9 1v2M1 5h11" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {dateStr}
        </div>
        <div style={{
          width: '34px', height: '34px',
          borderRadius: '50%',
          background: '#D1FAE5',
          border: '2px solid #10B981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700,
          color: '#065F46',
          cursor: 'pointer',
        }}>AS</div>
      </div>
    </div>
  );
};

export default Topbar;