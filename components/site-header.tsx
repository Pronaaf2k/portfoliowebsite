"use client";

import Link from "next/link";
import { Clock3, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { label: "Portfolio", href: "/#work" },
  { label: "Skills", href: "/#skills" },
  { label: "Music", href: "/#music-exchange" },
  { label: "Contact", href: "/#contact" },
  { label: "About", href: "/about-me" },
  { label: "Loadout", href: "/loadout" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dhakaTime, setDhakaTime] = useState("--:--");

  useEffect(() => {
    const updateTime = () => {
      setDhakaTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };

    const startTimer = window.setTimeout(updateTime, 0);
    const clockTimer = window.setInterval(updateTime, 30_000);
    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);

    if (!open) return () => document.body.classList.remove("menu-open");

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Samiyeel Alim Binaaf, home">
          <span className="brand-mark">S/AB</span>
          <span className="brand-copy">
            Samiyeel
            <small>Dhaka / {dhakaTime}</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="availability local-time" aria-label={`Dhaka local time ${dhakaTime}`}>
          <Clock3 size={15} aria-hidden="true" />
          <span className="local-time-copy">
            <small>Dhaka local</small>
            <strong>{dhakaTime}</strong>
          </span>
        </div>

        <button
          className="icon-button menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          title={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className={"mobile-nav " + (open ? "is-open" : "")}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        {links.map((link) => (
          <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <a href="mailto:benaaf2000@gmail.com" onClick={() => setOpen(false)}>
          Start a conversation
        </a>
      </nav>
    </header>
  );
}
