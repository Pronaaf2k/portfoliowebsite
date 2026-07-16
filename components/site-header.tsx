"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { label: "Work", href: "/#work" },
  { label: "Live", href: "/#live" },
  { label: "Proof", href: "/#proof" },
  { label: "Loadout", href: "/loadout" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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
            <small>Dhaka / UTC+6</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <a className="availability" href="mailto:benaaf2000@gmail.com">
          <span className="status-dot" aria-hidden="true" />
          Open to work
        </a>

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
