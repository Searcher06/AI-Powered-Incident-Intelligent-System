import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Flies map to a new center when position changes
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
}

// Handles click-to-pin on the map
function MapClickHandler({ onPick }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e) => onPick(e.latlng.lat, e.latlng.lng);
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map, onPick]);
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [pinPos, setPinPos] = useState(
    value?.coordinates?.coordinates?.length === 2
      ? { lat: value.coordinates.coordinates[1], lng: value.coordinates.coordinates[0] }
      : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const debounceRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Commit a picked position to parent
  const commitPosition = useCallback((lat, lng, label) => {
    const pos = { lat, lng };
    setPinPos(pos);
    setGeoError('');
    onChange({
      text: label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      coordinates: { type: 'Point', coordinates: [lng, lat] },
    });
  }, [onChange]);

  // 1. Browser geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Reverse geocode to get a readable name
        let label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data.display_name) label = data.display_name.split(',').slice(0, 3).join(', ');
        } catch (_) { /* use coordinate fallback */ }
        setSearchQuery(label);
        setSuggestions([]);
        commitPosition(lat, lng, label);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) setGeoError('Location access denied. Please allow location access or search manually.');
        else if (err.code === 2) setGeoError('Location unavailable. Try searching by name instead.');
        else setGeoError('Location request timed out. Try searching by name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 2. Place name search via Nominatim (debounced)
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSuggestions([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSuggestionClick = (s) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    const label = s.display_name.split(',').slice(0, 3).join(', ');
    setSearchQuery(label);
    setSuggestions([]);
    commitPosition(lat, lng, label);
  };

  // 3. Map click
  const handleMapClick = useCallback((lat, lng) => {
    const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setSearchQuery(label);
    setSuggestions([]);
    commitPosition(lat, lng, label);
  }, [commitPosition]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const defaultCenter = [9.0579, 7.4951]; // Abuja, Nigeria

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-[#191c1e]">
        Location <span className="text-[#ba1a1a]">*</span>
      </label>

      {/* Search bar + Use my location button */}
      <div className="flex gap-2">
        <div className="relative flex-1" ref={suggestionsRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] pointer-events-none" style={{ fontSize: '16px' }}>
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a place, street, or landmark…"
            autoComplete="off"
            className="w-full bg-white border border-[#c3c6d7] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#191c1e] placeholder-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-colors"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#c3c6d7] rounded-lg shadow-lg z-[1001] overflow-hidden">
              {suggestions.map((s) => (
                <li key={s.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-3 py-2.5 text-sm text-[#191c1e] hover:bg-[#f2f4f6] flex items-start gap-2 transition-colors border-b border-[#f2f4f6] last:border-0"
                  >
                    <span className="material-symbols-outlined text-[#434655] flex-shrink-0 mt-0.5" style={{ fontSize: '14px' }}>
                      location_on
                    </span>
                    <span className="leading-snug line-clamp-2">{s.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Use my location */}
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geoLoading}
          title="Use my current location"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold rounded-lg hover:bg-[#b4c5ff] disabled:opacity-60 disabled:cursor-not-allowed transition-colors border border-[#b4c5ff]"
        >
          {geoLoading ? (
            <div className="w-4 h-4 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
              my_location
            </span>
          )}
          <span className="hidden sm:inline">{geoLoading ? 'Locating…' : 'My Location'}</span>
        </button>
      </div>

      {/* Error message */}
      {geoError && (
        <p className="text-xs text-[#ba1a1a] flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {geoError}
        </p>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-[#c3c6d7] h-48 relative shadow-sm">
        <MapContainer
          center={pinPos ? [pinPos.lat, pinPos.lng] : defaultCenter}
          zoom={pinPos ? 14 : 7}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onPick={handleMapClick} />
          {pinPos && <MapController center={[pinPos.lat, pinPos.lng]} />}
          {pinPos && <Marker position={[pinPos.lat, pinPos.lng]} />}
        </MapContainer>

        {/* Coordinates badge */}
        {pinPos && (
          <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#c3c6d7] flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[#004ac6]" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>
              my_location
            </span>
            <span className="font-mono text-[11px] text-[#191c1e]">
              {pinPos.lat.toFixed(4)}°, {pinPos.lng.toFixed(4)}°
            </span>
          </div>
        )}

        {/* Hint when no pin */}
        {!pinPos && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#c3c6d7] text-xs text-[#434655] flex items-center gap-1 shadow-sm whitespace-nowrap">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>touch_app</span>
              Search above, use My Location, or click the map
            </div>
          </div>
        )}
      </div>

      {/* Pin confirmation */}
      {pinPos && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#16a34a] flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Location set: {value?.text || `${pinPos.lat.toFixed(4)}, ${pinPos.lng.toFixed(4)}`}
          </p>
          <button
            type="button"
            onClick={() => {
              setPinPos(null);
              setSearchQuery('');
              onChange(null);
            }}
            className="text-xs text-[#737686] hover:text-[#ba1a1a] transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
