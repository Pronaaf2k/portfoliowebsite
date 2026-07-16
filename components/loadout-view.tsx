"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Blocks,
  Cpu,
  Gamepad2,
  Keyboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  esportsPresence,
  gameReceipts,
  loadoutGroups,
  profile,
  tournamentResults,
} from "@/lib/data";
import { AimChallenge } from "@/components/aim-challenge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";

type GroupKey = keyof typeof loadoutGroups;

const tabs: Array<{
  key: GroupKey;
  label: string;
  icon: typeof Blocks;
  title: string;
  intro: string;
}> = [
  {
    key: "tools",
    label: "Tools",
    icon: Blocks,
    title: "The software that leaves fingerprints.",
    intro:
      "Grouped by the job it does, because a wall of technology badges never explained how anyone actually builds.",
  },
  {
    key: "rig",
    label: "Rig",
    icon: Cpu,
    title: "Built for work, frame time, and experiments.",
    intro:
      "A work-and-play machine with enough GPU and memory headroom for visual work, local models, and irresponsible multitasking.",
  },
  {
    key: "desk",
    label: "Desk",
    icon: Keyboard,
    title: "The physical interface.",
    intro:
      "Small, practical choices that make long sessions feel quieter and inputs feel more predictable.",
  },
  {
    key: "play",
    label: "Play",
    icon: Gamepad2,
    title: "The competitive archive of Pronaaf2k.",
    intro:
      "Gaming stays off the main pitch, but the aliases, peak ranks, teams, and tournament runs are part of the person behind the work.",
  },
];

const meterWidths = ["74%", "58%", "66%", "50%"];

export function LoadoutView() {
  const [active, setActive] = useState<GroupKey>("tools");
  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0];
  const ActiveIcon = activeTab.icon;

  useEffect(() => {
    const hashTimer = window.setTimeout(() => {
      const requestedTab = window.location.hash.slice(1) as GroupKey;
      if (tabs.some((tab) => tab.key === requestedTab)) {
        setActive(requestedTab);
      }
    }, 0);

    return () => window.clearTimeout(hashTimer);
  }, []);

  const selectTab = (key: GroupKey) => {
    setActive(key);
    window.history.replaceState(null, "", "#" + key);
  };

  return (
    <>
      <SiteHeader />

      <main className="loadout-page">
        <section className="loadout-hero" aria-labelledby="loadout-page-title">
          <div className="shell loadout-hero-layout">
            <div>
              <Link className="back-link" href="/">
                <ArrowLeft size={17} aria-hidden="true" />
                Home
              </Link>
              <p className="eyebrow">Samiyeel / competitive + systems</p>
              <h1 id="loadout-page-title">
                <span>Pronaaf2k</span>
                <span>Loadout</span>
              </h1>
              <p className="loadout-hero-copy">
                The daily systems and off-hours archive of Samiyeel Alim Binaaf, also
                known online and in competitive play as Pronaaf2k.
              </p>
            </div>

            <div className="rig-readout" aria-label="Current system summary">
              <div className="rig-readout-head">
                <span>SYSTEM / READY</span>
                <i aria-hidden="true" />
              </div>
              <div className="rig-spec-line">
                <div className="rig-spec">
                  <span>RAM</span>
                  <strong>32 GB</strong>
                </div>
                <div className="rig-spec">
                  <span>CPU</span>
                  <strong>7800X3D</strong>
                </div>
                <div className="rig-spec">
                  <span>GPU</span>
                  <strong>RTX 5070 Ti</strong>
                </div>
              </div>
              <div className="rig-bars" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, index) => (
                  <i key={index} style={{ height: 12 + ((index * 13) % 44) }} />
                ))}
              </div>
              <div className="rig-coordinates">
                <span>24.0 N</span>
                <span>90.4 E</span>
                <span>UTC+6</span>
              </div>
            </div>
          </div>
        </section>

        <section className="loadout-game" aria-label="Aim challenge">
          <div className="shell">
            <ScrollReveal>
              <AimChallenge />
            </ScrollReveal>
          </div>
        </section>

        <section className="loadout-content">
          <div className="shell">
            <div className="loadout-tabs" role="tablist" aria-label="Loadout categories">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active === key}
                  aria-controls={"panel-" + key}
                  id={"tab-" + key}
                  className={active === key ? "is-active" : ""}
                  onClick={() => selectTab(key)}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            <div
              className="loadout-panel"
              id={"panel-" + active}
              role="tabpanel"
              aria-labelledby={"tab-" + active}
            >
              <ScrollReveal className="loadout-panel-intro">
                <div className="loadout-panel-icon">
                  <ActiveIcon size={28} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <p className="eyebrow">{activeTab.label} profile</p>
                  <h2>{activeTab.title}</h2>
                  <p>{activeTab.intro}</p>
                </div>
              </ScrollReveal>

              <div className="loadout-item-list">
                {loadoutGroups[active].map(([label, value, note], index) => (
                  <ScrollReveal key={label} delay={index * 55}>
                    <article className="loadout-item">
                      <span className="loadout-item-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <span>{label}</span>
                        <h3>{value}</h3>
                      </div>
                      <p>{note}</p>
                      {active === "play" ? (
                        <div className="aim-meter" aria-hidden="true">
                          <i style={{ width: meterWidths[index] }} />
                        </div>
                      ) : (
                        <span className="item-status">ACTIVE</span>
                      )}
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            <ScrollReveal className="match-history">
                  <div className="match-history-head">
                    <div>
                      <p className="eyebrow">Off the clock / match history</p>
                      <h2>Ranks, teams, and tournament runs.</h2>
                    </div>
                    <p>
                      Secondary to the work, still part of the story. This is the archive
                      for the competitive side rather than the homepage headline.
                    </p>
                  </div>

                  <div className="match-rank-grid">
                    {gameReceipts.map((receipt) => (
                      <article className="match-rank" key={receipt.game}>
                        <span>{receipt.game}</span>
                        <strong>{receipt.peak}</strong>
                        <p>{receipt.detail}</p>
                      </article>
                    ))}
                  </div>

                  <div className="match-history-label">
                    <span>Documented competitive presence</span>
                    <small>External records linking the Pronaaf2k handle to competition.</small>
                  </div>
                  <nav className="esports-presence" aria-label="Pronaaf2k competitive profiles">
                    {esportsPresence.map((item) => (
                      <a href={item.href} target="_blank" rel="noreferrer" key={item.platform}>
                        <span>{item.platform}</span>
                        <strong>{item.handle}</strong>
                        <p>{item.detail}</p>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    ))}
                  </nav>

                  <div className="match-history-label match-history-label-results">
                    <span>Player-reported achievements</span>
                    <small>Team names appear beside each tournament run.</small>
                  </div>
                  <ul className="match-results" aria-label="Player-reported tournament achievements">
                    {tournamentResults.map((result) => (
                      <li key={result.game + result.event}>
                        <span>{result.game}</span>
                        <strong>{result.placement}</strong>
                        <p>{result.event}</p>
                        <small>{result.team ?? "Team not listed"}</small>
                      </li>
                    ))}
                  </ul>
            </ScrollReveal>
          </div>
        </section>

        <section className="loadout-principle">
          <div className="shell">
            <ScrollReveal>
              <p className="eyebrow">Selection rule</p>
              <blockquote>
                Keep the tools that disappear while you use them. Tune the rest until
                they do.
              </blockquote>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="loadout-footer">
        <div className="shell">
          <div>
            <span>Samiyeel Alim Binaaf</span>
            <span>Current loadout / 2026</span>
          </div>
          <a href={"mailto:" + profile.email}>
            Talk shop
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </>
  );
}