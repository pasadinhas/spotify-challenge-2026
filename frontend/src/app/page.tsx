"use client";
export const runtime = 'edge';

import { useEffect, useState } from "react";
import { List, useDynamicRowHeight } from "react-window";
import SpotifyPlayer from "./SpotifyPlayer";

function formattedDateByTrackIndex(index: number) {
  const date = new Date(Date.UTC(2026));
  date.setDate(date.getDate() + Math.max(0, index - 3));
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });

  const getSuffix = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  return `${month} ${day}${getSuffix(day)}`;
}

function TimelineEntry({ index, tracks, setSelectedTrack }: { index: number, tracks: any[], setSelectedTrack: (trackId: string) => void}) {
  if (!tracks[index]) {
    return <div>nothing here</div>;
  }

  const albumImages = tracks[index].track.album.images || [];
  const albumImage = albumImages[0]?.url;

  return (
    <div className="relative pl-8 sm:pl-32 py-6 group">
      <div id="spotify-iframe"></div>
      <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-indigo-600 after:border-4 after:box-content after:border-slate-50 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
        <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-emerald-600 bg-slate-900 rounded-full">
          {formattedDateByTrackIndex(index)}
        </time>
        <div className="text-xl font-bold text-white-900">
          {tracks[index].track.name}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-caveat font-medium text-sm text-slate-500 mb-1 sm:mb-0">
          {tracks[index].track.artists.map((artist: any) => artist.name).join(", ")}
        </div>
        <div className="flex text-slate-500 gap-4">
          <div>
            <img
              className="rounded"
              src={albumImage}
              width={128}
              alt=""
              onClick={() => setSelectedTrack(tracks[index].track.uri)}
            />
          </div>
          <div>{tracks[index].description}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/2026/playlist`)
      .then((r) => r.json())
      .then((data) => {
        const reversedTracks = data.reverse();
        setTracks(reversedTracks);
        setSelectedTrack(reversedTracks[0].track.uri);
      });
  }, []);

  const rowHeight = useDynamicRowHeight({ defaultRowHeight: 100 });

  return (
    <main className="relative min-h-screen flex flex-col justify-center bg-slate-950 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col justify-center divide-y divide-slate-200 [&amp;&gt;*]:py-16">
          <div className="w-full max-w-4xl mx-auto">
            <SpotifyPlayer uri={selectedTrack} />
            <div className="-my-6 ">
              <List
                rowComponent={TimelineEntry}
                rowCount={tracks.length}
                rowHeight={rowHeight}
                rowProps={{ tracks, setSelectedTrack } as any}
              ></List>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
