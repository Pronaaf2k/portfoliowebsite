# Samiyeel Alim Binaaf / Pronaaf2k Portfolio

A personality-first Next.js portfolio connecting Samiyeel's production work, live development signals, music exchange, and the competitive history of Pronaaf2k. Gaming stays in the secondary Loadout archive instead of dominating the professional homepage.

## Stack

- Next.js 16 App Router and React 19
- TypeScript and custom responsive CSS
- Fontsource-hosted Archivo, Manrope, and IBM Plex Mono
- GitHub, Steam, Spotify Web API, and Upstash Redis integrations
- Route metadata, canonical URLs, sitemap, robots policy, social cards, and Person/ProfilePage JSON-LD

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` - portfolio, live signals, selected work, experience, and the two-way Spotify music exchange
- `/loadout` - 15-second aim challenge, weekly/all-time boards, esports records, tools, rig, and desk
- `/api/live` - server-side live signal aggregator
- `/api/music/search` - server-side Spotify track search
- `/api/music/random` - random track from configured Spotify playlists
- `/api/music/drop` - rate-limited song submission endpoint
- `/api/music/pins` - public-safe recent song pinboard
- `/api/spotify/connect` - local-only one-time Spotify account authorization
- `/api/aim/*` - verified aim sessions, score submission, and weekly/all-time boards
- `/api/cron/aim-leaderboards` - protected daily heartbeat and completed-week archive
- `/robots.txt` and `/sitemap.xml` - generated crawl controls and canonical URL discovery

## Environment

Copy `.env.example` to `.env.local`. GitHub works without credentials at the public API limit. Steam, Spotify, Upstash, verification, and cron features activate only when their server-side variables are configured.

### Spotify music exchange

Create a Spotify app and set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`. Search and public playlist pulls use the server-to-server client credentials flow. Add comma-separated playlist IDs; a user refresh token is only needed when any configured playlist is private or collaborative:

```bash
SPOTIFY_REFRESH_TOKEN=
SPOTIFY_PLAYLIST_IDS=playlist_id_one,playlist_id_two
MUSIC_EXCHANGE_SECRET=a-long-random-secret
```

For the live current-track card, add `http://127.0.0.1:3000/api/spotify/callback` to the Spotify app's redirect URIs, then open `/api/spotify/connect` locally and approve the `user-read-currently-playing` scope. The development-only callback stores the refresh token in ignored `.env.local`; the helper returns 404 in production.

When used for private playlists, the refresh token must also be authorized to read every configured playlist; include `playlist-read-private` and the appropriate collaborative-playlist scope when needed. Song notes are revalidated against Spotify and rate limited to five submissions per fingerprint per hour. The public pinboard returns only track metadata, sender, note, and timestamp; Redis credentials, Spotify secrets, fingerprints, and internal inbox fields never leave the server.

### Aim Challenge and Upstash retention

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
AIM_GAME_SECRET=a-different-long-random-secret
CRON_SECRET=another-long-random-secret
```

The 15-second drill ranks clean hits first and accuracy second. Accepted scores are written to an append-only stream, a weekly sorted set, a persistent all-time set, and two-year score records. The Vercel cron runs daily at 18:05 UTC, writes a heartbeat to the shared database, and snapshots a completed week on Monday in Dhaka time.

A heartbeat is activity, not a backup. It cannot recover a manually deleted or flushed database. Enable Upstash daily backups separately and keep eviction disabled for archival keys.

## SEO launch checklist

1. Deploy this branch to `https://samiyeelalim.com` and redirect every `www` or alternate-host version to that canonical origin.
2. Add the Google Search Console and Bing Webmaster Tools verification values to the production environment.
3. Submit `https://samiyeelalim.com/sitemap.xml` in both webmaster consoles and request indexing for `/` and `/loadout` after deployment.
4. Add `https://samiyeelalim.com` as the website link on GitHub, LinkedIn, Steam, and any editable esports profiles so the real name and Pronaaf2k form a reciprocal entity graph.
5. Test the production pages with Google's Rich Results Test and Schema.org Validator, then inspect the rendered canonical, title, and JSON-LD.
6. Update `CONTENT_UPDATED_AT` in `lib/seo.ts` only when visible page content materially changes.

Metadata cannot guarantee a number-one result. Consistent visible identity copy, crawlable evidence, reciprocal profile links, a stable canonical domain, earned mentions, and indexing are the durable ranking work.

## Content

Portfolio copy and source notes live in [PORTFOLIO_PERSONALITY.md](./PORTFOLIO_PERSONALITY.md). Project images remain under `public/images/projects`.
