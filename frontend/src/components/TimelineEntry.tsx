import Image from "next/image";
import { Connections } from "./Timeline";

export type TimelineEntryProps = {
  index: number;
  connections: Connections;
  tracks: SpotifyApi.PlaylistTrackObject[];
  setSelectedTrack: (trackId: string) => void;
};

function TimelineEntry({
  index,
  tracks,
  connections,
  setSelectedTrack,
}: TimelineEntryProps) {
  if (!tracks[index]?.track) {
    return <div>nothing here</div>;
  }

  const getFormattedDate = () => {
    const date = new Date(Date.UTC(2026));
    const positionFromEnd = tracks.length - 1 - index;
    date.setDate(date.getDate() + Math.max(0, positionFromEnd - 2));
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });

    const getSuffix = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${month} ${day}${getSuffix(day)}`;
  };

  const track = tracks[index].track;
  const albumImages = track.album.images || [];
  const albumImage = albumImages[0]?.url;
  const trackUri = track.uri;

  console.log({
    connections,
    track,
    uri: track.uri,
    connection: connections[track.uri],
  });
  return (
    <div className="relative pl-8 sm:pl-32 py-6 group">
      <div id="spotify-iframe"></div>
      <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-indigo-600 after:border-4 after:box-content after:border-slate-50 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
        <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-emerald-600 bg-slate-900 rounded-full">
          {getFormattedDate()}
        </time>
        <div className="text-xl font-bold text-white">{track.name}</div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-medium text-sm text-slate-500 mb-1 sm:mb-0">
          {tracks[index].track.artists
            .map((artist: SpotifyApi.ArtistObjectSimplified) => artist.name)
            .join(", ")}
        </div>
        <div className="flex gap-4">
          <Image
            className="rounded"
            src={albumImage}
            width={128}
            height={128}
            alt={track.name}
            onClick={() => setSelectedTrack(trackUri)}
            style={{ cursor: "pointer" }}
          />
          <p className="text-sm text-slate-400">
            {connections[track.uri]?.[0]?.Connection}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TimelineEntry;
