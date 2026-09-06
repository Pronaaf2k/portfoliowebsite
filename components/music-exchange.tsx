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
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type {
  MusicDropResponse,
  MusicPin,
  MusicPinsResponse,
  MusicRandomResponse,
  MusicSearchResponse,
  MusicTrack,
} from "@/lib/music-types";

type RequestState = "idle" | "loading" | "success" | "error";

const PIN_CAROUSEL_PAGE_SIZE = 6;

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

function MusicPinRail({
  pages,
  hidden = false,
}: {
  pages: MusicPin[][];
  hidden?: boolean;
}) {
  return (
    <div className="music-pin-rail" aria-hidden={hidden || undefined}>
      {pages.map((pagePins, pageIndex) => (
        <div
          className="music-pin-page"
          key={(hidden ? "duplicate-" : "") + (pagePins[0]?.id ?? pageIndex)}
          role="group"
          aria-label={
            "Pinned song group " + (pageIndex + 1)
          }
        >
          {pagePins.map((pin, pinIndex) => (
            <a
              className="music-pin-card"
              key={pin.id + "-" + pageIndex + "-" + pinIndex}
              tabIndex={hidden ? -1 : undefined}
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
      ))}
    </div>
  );
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
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const activeSearchRef = useRef<AbortController | null>(null);
  const hasDrawnGiftRef = useRef(false);

  const pinPages = pins.length
    ? Array.from(
        { length: Math.ceil(pins.length / PIN_CAROUSEL_PAGE_SIZE) },
        (_, pageIndex) => Array.from(
          { length: PIN_CAROUSEL_PAGE_SIZE },
          (_, offset) => pins[
            (pageIndex * PIN_CAROUSEL_PAGE_SIZE + offset) % pins.length
          ],
        ),
      )
    : [];

  const getCarouselSegmentWidth = () => {
    const carousel = carouselRef.current;
    if (!carousel) return 0;

    const rails = carousel.querySelectorAll<HTMLElement>(".music-pin-rail");
    if (rails.length > 1) {
      return rails[1].getBoundingClientRect().left - rails[0].getBoundingClientRect().left;
    }

    return carousel.scrollWidth / 3;
  };

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
    const carousel = carouselRef.current;
    if (!carousel || !pinPages.length) return;

    const segmentWidth = () => getCarouselSegmentWidth();
    carousel.scrollLeft = segmentWidth();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalId = window.setInterval(() => {
      const segment = segmentWidth();
      if (!segment || isDraggingRef.current) return;

      if (carousel.scrollLeft >= segment * 2) carousel.scrollLeft -= segment;
      if (carousel.scrollLeft <= 0) carousel.scrollLeft += segment;
      carousel.scrollLeft += 1;
    }, 24);

    return () => window.clearInterval(intervalId);
  }, [pinPages.length]);

  const handleCarouselPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    isDraggingRef.current = true;
    suppressClickRef.current = false;
    setIsDragging(true);
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = carousel.scrollLeft;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCarouselPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel || !isDraggingRef.current) return;

    const movement = event.clientX - dragStartXRef.current;
    if (Math.abs(movement) > 4) suppressClickRef.current = true;

    const segment = getCarouselSegmentWidth();
    let nextScroll = dragStartScrollRef.current - movement;
    if (segment) {
      if (nextScroll >= segment * 2) nextScroll -= segment;
      if (nextScroll <= 0) nextScroll += segment;
    }
    carousel.scrollLeft = nextScroll;
  };

  const handleCarouselPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const searchTracks = useCallback(async (rawQuery: string) => {
    const value = rawQuery.trim();

    if (value.length < 2) {
      setResults([]);
      setSearchState("idle");
      setSearchMessage(value ? "Type at least two characters" : "Waiting for a track");
      return;
    }

    activeSearchRef.current?.abort();
    const controller = new AbortController();
    activeSearchRef.current = controller;
    setSearchState("loading");
    setSearchMessage("Reading the Spotify catalogue");

    try {
      const response = await fetch("/api/music/search?q=" + encodeURIComponent(value), {
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = (await response.json()) as MusicSearchResponse;

      if (!response.ok) throw new Error(getError(payload, "Search is unavailable"));
      if (controller.signal.aborted) return;

      setResults(payload.tracks);
      setSearchState("success");
      setSearchMessage(
        payload.tracks.length ? payload.tracks.length + " matches" : "No matching tracks",
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setResults([]);
      setSearchState("error");
      setSearchMessage(error instanceof Error ? error.message : "Search is unavailable");
    } finally {
      if (activeSearchRef.current === controller) activeSearchRef.current = null;
    }
  }, []);

  useEffect(() => {
    activeSearchRef.current?.abort();
    const value = query.trim();
    if (value.length < 2) return;

    const timer = window.setTimeout(() => void searchTracks(value), 250);
    return () => window.clearTimeout(timer);
  }, [query, searchTracks]);

  useEffect(() => () => activeSearchRef.current?.abort(), []);

  const updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      activeSearchRef.current?.abort();
      setResults([]);
      setSearchState("idle");
      setSearchMessage(value.trim() ? "Type at least two characters" : "Waiting for a track");
    }
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void searchTracks(query);
  };

  const chooseTrack = (track: MusicTrack) => {
    setSelected(track);
    setQuery("");
    setResults([]);
    setSearchState("idle");
    setSearchMessage("Waiting for a track");
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
      setQuery("");
      setResults([]);
      setSearchState("idle");
      setSearchMessage("Waiting for a track");
      void loadPins();
    } catch (error) {
      setDropState("error");
      setDropMessage(error instanceof Error ? error.message : "The note could not be sent");
    }
  };

  const drawRandomTrack = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hasDrawnGiftRef.current) return;
      hasDrawnGiftRef.current = true;
      void drawRandomTrack();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [drawRandomTrack]);

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
            <h3 id="music-send-title" className="music-section-phrase">
              Leave me a song you always come back to.
            </h3>
          </div>

          <form className="music-search-form" onSubmit={submitSearch}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={updateQuery}
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
              <h3 id="music-pinboard-title" className="music-section-phrase">
                Pieces of your worlds, left here with me.
              </h3>
            </div>
          </div>

          <div
            ref={carouselRef}
            className={"music-pin-carousel" + (isDragging ? " is-dragging" : "")}
            tabIndex={0}
            aria-label="Public pinned songs. Drag horizontally to explore."
            onPointerDown={handleCarouselPointerDown}
            onPointerMove={handleCarouselPointerMove}
            onPointerUp={handleCarouselPointerEnd}
            onPointerCancel={handleCarouselPointerEnd}
            onClickCapture={(event) => {
              if (!suppressClickRef.current) return;
              event.preventDefault();
              event.stopPropagation();
              suppressClickRef.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              carouselRef.current?.scrollBy({
                left: event.key === "ArrowRight" ? 240 : -240,
                behavior: "smooth",
              });
            }}
            onDragStart={(event) => event.preventDefault()}
          >
            {pinState === "loading" ? (
              <div className="music-pin-page is-loading" aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <div className="music-pin-placeholder" key={index} />
                ))}
              </div>
            ) : pins.length ? (
              <div className="music-pin-track-loop">
                <MusicPinRail pages={pinPages} hidden />
                <MusicPinRail pages={pinPages} />
                <MusicPinRail pages={pinPages} hidden />
              </div>
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

        <section className="music-take-channel" aria-label="Take a song">
          <div className="music-channel-head">
            <span>03 / Take</span>
            <p className="music-section-phrase">
              A small piece of my world, left here just for you.
            </p>
          </div>

          <div className={"music-gift-stage" + (gift ? " has-track" : "")}>
            {gift ? (
              <>
                <TrackArtwork track={gift} sizes="(max-width: 680px) 78vw, 360px" />
                <div className="music-gift-copy">
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
                <span aria-live="polite">
                  {randomState === "error"
                    ? randomMessage
                    : "Finding something from my side."}
                </span>
                {randomState === "error" && (
                  <button
                    type="button"
                    className="button button-primary music-gift-button"
                    onClick={drawRandomTrack}
                  >
                    <Shuffle size={17} aria-hidden="true" />
                    Try another song
                  </button>
                )}
              </div>
            )}
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
