import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

type Bindings = {
	spotify_challenge_2026: D1Database;
	SPOTIFY_CLIENT_ID: string;
	SPOTIFY_CLIENT_SECRET: string;
	API_WRITE_PASSWORD: string;
};
const app = new Hono<{ Bindings: Bindings }>();

interface Track {
	id: string;
	name: string;
	artist: string;
	album: string;
	image: string;
}

app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.get('/api/2026/playlist', async (c) => {
	const playlistId = '2N5obIisBaX9lONucqw7SN'; // 2026
	// const playlistId = '0E0dbVRdTkUO8sqdxGgFsU'; // 2025

	const token = await getSpotifyToken(c.env);
	const requestOptions = {
		headers: { Authorization: `Bearer ${token}` },
	};

	let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
	const tracks: Track[] = [];
	while (nextUrl) {
		const spotifyRes = await fetch(nextUrl, requestOptions);

		if (!spotifyRes.ok) {
			return c.json({ error: 'Failed to fetch from Spotify' }, spotifyRes.status as ContentfulStatusCode);
		}

		const data: any = await spotifyRes.json();
		nextUrl = data.next;

		data.items.forEach((t: any) => tracks.push(t));
	}

	return c.json(tracks);
});

app.get('/api/2026/connections', async (c) => {
	const { results } = await c.env.spotify_challenge_2026.prepare('SELECT Max(Id) as Id, * FROM Connections GROUP BY TrackId').all();
	return c.json(results);
});

app.post('/api/2026/connections', async (c) => {
	const { trackId, connection, password } = await c.req.json();
	if (!password || password !== c.env.API_WRITE_PASSWORD) {
		return c.json({
			status: 'error',
			code: 'unauthorized',
			error: "This request was not successfully authenticated",
		}, 403);
	}
	const errors = [];
	if (!trackId) {
		errors.push('$.trackId: field is required.');
	}
	if (!connection) {
		errors.push('$.connection: field is required.');
	}
	if (errors.length > 0) {
		return c.json({
			status: 'error',
			code: 'badRequest',
			errors,
		}, 400);
	}
	const r = await c.env.spotify_challenge_2026
		.prepare('INSERT INTO Connections (TrackId, Connection) VALUES (?, ?) RETURNING *')
		.bind(trackId, connection)
		.run();
	return c.json(r.results?.[0]);
});

async function getSpotifyToken(env: Bindings) {
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Basic ' + btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
		},
		body: new URLSearchParams({ grant_type: 'client_credentials' }),
	});
	const data: any = await response.json();
	return data.access_token;
}

export default app;
