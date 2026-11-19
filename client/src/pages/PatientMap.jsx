import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix Leaflet default marker icon path issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Hospital Marker Icon
const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-marker',
  html: `<div style="background-color: #0E9F8E; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">H</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Patient Marker Icon
const patientIcon = new L.DivIcon({
  className: 'custom-patient-marker',
  html: `<div style="background-color: #12263A; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">P</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function PatientMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(15); // Slider from 1 to 50 km

  const hospitalCenter = [26.9124, 75.7873]; // Jaipur

  const fetchMapData = () => {
    setLoading(true);
    api.get(`/map/patients?withinKm=${radiusKm}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMapData();
  }, [radiusKm]);

  const patientsInside = data?.patients || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Patient Proximity & Catchment Map</h1>
          <p className="text-xs text-slate-500 mt-1">
            Queries <code className="text-teal-700 font-mono">G1</code> (distance) and <code className="text-teal-700 font-mono">G2</code> (<code className="text-teal-700">ST_Distance_Sphere(POINT(lng, lat))</code>) centered at Jaipur Hospital (26.9124°N, 75.7873°E).
          </p>
        </div>
      </div>

      {/* Radius Slider Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1 w-full space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-medicore-teal" /> Catchment Radius Slider (G2 Query):
            </span>
            <span className="font-mono font-bold text-teal-800 text-sm bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
              {radiusKm} km radius
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="40"
            step="1"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
            className="w-full accent-medicore-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>2 km (Local clinic)</span>
            <span>5 km (Query G2)</span>
            <span>15 km (Jaipur Metro)</span>
            <span>40 km (District Catchment)</span>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 flex-shrink-0">
          <div className="text-xs text-slate-500 uppercase font-semibold">Patients Within Radius</div>
          <div className="text-2xl font-bold font-serif text-teal-800">
            {patientsInside.length} patient{patientsInside.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <div className="bg-white rounded-xl border border-medicore-border shadow-xs p-2 h-[550px] relative overflow-hidden">
        <MapContainer
          center={hospitalCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full rounded-lg z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Hospital Center Marker */}
          <Marker position={hospitalCenter} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">MediCore Central Hospital</div>
                <div className="text-slate-500">Jaipur, Rajasthan (26.9124, 75.7873)</div>
                <div className="text-[10px] text-teal-700 font-semibold font-mono">Hospital Origin Benchmark</div>
              </div>
            </Popup>
          </Marker>

          {/* Radius Circle in Metres */}
          <Circle
            center={hospitalCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#0E9F8E',
              fillColor: '#0E9F8E',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '4, 6'
            }}
          />

          {/* Patient Markers */}
          {patientsInside.map(patient => (
            <Marker
              key={patient.patient_id}
              position={[patient.home_latitude, patient.home_longitude]}
              icon={patientIcon}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">
                    <Link to={`/patients/${patient.patient_id}`} className="hover:underline text-teal-800">
                      {patient.first_name} {patient.last_name}
                    </Link>
                  </div>
                  <div className="text-slate-500">{patient.street}, {patient.city}</div>
                  <div className="font-mono text-teal-700 font-bold">
                    Distance: {patient.distance_km} km (G1)
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Proximity List (G1) */}
      <div className="bg-white rounded-xl border border-medicore-border p-5 shadow-xs space-y-3">
        <h3 className="font-serif font-bold text-base text-slate-900">
          Proximity Ranking within {radiusKm} km (Query G1 / G2)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {patientsInside.map(p => (
            <div key={p.patient_id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs">
              <div>
                <Link to={`/patients/${p.patient_id}`} className="font-bold text-slate-800 hover:text-medicore-teal">
                  {p.first_name} {p.last_name}
                </Link>
                <div className="text-slate-400 text-[10px]">{p.city}</div>
              </div>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {p.distance_km} km
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
