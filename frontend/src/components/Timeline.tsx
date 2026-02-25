"use client";

import { useEffect, useState } from "react";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import Search from "@/components/Search";
import TimelineEntry from "@/components/TimelineEntry";

type Connection = {
  Id: number;
  TrackId: string;
  Connection: string;
};

export type Connections = Partial<Record<string, Connection[]>>;

export default function Timeline() {
  const [tracks, setTracks] = useState([]);
  const [connections, setConnections] = useState<Connections>({});
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/2026/playlist`)
      .then((r) => r.json())
      .then((data) => {
        const reversedTracks = data.reverse();
        setTracks(reversedTracks);
        setSelectedTrack(reversedTracks[0].track.uri);
      });

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/2026/connections`)
      .then((r) => r.json())
      .then((data) => {
        setConnections(
          Object.groupBy(data, (connection) => connection.TrackId)
        );
      });
  }, []);

  return (
    <>
      {isSearchOpen ? (
        <Search onClose={() => setIsSearchOpen(false)} />
      ) : (
        <button
          className="mb-4 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
        >
          🔍 Search Track
        </button>
      )}
      <SpotifyPlayer uri={selectedTrack} />
      <div className="-my-6">
        {tracks.map((_, index) => (
          <TimelineEntry
            key={index}
            index={index}
            tracks={tracks}
            setSelectedTrack={setSelectedTrack}
            connections={connections}
          />
        ))}
      </div>
    </>
  );
}
