import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FolderTree, Layers, BookOpen, Network } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface Course {
  course_id: string;
  course_name: string;
}

interface Subtrack {
  subtrack_id: string;
  subtrack_name: string;
  courses: Course[];
}

interface Track {
  track_id: string;
  track_name: string;
  subtracks: Subtrack[];
}

interface TreeViewProps {
  data: Track[];
  loading?: boolean;
}

// Track gradient colors
const trackGradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-green-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-600',
];

export const TreeView: React.FC<TreeViewProps> = ({ data, loading = false }) => {
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [expandedSubtracks, setExpandedSubtracks] = useState<Set<string>>(new Set());

  const toggleTrack = (trackId: string) => {
    setExpandedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
        // Also collapse all subtracks under this track
        data.find(t => t.track_id === trackId)?.subtracks.forEach(st => {
          newSet.delete(st.subtrack_id);
        });
        setExpandedSubtracks(new Set());
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const toggleSubtrack = (subtrackId: string) => {
    setExpandedSubtracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subtrackId)) {
        newSet.delete(subtrackId);
      } else {
        newSet.add(subtrackId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
            <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
          </div>
          <p className="text-apple-gray-4 text-body">Loading tree structure...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card variant="elevated">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Network className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No data yet</h3>
          <p className="text-body text-apple-gray-4 max-w-md mx-auto">
            Create tracks, subtracks, and courses to see them here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((track, trackIndex) => {
        const isTrackExpanded = expandedTracks.has(track.track_id);
        const gradient = trackGradients[trackIndex % trackGradients.length];

        return (
          <Card 
            key={track.track_id} 
            variant="elevated" 
            className="overflow-hidden animate-slide-up"
            style={{ animationDelay: `${trackIndex * 0.05}s` }}
          >
            {/* Track Level */}
            <div
              onClick={() => toggleTrack(track.track_id)}
              className="flex items-center p-4 bg-gradient-to-r from-apple-gray-1 to-white hover:from-apple-gray-2/50 cursor-pointer transition-all duration-200 border-b border-apple-gray-2"
            >
              <button className="p-2 hover:bg-apple-gray-2 rounded-xl transition-colors mr-3">
                {isTrackExpanded ? (
                  <ChevronDown className="w-5 h-5 text-apple-gray-5" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-apple-gray-5" />
                )}
              </button>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md mr-4`}>
                <FolderTree className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-title-2 font-semibold text-apple-gray-6">{track.track_name}</h3>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-apple-gray-1 border border-apple-gray-2">
                <span className="text-caption font-medium text-apple-gray-5">
                  {track.subtracks.length} subtrack{track.subtracks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Subtracks Level */}
            {isTrackExpanded && (
              <CardContent className="p-0 bg-white">
                {track.subtracks.length === 0 ? (
                  <div className="p-6 pl-20 text-body text-apple-gray-4 italic border-t border-apple-gray-2">
                    No subtracks in this track
                  </div>
                ) : (
                  track.subtracks.map((subtrack, subIndex) => {
                    const isSubtrackExpanded = expandedSubtracks.has(subtrack.subtrack_id);

                    return (
                      <div key={subtrack.subtrack_id} className="border-t border-apple-gray-2">
                        <div
                          onClick={() => toggleSubtrack(subtrack.subtrack_id)}
                          className="flex items-center p-4 pl-16 bg-apple-gray-1/30 hover:bg-apple-gray-1 cursor-pointer transition-colors"
                        >
                          <button className="p-1.5 hover:bg-apple-gray-2 rounded-lg transition-colors mr-3">
                            {isSubtrackExpanded ? (
                              <ChevronDown className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm mr-3">
                            <Layers className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-body font-medium text-apple-gray-6">
                              {subtrack.subtrack_name}
                            </h4>
                          </div>
                          <span className="text-caption text-apple-gray-4">
                            {subtrack.courses.length} course{subtrack.courses.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Courses Level */}
                        {isSubtrackExpanded && (
                          <div className="bg-white">
                            {subtrack.courses.length === 0 ? (
                              <div className="p-4 pl-28 text-caption text-apple-gray-4 italic border-t border-apple-gray-2/50">
                                No courses in this subtrack
                              </div>
                            ) : (
                              subtrack.courses.map((course, courseIndex) => (
                                <div
                                  key={course.course_id}
                                  className="flex items-center p-3 pl-28 border-t border-apple-gray-2/50 hover:bg-apple-gray-1/50 transition-colors"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm mr-3">
                                    <BookOpen className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <p className="text-body text-apple-gray-5">{course.course_name}</p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
