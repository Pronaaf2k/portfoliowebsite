"use client";

import Image from "next/image";
import {

  ArrowUpRight,
  Check,
  Disc3,
  ExternalLink,
  LoaderCircle,
  Pin,
  Plus,
  Search,
  Send,
  Shuffle,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type {
  MusicDropResponse,
  MusicPin,
  MusicPinsResponse,
  MusicRandomResponse,
  MusicSearchResponse,
  MusicTrack,
} from "@/lib/music-types";

type RequestState = "idle" | "loading" | "success" | "error";

function TrackArtwork({ track, sizes }: { track: MusicTrack; sizes: string }) {
  return (
    <span className="music-artwork" aria-hidden="true">
      {track.imageUrl ? (
        <Image src={track.imageUrl} alt="" fill sizes={sizes} />
      ) : (
        <Disc3 size={24} strokeWidth={1.4} />
      )}
    </span>
  );
}

function getError(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return fallback;
}

function formatPinDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

async function fetchPublicPins() {
  const response = await fetch("/api/music/pins", { cache: "no-store" });
  const payload = (await response.json()) as MusicPinsResponse;

  if (!response.ok) {
    throw new Error(getError(payload, "The public queue is unavailable"));
  }

  return payload.pins;
}

export function MusicExchange() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [selected, setSelected] = useState<MusicTrack | null>(null);
  const [sender, setSender] = useState("");
  const [note, setNote] = useState("");
  const [gift, setGift] = useState<MusicTrack | null>(null);
  const [searchState, setSearchState] = useState<RequestState>("idle");
  const [dropState, setDropState] = useState<RequestState>("idle");
  const [randomState, setRandomState] = useState<RequestState>("idle");
  const [searchMessage, setSearchMessage] = useState("Waiting for a track");
  const [dropMessage, setDropMessage] = useState("");
  const [randomMessage, setRandomMessage] = useState("Playlist signal ready");
  const [pins, setPins] = useState<MusicPin[]>([]);
  const [pinState, setPinState] = useState<RequestState>("loading");
  const pinRailRef = useRef<HTMLDivElement>(null);

  const loadPins = async () => {
    try {
      setPins(await fetchPublicPins());
      setPinState("success");
    } catch {
      setPinState("error");
    }
  };

  useEffect(() => {
    let cancelled = false;

    void fetchPublicPins()
      .then((nextPins) => {
        if (cancelled) return;
        setPins(nextPins);
        setPinState("success");
      })
      .catch(() => {
        if (!cancelled) setPinState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    const rail = pinRailRef.current;
    if (!rail) return;

    const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let activePointer: number | null = null;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let dragged = false;

    const onWheel = (event: WheelEvent) => {
      if (!desktopPointer.matches || rail.scrollWidth <= rail.clientWidth) return;

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;

      const atStart = rail.scrollLeft <= 0 && delta < 0;
      const atEnd =
        rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1 && delta > 0;
      if (atStart || atEnd) return;

      event.preventDefault();
      rail.scrollLeft += delta;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (
        !desktopPointer.matches ||
        event.button !== 0 ||
        rail.scrollWidth <= rail.clientWidth
      ) {
        return;
      }

      activePointer = event.pointerId;
      dragStartX = event.clientX;
      dragStartScroll = rail.scrollLeft;
      dragged = false;
      rail.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;

      const movement = event.clientX - dragStartX;
      if (Math.abs(movement) < 4 && !dragged) return;

      dragged = true;
      event.preventDefault();
      rail.classList.add("is-dragging");
      rail.scrollLeft = dragStartScroll - movement;
    };

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      if (rail.hasPointerCapture(event.pointerId)) {
        rail.releasePointerCapture(event.pointerId);
      }
      activePointer = null;
      rail.classList.remove("is-dragging");
      window.setTimeout(() => {
        dragged = false;
      }, 0);
    };

    const preventDraggedClick = (event: MouseEvent) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onPointerMove);
    rail.addEventListener("pointerup", finishDrag);
    rail.addEventListener("pointercancel", finishDrag);
    rail.addEventListener("click", preventDraggedClick, true);

    return () => {
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onPointerMove);
      rail.removeEventListener("pointerup", finishDrag);
      rail.removeEventListener("pointercancel", finishDrag);
      rail.removeEventListener("click", preventDraggedClick, true);
    };
  }, []);
  const searchTracks = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();

    if (value.length < 2) {
      setSearchState("error");
      setSearchMessage("Type at least two characters");
      return;
    }

    setSearchState("loading");
    setSearchMessage("Reading the Spotify catalogue");

    try {
      const response = await fetch("/api/music/search?q=" + encodeURIComponent(value), {
        cache: "no-store",
      });
      const payload = (await response.json()) as MusicSearchResponse;

      if (!response.ok) throw new Error(getError(payload, "Search is unavailable"));

      setResults(payload.tracks);
      setSearchState("success");
      setSearchMessage(
        payload.tracks.length ? payload.tracks.length + " matches" : "No matching tracks",
      );
    } catch (error) {
      setResults([]);
      setSearchState("error");
      setSearchMessage(error instanceof Error ? error.message : "Search is unavailable");
    }
  };

  const chooseTrack = (track: MusicTrack) => {
    setSelected(track);
    setDropState("idle");
    setDropMessage("");
  };

  const submitDrop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;

    const message = note.trim();
    if (message.length < 2) {
      setDropState("error");
      setDropMessage("Leave at least a couple of words");
      return;
    }

    setDropState("loading");
    setDropMessage("Sending to the public pinboard");

    try {
      const response = await fetch("/api/music/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: selected.id, note: message, sender }),
      });
      const payload = (await response.json()) as MusicDropResponse | { error?: string };

      if (!response.ok || !("accepted" in payload) || payload.accepted !== true) {
        throw new Error(getError(payload, "The note could not be sent"));
      }

      setDropState("success");
      setDropMessage("Pinned. I owe this one a listen.");
      setNote("");
      void loadPins().then(() => {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        pinRailRef.current?.scrollTo({
          left: 0,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      });
    } catch (error) {
      setDropState("error");
      setDropMessage(error instanceof Error ? error.message : "The note could not be sent");
    }
  };

  const drawRandomTrack = async () => {
    setRandomState("loading");
    setRandomMessage("Shuffling my side of the exchange");

    try {
      const response = await fetch("/api/music/random", { cache: "no-store" });
      const payload = (await response.json()) as MusicRandomResponse;

      if (!response.ok || !payload.track) {
        throw new Error(getError(payload, "My playlists are not connected yet"));
      }

      setGift(payload.track);
      setRandomState("success");
      setRandomMessage(payload.source ?? "From Samiyeel's playlists");
    } catch (error) {
      setGift(null);
      setRandomState("error");
      setRandomMessage(
        error instanceof Error ? error.message : "My playlists are not connected yet",
      );
    }
  };

  return (
    <div className="music-exchange">
      <div className="music-exchange-head">
        <span>Listening exchange</span>
        <span>Spotify signal / two-way</span>
      </div>

      <div className="music-exchange-stack">
        <section className="music-send-channel" aria-labelledby="music-send-title">
          <div className="music-channel-head">
            <span>01 / Pin a song</span>
            <h3 id="music-send-title">Leave a track on the board.</h3>
          </div>

          <form className="music-search-form" onSubmit={searchTracks}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Song or artist"
              maxLength={80}
              aria-label="Search Spotify songs"
            />
            <button
              type="submit"
              aria-label="Search songs"
              title="Search songs"
              disabled={searchState === "loading"}
            >
              {searchState === "loading" ? (
                <LoaderCircle className="is-spinning" size={17} aria-hidden="true" />
              ) : (
                <Search size={17} aria-hidden="true" />
              )}
            </button>
          </form>

          <div className="music-search-status" aria-live="polite">
            <span className={"is-" + searchState}>{searchMessage}</span>
            <span>Spotify catalogue</span>
          </div>

          {results.length ? (
            <ul className="music-results" aria-label="Spotify search results">
              {results.map((track) => (
                <li className={selected?.id === track.id ? "is-selected" : ""} key={track.id}>
                  <button
                    className="music-track-select"
                    type="button"
                    onClick={() => chooseTrack(track)}
                    title="Choose track"
                  >
                    <TrackArtwork track={track} sizes="52px" />
                    <span>
                      <strong>{track.name}</strong>
                      <small>{track.artists}</small>
                    </span>
                    {selected?.id === track.id ? (
                      <Check size={17} aria-hidden="true" />
                    ) : (
                      <Plus size={17} aria-hidden="true" />
                    )}
                  </button>
                  <a
                    className="music-track-open"
                    href={track.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={"Open " + track.name + " on Spotify"}
                    title="Open on Spotify"
                  >
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="music-results-empty" aria-hidden="true">
              <Disc3 size={42} strokeWidth={1.1} />
            </div>
          )}

          {selected && (
            <form className="music-drop-form" onSubmit={submitDrop}>
              <div className="music-selected-track">
                <TrackArtwork track={selected} sizes="58px" />
                <div>
                  <span>Selected for public pinboard</span>
                  <strong>{selected.name}</strong>
                  <small>{selected.artists}</small>
                </div>
              </div>

              <div className="music-drop-fields">
                <label>
                  <span>Your name / optional</span>
                  <input
                    value={sender}
                    onChange={(event) => setSender(event.target.value)}
                    maxLength={24}
                    autoComplete="name"
                  />
                </label>
                <label>
                  <span>The note / public</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={240}
                    rows={3}
                    required
                  />
                </label>
              </div>

              <div className="music-drop-foot">
                <span className={"music-drop-message is-" + dropState} aria-live="polite">
                  {dropMessage || note.length + " / 240"}
                </span>
                <button
                  type="submit"
                  className="button button-light"
                  disabled={dropState === "loading"}
                >
                  {dropState === "loading" ? (
                    <LoaderCircle className="is-spinning" size={16} aria-hidden="true" />
                  ) : (
                    <Send size={16} aria-hidden="true" />
                  )}
                  Pin song
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="music-pinboard" aria-labelledby="music-pinboard-title">
          <div className="music-pinboard-head">
            <div>
              <span>02 / Public pinboard</span>
              <h3 id="music-pinboard-title">Songs people left here.</h3>
            </div>

          </div>

          <div
            className="music-pin-rail"
            ref={pinRailRef}
            tabIndex={0}
            aria-label="Recently pinned songs"
          >
            {pinState === "loading" ? (
              <div className="music-pin-page is-loading" aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <div className="music-pin-placeholder" key={index} />
                ))}
              </div>
            ) : pins.length ? (
              Array.from({ length: Math.ceil(pins.length / 6) }, (_, pageIndex) => (
                <div
                  className="music-pin-page"
                  key={pins[pageIndex * 6]?.id ?? pageIndex}
                  role="group"
                  aria-label={
                    "Pinned songs " +
                    (pageIndex * 6 + 1) +
                    " to " +
                    Math.min((pageIndex + 1) * 6, pins.length)
                  }
                >
                  {pins.slice(pageIndex * 6, (pageIndex + 1) * 6).map((pin) => (
                    <a
                      className="music-pin-card"
                      key={pin.id}
                      href={pin.track.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={
                        "Listen to " + pin.track.name + " by " + pin.track.artists + " on Spotify"
                      }
                    >
                      <div className="music-pin-track">
                        <TrackArtwork track={pin.track} sizes="64px" />
                        <div>
                          <strong>{pin.track.name}</strong>
                          <small>{pin.track.artists}</small>
                        </div>
                      </div>
                      <blockquote>
                        {pin.note} <cite>~ {pin.sender}</cite>
                      </blockquote>
                      <time className="music-pin-date" dateTime={pin.createdAt}>
                        {formatPinDate(pin.createdAt)}
                      </time>
                    </a>
                  ))}
                </div>
              ))
            ) : (
              <div className="music-pin-empty">
                <Pin size={25} strokeWidth={1.4} aria-hidden="true" />
                <strong>No songs pinned yet.</strong>
                <span>
                  {pinState === "error"
                    ? "The board is taking a quiet minute."
                    : "Use the search above to leave the first one."}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="music-take-channel" aria-labelledby="music-take-title">
          <div className="music-channel-head">
            <span>03 / Take</span>
            <h3 id="music-take-title">Something from my side.</h3>
          </div>

          <div className={"music-gift-stage" + (gift ? " has-track" : "")}>
            {gift ? (
              <>
                <TrackArtwork track={gift} sizes="(max-width: 680px) 78vw, 360px" />
                <div className="music-gift-copy">
                  <span>Random pull</span>
                  <strong>{gift.name}</strong>
                  <p>{gift.artists}</p>
                  <a href={gift.spotifyUrl} target="_blank" rel="noreferrer">
                    Open on Spotify
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </>
            ) : (
              <div className="music-gift-idle">
                <Disc3 size={76} strokeWidth={0.8} aria-hidden="true" />
                <span>One pull. No algorithmic explanation.</span>
              </div>
            )}
          </div>

          <div className="music-random-control">
            <p className={"is-" + randomState} aria-live="polite">
              {randomMessage}
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={drawRandomTrack}
              disabled={randomState === "loading"}
            >
              {randomState === "loading" ? (
                <LoaderCircle className="is-spinning" size={17} aria-hidden="true" />
              ) : (
                <Shuffle size={17} aria-hidden="true" />
              )}
              {gift ? "Another one" : "Give me a song"}
            </button>
          </div>
        </section>
      </div>

      <div className="music-exchange-foot">
        <span>Source / Spotify</span>
        <span>Destination / public pinboard</span>
      </div>
    </div>
  );
}
