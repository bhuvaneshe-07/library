import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  Thermometer,
  Volume2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  DoorOpen,
  X,
  BookmarkCheck,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { LibraryPlace, ZoneCategory } from '../../types';

interface PlacesViewProps {
  onOpenNewPlaceModal: () => void;
  onOpenNewBookingModal: () => void;
}

const CATEGORIES: Array<ZoneCategory | 'All'> = [
  'All',
  'Quiet Study Sanctuary',
  'Digital Innovation Lab',
  'Research & Manuscripts',
  'Grand Circulation Commons',
  'Collaborative Seminar Pods',
  'Children & Young Readers',
];

export const PlacesView: React.FC<PlacesViewProps> = ({
  onOpenNewPlaceModal,
  onOpenNewBookingModal,
}) => {
  const {
    zones,
    adjustZoneOccupants,
    bookings,
    tasks,
    triggerAIChatWithPrompt,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ZoneCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<LibraryPlace | null>(null);

  const filteredPlaces = zones.filter((zone) => {
    const matchesSearch =
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || zone.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || zone.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Library Places, Zones & Facilities</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-slate-700">
              {filteredPlaces.length} monitored
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time occupancy sensors, HVAC climate logs, acoustic noise monitoring, and study room reservations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              triggerAIChatWithPrompt('⚠️ Evaluate current library zone noise levels, climate sensors, and study pod availability to suggest proctor assignments.')
            }
            className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition-all shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>AI Facility Audit</span>
          </button>

          <button
            id="btn-new-zone-open"
            type="button"
            onClick={onOpenNewPlaceModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Library Zone</span>
          </button>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="input-place-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search zones by name, floor, code, or amenity (e.g. soundproofing, VR)..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <select
            id="select-place-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Operational Statuses</option>
            <option value="Normal">Normal</option>
            <option value="Near Capacity">Near Capacity (85%+)</option>
            <option value="Full">Full</option>
            <option value="Restricted Access">Restricted Access / Vault</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlaces.map((place) => {
          const pct = Math.round((place.currentOccupants / place.capacity) * 100);
          const hasClimateAlert = place.environmental && place.environmental.humidity > 50;

          return (
            <div
              key={place.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image Header */}
                <div className="h-44 w-full relative bg-slate-950 overflow-hidden">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur-md ${
                        place.status === 'Full'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : place.status === 'Near Capacity'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : place.status === 'Restricted Access'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {place.status}
                    </span>
                  </div>

                  {/* Floor code badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                      {place.code} • {place.floor}
                    </span>
                    <span className="text-[10px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded">
                      {place.operatingHours}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-teal-400 transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                  </div>

                  {/* Environmental Telemetry */}
                  {place.environmental && (
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Thermometer className="h-4 w-4 text-teal-400" />
                        <div>
                          <p className="text-[10px] text-slate-500 leading-none">Climate</p>
                          <p className="font-semibold text-xs mt-0.5">
                            {place.environmental.tempC}°C /{' '}
                            <span className={hasClimateAlert ? 'text-amber-400 font-bold' : ''}>
                              {place.environmental.humidity}% RH
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Volume2 className="h-4 w-4 text-indigo-400" />
                        <div>
                          <p className="text-[10px] text-slate-500 leading-none">Acoustics</p>
                          <p className="font-semibold text-xs mt-0.5">
                            {place.environmental.noiseLevelDb} dB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Occupancy and Capacity Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Occupancy</span>
                      <span className="font-bold text-slate-200">
                        {place.currentOccupants} / {place.capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>{place.seatsAvailable} seats available</span>
                      <span>{place.bookableRooms} bookable pods</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {place.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between gap-2">
                {/* Gate sensor simulator buttons */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold">Sensor:</span>
                  <button
                    type="button"
                    onClick={() => adjustZoneOccupants(place.id, -1)}
                    disabled={place.currentOccupants <= 0}
                    className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-30"
                    title="Simulate patron exit"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustZoneOccupants(place.id, 1)}
                    disabled={place.currentOccupants >= place.capacity}
                    className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-30"
                    title="Simulate patron entry"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedZone(place)}
                    className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    Inspect
                  </button>

                  {place.bookableRooms > 0 && (
                    <button
                      type="button"
                      onClick={onOpenNewBookingModal}
                      className="rounded-lg bg-teal-500 hover:bg-teal-400 px-2.5 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-sm"
                    >
                      Book Pod
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone Detailed Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedZone(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  {selectedZone.code} • {selectedZone.floor}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedZone.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Category: {selectedZone.category}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {selectedZone.description}
            </p>

            {/* Environmental stats */}
            {selectedZone.environmental && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <p className="text-[10px] text-slate-500">Temperature</p>
                  <p className="text-sm font-bold text-teal-400 mt-0.5">{selectedZone.environmental.tempC}°C</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <p className="text-[10px] text-slate-500">Humidity</p>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedZone.environmental.humidity}% RH</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <p className="text-[10px] text-slate-500">Noise Level</p>
                  <p className="text-sm font-bold text-indigo-400 mt-0.5">{selectedZone.environmental.noiseLevelDb} dB</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <p className="text-[10px] text-slate-500">Acoustic Tier</p>
                  <p className="text-xs font-bold text-slate-300 mt-1">{selectedZone.environmental.noiseStatus}</p>
                </div>
              </div>
            )}

            {/* Staff & Hours */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500">Librarian / Proctor in Charge</p>
                <p className="text-slate-200 font-semibold mt-0.5">{selectedZone.librarianInCharge}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Operating Hours</p>
                <p className="text-slate-200 font-semibold mt-0.5">{selectedZone.operatingHours}</p>
              </div>
            </div>

            {/* Amenities list */}
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-300 mb-2">Facility Provisions & Hardware</p>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedZone.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 border border-slate-700"
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerAIChatWithPrompt(`Generate an operational environmental & study capacity report for "${selectedZone.name}".`);
                  setSelectedZone(null);
                }}
                className="rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm"
              >
                AI Room Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
