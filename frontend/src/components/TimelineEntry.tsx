import { useState } from "react";
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [connectionText, setConnectionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const existingConnection = connections[track.uri]?.[0];
  const hasConnection = existingConnection?.Connection != null;

  const saveConnection = async (text: string) => {
    setErrorMessage(null);
    const password = window.prompt("Enter password:");
    if (!password) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/2026/connections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackId: trackUri,
            connection: text,
            password,
          }),
        }
      );

      if (!response.ok) {
        setErrorMessage(
          response.status === 403
            ? "Wrong password"
            : "Something went wrong. Please try again."
        );
        return;
      }

      setIsFormOpen(false);
      setIsEditing(false);
      setConnectionText("");
      setErrorMessage(null);
      window.location.reload();
    } catch {
      setErrorMessage("Could not connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => saveConnection(connectionText);
  const handleDelete = () => saveConnection("");

  const openEditForm = () => {
    setConnectionText(existingConnection?.Connection || "");
    setIsEditing(true);
    setIsFormOpen(true);
    setErrorMessage(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setConnectionText("");
    setErrorMessage(null);
  };

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
            className="rounded shrink-0"
            src={albumImage}
            width={128}
            height={128}
            alt={track.name}
            onClick={() => setSelectedTrack(trackUri)}
            style={{ cursor: "pointer", width: 128, height: 128 }}
          />
          {isFormOpen ? (
            <div className="flex flex-col gap-2 w-full">
              <textarea
                className="w-full p-2 text-sm bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 resize-none"
                placeholder="What's the connection to the previous track?"
                value={connectionText}
                onChange={(e) => setConnectionText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !connectionText.trim()}
                >
                  {isSubmitting ? "Saving..." : "Submit"}
                </button>
                <button
                  className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors cursor-pointer"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                {isEditing && (
                  <button
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "..." : "Delete"}
                  </button>
                )}
              </div>
              {errorMessage && (
                <p className="text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded border border-red-800">
                  {errorMessage}
                </p>
              )}
            </div>
          ) : hasConnection ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-400">
                {existingConnection?.Connection}
              </p>
              <button
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer self-start"
                onClick={openEditForm}
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              onClick={() => setIsFormOpen(true)}
            >
              + Add a connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineEntry;
