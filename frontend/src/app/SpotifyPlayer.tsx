"use client";

export default function SpotifyPlayer({ uri }: { uri: string }) {
  const uriParts = uri.split(":");
  const trackId = uriParts[uriParts.length - 1];
  return (
    <iframe
      className=""
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
      width="100%"
      height="120"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
  );
}
