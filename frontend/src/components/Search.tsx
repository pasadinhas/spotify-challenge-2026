"use client";

import { useState, useEffect, useMemo } from "react";

interface Track {
  trackName: string;
  artists: string;
  playlist: string;
}

interface SearchProps {
  onClose: () => void;
}

export default function Search({ onClose }: SearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all tracks once on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/all-tracks`)
      .then((r) => r.json())
      .then((data) => {
        setAllTracks(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter tracks locally
  const results = useMemo(() => {
    if (debouncedQuery.length < 2) return [];

    const q = debouncedQuery.toLowerCase();
    return allTracks.filter(
      (track) =>
        track.trackName.toLowerCase().includes(q) ||
        track.artists.toLowerCase().includes(q)
    );
  }, [debouncedQuery, allTracks]);

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search for a track or artist..."
          className="flex-1 p-2 text-sm bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button
          className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors cursor-pointer"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-slate-800/50 rounded"
            >
              <div className="min-w-0">
                <p className="text-sm text-white truncate">
                  {result.trackName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {result.artists}
                </p>
              </div>
              <span className="text-xs text-emerald-500 font-semibold shrink-0 ml-2">
                {result.playlist}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isLoading && debouncedQuery.length >= 2 && results.length === 0 && (
        <p className="text-sm text-slate-400">No matches found</p>
      )}
    </div>
  );
}
