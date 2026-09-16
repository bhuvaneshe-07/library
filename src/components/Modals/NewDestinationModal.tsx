import React, { useState } from 'react';
import { X, Building2, Plus } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { ZoneCategory } from '../../types';

interface NewDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ZoneCategory[] = [
  'Quiet Study Sanctuary',
  'Digital Innovation Lab',
  'Research & Manuscripts',
  'Grand Circulation Commons',
  'Collaborative Seminar Pods',
  'Children & Young Readers',
];

export const NewDestinationModal: React.FC<NewDestinationModalProps> = ({ isOpen, onClose }) => {
  const { addZone } = useLibrary();

  const [name, setName] = useState('');
  const [floor, setFloor] = useState('Level 3 - East Wing');
  const [category, setCategory] = useState<ZoneCategory>('Quiet Study Sanctuary');
  const [capacity, setCapacity] = useState(60);
  const [seatsAvailable, setSeatsAvailable] = useState(60);
  const [bookableRooms, setBookableRooms] = useState(4);
  const [librarianInCharge, setLibrarianInCharge] = useState('Staff Librarian');
  const [operatingHours, setOperatingHours] = useState('08:00 AM - 10:00 PM');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80'
  );
  const [amenities, setAmenities] = useState('Soundproofing, Ergonomic Desks, Power Pods, High-Speed Wi-Fi');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addZone({
      name: name.trim(),
      floor: floor.trim(),
      category,
      capacity,
      currentOccupants: 0,
      seatsAvailable,
      bookableRooms,
      status: 'Normal',
      environmental: {
        tempC: 21.0,
        humidity: 45,
        noiseLevelDb: 35,
        noiseStatus: 'Whisper-quiet',
      },
      operatingHours,
      librarianInCharge,
      imageUrl: imageUrl.trim(),
      description: description.trim() || 'Modern library study zone equipped with high-efficiency amenities and ergonomic furniture.',
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    });

    // Reset
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-black text-white">Add Facility Zone / Room</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Zone / Room Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Graduate Science & Thesis Wing"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Floor / Wing</label>
              <input
                type="text"
                required
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Level 3 - West"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Zone Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ZoneCategory)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Capacity</label>
              <input
                type="number"
                min={5}
                max={500}
                value={capacity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 20;
                  setCapacity(val);
                  setSeatsAvailable(val);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bookable Pods</label>
              <input
                type="number"
                min={0}
                max={50}
                value={bookableRooms}
                onChange={(e) => setBookableRooms(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Librarian Lead</label>
              <input
                type="text"
                value={librarianInCharge}
                onChange={(e) => setLibrarianInCharge(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Amenities (comma-separated)</label>
            <input
              type="text"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zone purpose, acoustic rules, or hardware provisions..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20"
            >
              Add Zone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
