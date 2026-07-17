"use client";

import {
  AudioLines,
  Clock3,
  Gamepad2,
  GitCommitHorizontal,
  MoveUpRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LivePayload } from "@/lib/live-types";

const initialPayload: LivePayload = {
  generatedAt: new Date(0).toISOString(),
  github: {
    state: "snapshot",
    title: "Pronaaf2k",
    detail: "Reading public GitHub activity",
    meta: "Connecting signal",
    href: "https://github.com/Pronaaf2k",
  },
  steam: {
    state: "snapshot",
    title: "Off the clock",
    detail: "Steam profile snapshot",
    meta: "Live presence not connected",
    href: "https://steamcommunity.com/id/Samiyeel/",
  },
  spotify: {
    state: "offline",
    title: "Listening offline",
    detail: "No current track signal",
    meta: "Spotify account not connected",
    href: "#music-exchange",
  },
};

function getDhakaTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function LiveSignal() {
  const [payload, setPayload] = useState<LivePayload>(initialPayload);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let signalTimer: number | undefined;
    let reading = false;
    let stopped = false;

    const scheduleNextRead = (delayMs: number) => {
      window.clearTimeout(signalTimer);
      signalTimer = window.setTimeout(
        readSignal,
        Math.min(Math.max(delayMs, 5_000), 30 * 60_000),
      );
    };

    const readSignal = async () => {
      if (reading || stopped) return;
      reading = true;
      window.clearTimeout(signalTimer);

      let nextReadMs = 60_000;
      try {
        const response = await fetch("/api/live", { cache: "no-store" });
        if (!response.ok) return;
        const nextPayload = (await response.json()) as LivePayload;
        setPayload(nextPayload);
        nextReadMs = nextPayload.spotify.refreshAfterMs ?? nextReadMs;
      } catch {
        // The snapshots stay useful when a provider is unavailable.
      } finally {
        reading = false;
        if (!stopped) scheduleNextRead(nextReadMs);
      }
    };

    const readWhenVisible = () => {
      if (document.visibilityState === "visible") readSignal();
    };

    readSignal();
    const clockStartTimer = window.setTimeout(() => setNow(new Date()), 0);
    const clockTimer = window.setInterval(() => setNow(new Date()), 1_000);
    window.addEventListener("focus", readSignal);
    document.addEventListener("visibilitychange", readWhenVisible);

    return () => {
      stopped = true;
      window.clearTimeout(clockStartTimer);
      window.clearTimeout(signalTimer);
      window.clearInterval(clockTimer);
      window.removeEventListener("focus", readSignal);
      document.removeEventListener("visibilitychange", readWhenVisible);
    };
  }, []);

  const channels = useMemo(
    () => [
      {
        id: "github",
        label: "Shipping",
        icon: GitCommitHorizontal,
        signal: payload.github,
      },
      {
        id: "steam",
        label: "Off clock",
        icon: Gamepad2,
        signal: payload.steam,
      },
      {
        id: "spotify",
        label: "Listening",
        icon: AudioLines,
        signal: payload.spotify,
      },
      {
        id: "dhaka",
        label: "Local",
        icon: Clock3,
        signal: {
          state: "live" as const,
          title: now ? getDhakaTime(now) : "--:--:--",
          detail: "Dhaka, Bangladesh",
          meta: "UTC +06:00",
          href: "#contact",
        },
      },
    ],
    [now, payload],
  );

  return (
    <div className="signal-grid">
      {channels.map(({ id, label, icon: Icon, signal }) => (
        <a
          className={"signal-channel signal-" + signal.state}
          href={signal.href}
          target={signal.href.startsWith("http") ? "_blank" : undefined}
          rel={signal.href.startsWith("http") ? "noreferrer" : undefined}
          key={id}
        >
          <div className="signal-channel-head">
            <span className="signal-label">
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </span>
            <span className="signal-state">
              <i aria-hidden="true" />
              {signal.state}
            </span>
          </div>
          <strong>{signal.title}</strong>
          <p>{signal.detail}</p>
          <div className="signal-channel-foot">
            <span>{signal.meta}</span>
            <MoveUpRight size={15} aria-hidden="true" />
          </div>
        </a>
      ))}
    </div>
  );
}
