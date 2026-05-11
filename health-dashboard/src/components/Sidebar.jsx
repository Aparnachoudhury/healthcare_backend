import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Healthdata', path: '/' },
  { label: 'AlarmList', path: '/alarmlist' },
  { label: 'Alarm Big Screen', path: '/alarmbigscreen' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      width: '220px', background: 'var(--sidebar-bg)', color: '#fff',
      display: 'flex', flexDirection: 'column', flexShrink: 0
    }}>
      <div style={{ padding: '20px 16px', fontSize: '16px', fontWeight: 700, borderBottom: '1px solid #1e2d40' }}>
        Healthmanagement
      </div>

      <div style={{ padding: '12px 0' }}>
        <div style={{ padding: '8px 16px', fontSize: '13px', color: '#6b8cae', marginBottom: '4px' }}>
          Healthmanage...
        </div>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '10px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                background: isActive ? 'var(--sidebar-active)' : 'transparent',
                color: isActive ? '#fff' : '#a0b4c8',
                borderRadius: isActive ? '4px' : '0',
                margin: isActive ? '2px 8px' : '2px 0',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;