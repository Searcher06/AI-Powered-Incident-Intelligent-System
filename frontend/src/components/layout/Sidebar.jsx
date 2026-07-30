import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const NAV_ITEMS = [
  {
    icon: 'dashboard',
    label: 'Command Center',
    to: '/',
    end: true,
    available: true,
  },
  {
    icon: 'list_alt',
    label: 'Incident Feed',
    to: '/?view=feed',
    end: false,
    available: true,
    // Same page as dashboard — just scrolls to the table
  },
  {
    icon: 'map',
    label: 'Intelligence Maps',
    to: '/map',
    end: true,
    available: true,
  },
  {
    icon: 'analytics',
    label: 'Risk Analytics',
    to: null,
    available: false,
  },
  {
    icon: 'history',
    label: 'Archive',
    to: '/?status=resolved',
    end: false,
    available: true,
  },
];

const BOTTOM_ITEMS = [
  { icon: 'settings', label: 'Settings', available: false },
  { icon: 'help_outline', label: 'Support', available: false },
];

function NavItem({ item }) {
  const location = useLocation();

  if (!item.available) {
    return (
      <div className="relative group">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-[#c3c6d7] cursor-not-allowed select-none">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
          {item.label}
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#eceef0] text-[#737686]">
            Soon
          </span>
        </div>
      </div>
    );
  }

  // "Incident Feed" and "Archive" are query-param variants of Dashboard
  if (item.to?.includes('?')) {
    const isActive =
      location.pathname === '/' && location.search === item.to.replace('/', '');
    return (
      <NavLink
        to={item.to}
        className={clsx(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
          isActive
            ? 'bg-[#d0e1fb] text-[#003ea8] border-l-4 border-[#004ac6]'
            : 'text-[#434655] hover:bg-[#e6e8ea]'
        )}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
        {item.label}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
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
  );
}

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex bg-[#ffffff] border-r border-[#c3c6d7] fixed left-0 top-0 h-screen w-[260px] flex-col p-4 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-[#004ac6] flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
          >
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
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
        >
          add
        </span>
        Report Incident
      </button>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </div>

      {/* Bottom items */}
      <div className="border-t border-[#c3c6d7] pt-4 flex flex-col gap-1">
        {BOTTOM_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-[#c3c6d7] cursor-not-allowed select-none">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#eceef0] text-[#737686]">
              Soon
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}
