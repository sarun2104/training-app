import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface SubtrackWithTrack {
  subtrack_id: string;
  subtrack_name: string;
  track_id: string;
  track_name: string;
}

interface SubtrackSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  subtracks: SubtrackWithTrack[];
  onSelect: (subtrackId: string) => void;
  selectedSubtracks?: string[];
  title?: string;
}

export const SubtrackSelector: React.FC<SubtrackSelectorProps> = ({
  isOpen,
  onClose,
  subtracks,
  onSelect,
  selectedSubtracks = [],
  title = 'Select SubTrack',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubtrack, setSelectedSubtrack] = useState<string>('');

  // Filter subtracks based on search query (case-insensitive)
  const filteredSubtracks = useMemo(() => {
    if (!searchQuery.trim()) {
      return subtracks;
    }

    const query = searchQuery.toLowerCase();
    return subtracks.filter(
      (st) =>
        st.subtrack_name.toLowerCase().includes(query) ||
        st.track_name.toLowerCase().includes(query)
    );
  }, [subtracks, searchQuery]);

  // Group subtracks by track
  const groupedSubtracks = useMemo(() => {
    const groups: { [trackId: string]: {
      track_name: string;
      subtracks: SubtrackWithTrack[];
    } } = {};

    filteredSubtracks.forEach((st) => {
      if (!groups[st.track_id]) {
        groups[st.track_id] = {
          track_name: st.track_name,
          subtracks: [],
        };
      }
      groups[st.track_id].subtracks.push(st);
    });

    return Object.entries(groups);
  }, [filteredSubtracks]);

  const handleSubmit = () => {
    if (selectedSubtrack) {
      onSelect(selectedSubtrack);
      setSelectedSubtrack('');
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSubtrack('');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by track or subtrack name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Scrollable List of Subtracks grouped by Track */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {groupedSubtracks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No subtracks found matching "{searchQuery}"
            </div>
          ) : (
            groupedSubtracks.map(([trackId, { track_name, subtracks: trackSubtracks }]) => (
              <div key={trackId} className="border-b border-gray-200 last:border-b-0">
                {/* Track Header */}
                <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700">
                  {track_name}
                </div>

                {/* Subtracks under this track */}
                <div className="divide-y divide-gray-100">
                  {trackSubtracks.map((st) => {
                    const isSelected = selectedSubtrack === st.subtrack_id;
                    const isAlreadyAssigned = selectedSubtracks.includes(st.subtrack_id);

                    return (
                      <label
                        key={st.subtrack_id}
                        className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                          isSelected ? 'bg-primary-50' : ''
                        } ${isAlreadyAssigned ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name="subtrack"
                          value={st.subtrack_id}
                          checked={isSelected}
                          onChange={(e) => setSelectedSubtrack(e.target.value)}
                          disabled={isAlreadyAssigned}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {st.subtrack_name}
                          </div>
                          {isAlreadyAssigned && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Already assigned
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedSubtrack}
          >
            Add to SubTrack
          </Button>
        </div>
      </div>
    </Modal>
  );
};
