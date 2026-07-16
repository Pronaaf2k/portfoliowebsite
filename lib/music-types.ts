export type MusicTrack = {
  id: string;
  name: string;
  artists: string;
  album: string;
  imageUrl: string | null;
  spotifyUrl: string;
  durationMs: number;
};

export type MusicSearchResponse = {
  configured: boolean;
  tracks: MusicTrack[];
  error?: string;
};

export type MusicRandomResponse = {
  configured: boolean;
  track?: MusicTrack;
  source?: string;
  error?: string;
};

export type MusicPin = {
  id: string;
  createdAt: string;
  track: MusicTrack;
  note: string;
  sender: string;
};

export type MusicPinsResponse = {
  configured: boolean;
  pins: MusicPin[];
  error?: string;
};

export type MusicDropResponse =
  | {
      accepted: true;
      id: string;
    }
  | {
      accepted: false;
      configured: boolean;
      error: string;
      retryAfterSeconds?: number;
    };
