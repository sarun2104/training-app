import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FolderTree, Layers, BookOpen } from 'lucide-react';

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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-gray-600">Loading tree structure...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create tracks, subtracks, and courses to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((track) => {
        const isTrackExpanded = expandedTracks.has(track.track_id);

        return (
          <div key={track.track_id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Track Level */}
            <div
              onClick={() => toggleTrack(track.track_id)}
              className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0">
                {isTrackExpanded ? (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="ml-2 flex-shrink-0">
                <FolderTree className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-base font-semibold text-gray-900">{track.track_name}</h3>
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {track.subtracks.length} subtrack{track.subtracks.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Subtracks Level */}
            {isTrackExpanded && track.subtracks.length > 0 && (
              <div className="bg-white">
                {track.subtracks.map((subtrack) => {
                  const isSubtrackExpanded = expandedSubtracks.has(subtrack.subtrack_id);

                  return (
                    <div key={subtrack.subtrack_id} className="border-t border-gray-200">
                      <div
                        onClick={() => toggleSubtrack(subtrack.subtrack_id)}
                        className="flex items-center p-3 pl-10 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {isSubtrackExpanded ? (
                            <ChevronDown className="h-4 w-4 text-green-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <Layers className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {subtrack.subtrack_name}
                          </h4>
                        </div>
                        <div className="ml-2 text-xs text-gray-500">
                          {subtrack.courses.length} course{subtrack.courses.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Courses Level */}
                      {isSubtrackExpanded && subtrack.courses.length > 0 && (
                        <div className="bg-white">
                          {subtrack.courses.map((course) => (
                            <div
                              key={course.course_id}
                              className="flex items-center p-2 pl-20 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-shrink-0">
                                <BookOpen className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm text-gray-700">{course.course_name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isSubtrackExpanded && subtrack.courses.length === 0 && (
                        <div className="p-3 pl-20 text-xs text-gray-500 italic border-t border-gray-100">
                          No courses in this subtrack
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isTrackExpanded && track.subtracks.length === 0 && (
              <div className="p-3 pl-10 text-sm text-gray-500 italic bg-white border-t border-gray-200">
                No subtracks in this track
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
