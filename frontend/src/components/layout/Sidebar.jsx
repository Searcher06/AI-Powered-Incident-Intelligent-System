import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Command Center', to: '/' },
  { icon: 'list_alt', label: 'Incident Feed', to: '/?view=feed' },
  { icon: 'map', label: 'Intelligence Maps', to: '/?view=map' },
  { icon: 'analytics', label: 'Risk Analytics', to: '/?view=analytics' },
  { icon: 'history', label: 'Archive', to: '/?view=archive' },
];

const BOTTOM_ITEMS = [
  { icon: 'settings', label: 'Settings', to: '/?view=settings' },
  { icon: 'help_outline', label: 'Support', to: '/?view=support' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex bg-[#ffffff] border-r border-[#c3c6d7] fixed left-0 top-0 h-screen w-[260px] flex-col p-4 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-[#004ac6] flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
            radar
          </span>
        </div>
        <div>
          <h1 className="font-bold text-[#004ac6] text-base tracking-tight leading-none">CivicLens</h1>
          <p className="text-xs text-[#434655] mt-0.5">Community Intelligence</p>
        </div>
      </div>

      {/* Report button */}
      <button
        onClick={() => navigate('/submit')}
        className="bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg py-3 px-4 mb-6 w-full flex items-center justify-center gap-2 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>add</span>
        Report Incident
      </button>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-[#d0e1fb] text-[#003ea8] border-l-4 border-[#004ac6]'
                  : 'text-[#434655] hover:bg-[#e6e8ea]'
              )
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-[#c3c6d7] pt-4 flex flex-col gap-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 text-[#434655] hover:bg-[#e6e8ea] rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
