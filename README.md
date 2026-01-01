# Spotify Challenge 2026: Connections

The 2026 Spotify Challenge based on connections between songs.

## Prerequisites

- Node.js 25
- Cloudflare CLI (wrangler)

Install the dependencies for the backend and frontend (`npm install` in both directories) before running the commands below.

## Backend

The backend is built around the Cloudflare stack, using Workers and a D1 database. 
[Wrangler](https://developers.cloudflare.com/workers/wrangler/) is required to run the backend.
It can be installed with Brew: `brew install cloudflare-wrangler`.

The following Environment Variables should be set in `backend/.dev.vars`:

```
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
API_WRITE_PASSWORD=""
```

To setup the local database, the migrations must be executed:

```
wrangler d1 execute spotify-challenge-2026 --file db.sql --local
```

To run the backend use `npm run dev`.

## Frontend

The frontend requires connection to the backend and an environment variable that defines where the backend lives.
For that, configure a `frontend/.env.development` with:

```
NEXT_PUBLIC_BACKEND_URL="http://localhost:8787"
```

After that, the frontend can be executed with `npm run dev`.
