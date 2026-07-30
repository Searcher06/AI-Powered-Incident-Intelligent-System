import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f2f4f6] border-b border-[#c3c6d7] flex items-center h-16 px-8 gap-6">
      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655]" style={{ fontSize: '18px' }}>
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search incidents, reports, locations..."
          className="w-full bg-white border border-[#c3c6d7] text-[#191c1e] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="p-2 rounded-full text-[#434655] hover:text-[#004ac6] hover:bg-[#e6e8ea] transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
        </button>
        <button className="p-2 rounded-full text-[#434655] hover:text-[#004ac6] hover:bg-[#e6e8ea] transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>share</span>
        </button>
        <button className="p-2 rounded-full text-[#434655] hover:text-[#004ac6] hover:bg-[#e6e8ea] transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>account_circle</span>
        </button>
      </div>
    </header>
  );
}
