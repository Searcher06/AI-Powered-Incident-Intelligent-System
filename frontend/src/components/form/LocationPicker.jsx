import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  // value = { text: string, coordinates: { type:'Point', coordinates:[lng,lat] } }
  const [pinPos, setPinPos] = useState(
    value?.coordinates?.coordinates
      ? { lat: value.coordinates.coordinates[1], lng: value.coordinates.coordinates[0] }
      : null
  );

  const handleMapPick = useCallback(({ lat, lng }) => {
    setPinPos({ lat, lng });
    onChange({
      text: value?.text || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      coordinates: { type: 'Point', coordinates: [lng, lat] },
    });
  }, [value?.text, onChange]);

  const handleTextChange = (e) => {
    onChange({
      text: e.target.value,
      coordinates: value?.coordinates || null,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-[#191c1e]">Geospatial Anchor</label>

      {/* Text input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655]" style={{ fontSize: '16px' }}>
          location_on
        </span>
        <input
          type="text"
          placeholder="Enter location name or drop a pin on the map"
          value={value?.text || ''}
          onChange={handleTextChange}
          className="w-full bg-white border border-[#c3c6d7] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#191c1e] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-colors"
        />
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-[#c3c6d7] h-44 relative shadow-sm">
        <MapContainer
          center={pinPos ? [pinPos.lat, pinPos.lng] : [9.0579, 7.4951]}
          zoom={pinPos ? 14 : 6}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onPick={handleMapPick} />
          {pinPos && <Marker position={[pinPos.lat, pinPos.lng]} />}
        </MapContainer>

        {/* Coordinates overlay */}
        {pinPos && (
          <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#c3c6d7] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6]" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>my_location</span>
            <span className="font-mono text-[11px] text-[#191c1e]">
              {pinPos.lat.toFixed(4)}° N, {Math.abs(pinPos.lng).toFixed(4)}° {pinPos.lng >= 0 ? 'E' : 'W'}
            </span>
          </div>
        )}

        {!pinPos && (
          <div className="absolute inset-0 z-[1000] pointer-events-none flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#c3c6d7] text-xs text-[#434655] flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>touch_app</span>
              Click map to drop pin
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
