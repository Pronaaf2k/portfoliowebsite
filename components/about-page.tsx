"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Mail, Radio } from "lucide-react";
import { type PointerEvent, useRef } from "react";

import { LiveSignal } from "@/components/live-signal";
import { SiteHeader } from "@/components/site-header";
import { experience, profile } from "@/lib/data";

import styles from "@/app/about-me/about.module.css";

const workExperience = experience.filter((item) => item.kind === "work");
const academicExperience = experience.filter((item) => item.kind === "academic");

export function AboutPage() {
  const portraitRef = useRef<HTMLDivElement>(null);

  const movePortrait = (event: PointerEvent<HTMLDivElement>) => {
    const node = portraitRef.current;
    if (!node) return;

    const bounds = node.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    node.style.setProperty("--portrait-x", x.toFixed(3));
    node.style.setProperty("--portrait-y", y.toFixed(3));
  };

  const resetPortrait = () => {
    portraitRef.current?.style.setProperty("--portrait-x", "0");
    portraitRef.current?.style.setProperty("--portrait-y", "0");
  };

  const timeline = (items: typeof experience) => (
    <div className={styles.timelineList}>
      {items.map((item, index) => (
        <article className={styles.timelineItem} key={`${item.place}-${item.period}`}>
          <span className={styles.timelineNumber}>{String(index + 1).padStart(2, "0")}</span>
          <p className={styles.timelinePeriod}>{item.period.replaceAll("\u2014", "/")}</p>
          <div>
            <h3>{item.title}</h3>
            <p className={styles.timelineCompany}>{item.place}</p>
          </div>
          <p className={styles.timelineCopy}>{item.detail}</p>
        </article>
      ))}
    </div>
  );

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>ABOUT / DHAKA</p>
            <h1 id="about-title">Samiyeel Alim Binaaf.</h1>
            <p className={styles.heroStatement}>Full-stack developer and CSE undergraduate.</p>
            <p className={styles.heroLead}>
              I build accessible products, AI/ML tools, and secure full-stack systems.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#work-experience">
                Experience <ArrowDown aria-hidden="true" />
              </a>
              <a className={styles.secondaryAction} href={`mailto:${profile.email}`}>
                Contact <Mail aria-hidden="true" />
              </a>
            </div>

            <dl className={styles.identityRail}>
              <div>
                <dt>Based</dt>
                <dd>Dhaka, Bangladesh</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>Full-stack + AI/ML</dd>
              </div>
              <div>
                <dt>Online</dt>
                <dd>Pronaaf2k</dd>
              </div>
            </dl>
          </div>

          <div
            ref={portraitRef}
            className={styles.portraitStage}
            onPointerMove={movePortrait}
            onPointerLeave={resetPortrait}
          >
            <Image
              className={styles.portrait}
              src="/images/samiyeel-profile.webp"
              alt="Portrait of Samiyeel Alim Binaaf"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
            />
            <div className={styles.portraitWash} aria-hidden="true" />
            <div className={styles.portraitReadout}>
              <span>SAMIYEEL / PRONAAF2K</span>
              <strong>BUILDER</strong>
              <span>FULL-STACK + AI/ML</span>
            </div>
            <div className={styles.portraitCoordinates} aria-hidden="true">
              <span>23.8041 N</span>
              <span>DHAKA</span>
              <span>90.4152 E</span>
            </div>
          </div>
        </div>
      </section>
      <section className="live-band" id="activity" aria-labelledby="activity-title">
        <div className="shell">
          <div className="live-heading">
            <div>
              <p className="eyebrow">
                <Radio size={14} aria-hidden="true" />
                Current activity
              </p>
              <h2 id="activity-title">A portfolio that changes while I do.</h2>
            </div>
            <p>Recent GitHub activity, listening, play, and the current time in Dhaka.</p>
          </div>
          <LiveSignal />
        </div>
      </section>
      <section className={`${styles.timeline} ${styles.workTimeline}`} id="work-experience" aria-labelledby="work-title">
        <div className={styles.shell}>
          <header className={styles.timelineHeading}>
            <p className={styles.sectionLabel}>EXPERIENCE / WORK</p>
            <h2 id="work-title">Working experience.</h2>
          </header>
          {timeline(workExperience)}
        </div>
      </section>

      <section className={`${styles.timeline} ${styles.academicTimeline}`} aria-labelledby="academic-title">
        <div className={styles.shell}>
          <header className={styles.timelineHeading}>
            <p className={styles.sectionLabel}>EXPERIENCE / ACADEMIC</p>
            <h2 id="academic-title">Academic experience.</h2>
          </header>
          {timeline(academicExperience)}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <strong>Samiyeel Alim Binaaf</strong>
            <span>Full-stack + AI/ML developer / Dhaka</span>
          </div>
          <div className={styles.footerLinks}>
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <Link href="/loadout">Loadout</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
