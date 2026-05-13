import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Health Data',      path: '/' },
  { label: 'Alarm List',       path: '/alarmlist' },
  { label: 'Alarm Big Screen', path: '/alarmbigscreen' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/device');
    return location.pathname === path;
  };

  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      height: '100vh',
      background: '#0D1F17',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* ── Logo ─────────────────────────── */}
      <div
        onClick={() => navigate('/')}
        style={{
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid #142E20',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: '30px', height: '30px',
          background: '#10B981',
          borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M1.5 8.5h3l2-5 3 10 2-7 1.5 3.5H15.5"
              stroke="#022C22" strokeWidth="1.9"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '0.3px' }}>
          StealthEra
        </span>
      </div>

      {/* ── Section label ─────────────────── */}
      <div style={{
        padding: '14px 18px 6px',
        fontSize: '10.5px',
        color: '#2D5C43',
        textTransform: 'uppercase',
        letterSpacing: '0.9px',
        fontWeight: 700,
      }}>
        Healthmanage...
      </div>

      {/* ── Nav items ─────────────────────── */}
      <div style={{ padding: '4px 8px', flex: 1 }}>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '10px 12px',
                marginBottom: '2px',
                cursor: 'pointer',
                fontSize: '13.5px',
                fontWeight: active ? 600 : 400,
                borderRadius: '6px',
                background: active ? '#10B981' : 'transparent',
                color: active ? '#022C22' : '#6B9E87',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'background 0.15s, color 0.15s',
                userSelect: 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = '#142E20';
                  e.currentTarget.style.color = '#D1FAE5';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B9E87';
                }
              }}
            >
              {item.label === 'Health Data' && (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 7.5h3l2-4 2.5 8L11 5l1.5 3H14"
                    stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {item.label === 'Alarm List' && (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1.5A4 4 0 0 1 11.5 5.5c0 2 .5 3.5 1.5 4.5h-11C3 9 3.5 7.5 3.5 5.5A4 4 0 0 1 7.5 1.5z"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M6 12.5a1.5 1.5 0 0 0 3 0"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )}
              {item.label === 'Alarm Big Screen' && (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="2" width="13" height="9" rx="1.5"
                    stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 13h5M7.5 11v2"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )}
              {item.label}
            </div>
          );
        })}
      </div>

      {/* ── Bottom section ─────────────────── */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #142E20' }}>

        {/* Notifications */}
        <div style={{
          padding: '13px 18px',
          background: '#10B981',
          display: 'flex', alignItems: 'center', gap: '9px',
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5A4 4 0 0 1 12 5.5c0 2 .5 3.5 1.5 4.5H2.5C3.5 9 4 7.5 4 5.5A4 4 0 0 1 8 1.5z"
              stroke="#022C22" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"
              stroke="#022C22" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#022C22' }}>Notifications</span>
        </div>

        {/* User card */}
        <div style={{
          padding: '11px 18px',
          background: '#10B981',
          display: 'flex', alignItems: 'center', gap: '11px',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          cursor: 'pointer',
        }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: '#022C22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: '#10B981',
            flexShrink: 0,
          }}>AS</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#022C22', lineHeight: 1.3 }}>
              Dr. Alen Smith
            </div>
            <div style={{ fontSize: '11px', color: '#065F46', lineHeight: 1.3 }}>MD MBBS</div>
          </div>
        </div>

        {/* Setting */}
        <SidebarLink label="Setting">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7 1v1.2M7 11.8V13M1 7h1.2M11.8 7H13M2.9 2.9l.85.85M10.25 10.25l.85.85M10.25 3.75l-.85.85M3.75 10.25l-.85.85"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </SidebarLink>

        {/* Logout */}
        <SidebarLink label="Logout">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 12H2.5A1.5 1.5 0 0 1 1 10.5v-7A1.5 1.5 0 0 1 2.5 2h3"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M9.5 9.5l3-2.5-3-2.5M12.5 7H5.5"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SidebarLink>
      </div>
    </div>
  );
};

const SidebarLink = ({ label, children }) => (
  <div
    style={{
      padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: '9px',
      fontSize: '13px', color: '#6B9E87',
      cursor: 'pointer',
      transition: 'background 0.15s, color 0.15s',
      userSelect: 'none',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = '#142E20';
      e.currentTarget.style.color = '#D1FAE5';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#6B9E87';
    }}
  >
    {children}
    {label}
  </div>
);

export default Sidebar;