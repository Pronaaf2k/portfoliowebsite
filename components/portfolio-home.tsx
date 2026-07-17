"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Code2,
  Gamepad2,
  Mail,
  Network,
  Radio,
} from "lucide-react";
import { experience, profile, projects, proofPoints, type Project } from "@/lib/data";
import { LiveSignal } from "@/components/live-signal";
import { MusicExchange } from "@/components/music-exchange";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SignalScope } from "@/components/signal-scope";
import { SiteHeader } from "@/components/site-header";
import { TiltCard } from "@/components/tilt-card";

function SectionHeading({
  id,
  eyebrow,
  title,
  copy,
}: {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

const featuredProjects = projects.filter((project) => project.featured);
const archivedProjects = projects.filter((project) => !project.featured);

function ProjectTile({ project, index }: { project: Project; index: number }) {
  return (
    <ScrollReveal
      className={project.featured ? "project-wrap project-wrap-featured" : "project-wrap"}
      delay={(index % 3) * 70}
    >
      <TiltCard
        className={
          "project-card accent-" +
          project.accent +
          (project.featured ? " project-featured" : "")
        }
      >
        <a className="project-primary-link" href={project.href} target="_blank" rel="noreferrer">
          <div className="project-media">
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes={
                project.featured
                  ? "(max-width: 720px) 100vw, 66vw"
                  : "(max-width: 720px) 100vw, 33vw"
              }
            />
          </div>

          <div className="project-body">
            <div className="project-meta">
              <span>{project.kind}</span>
              <span>{project.year}</span>
            </div>
            <h3>{project.title}</h3>
            <p className="project-statement">{project.statement}</p>
            <p className="project-description">{project.description}</p>
            <div className="project-proof">{project.proof}</div>
            <div className="project-foot">
              <ul aria-label={project.title + " technologies"}>
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <span className="project-link" aria-label={"Open " + project.title}>
                <ArrowUpRight size={19} />
              </span>
            </div>
          </div>
        </a>
        {project.secondaryHref && project.secondaryLabel ? (
          <a
            className="project-secondary-link"
            href={project.secondaryHref}
            target="_blank"
            rel="noreferrer"
          >
            <span>{project.secondaryLabel}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ) : null}
      </TiltCard>
    </ScrollReveal>
  );
}
export function PortfolioHome() {
  const [isProjectArchiveOpen, setIsProjectArchiveOpen] = useState(false);

  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <Image
            className="hero-portrait"
            src="/images/samiyeel-profile.webp"
            alt="Portrait of Samiyeel Alim Binaaf, also known online as Pronaaf2k"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-wash" aria-hidden="true" />

          <div className="shell hero-inner">
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow">
                <span className="status-dot" aria-hidden="true" />
                Dhaka / available for serious builds
              </p>

              <h1 id="hero-title">
                <span>Samiyeel</span>
                <span>Alim Binaaf</span>
              </h1>

              <p className="hero-thesis">
                Builder by instinct.
                <br />
                Full-stack by practice.
              </p>

              <p className="hero-intro">
                I turn static pages into live systems, tune interfaces until they feel
                right, and build AI experiments that solve something outside the notebook.
              </p>

              <p className="hero-alias">
                <span>Full-stack + AI/ML developer / also online as</span>
                <strong>Pronaaf2k</strong>
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#work">
                  See the work
                  <ArrowDown size={17} aria-hidden="true" />
                </a>
                <a
                  className="button button-secondary"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="hero-scope">
                <SignalScope />
              </div>

              <div className="hero-stamp">
                <span>SYSTEMS / INTERFACES</span>
                <strong>BUILDER</strong>
                <small>PRODUCT + CODE</small>
              </div>
            </div>
          </div>
        </section>

        <section className="live-band" id="live" aria-labelledby="live-title">
          <div className="shell">
            <ScrollReveal>
              <div className="live-heading">
                <div>
                  <p className="eyebrow">
                    <Radio size={14} aria-hidden="true" />
                    Live signal
                  </p>
                  <h2 id="live-title">A portfolio that changes while I do.</h2>
                </div>
                <p>
                  Recent work, current interests, what is on, and the time in Dhaka. No
                  polished timeline, just the actual signals.
                </p>
              </div>
            </ScrollReveal>
            <LiveSignal />
          </div>
        </section>

        <section className="work-section section" id="work" aria-labelledby="work-title">
          <div className="shell">
            <ScrollReveal>
              <SectionHeading
                id="work-title"
                eyebrow="Selected work"
                title="Work that left localhost."
                copy="Production infrastructure, low-resource language AI, music data, accessibility, education, and visual ML. Different shapes, same habit: find the useful system inside the idea."
              />
            </ScrollReveal>

            <div className="project-grid project-grid-featured">
              {featuredProjects.map((project, index) => (
                <ProjectTile key={project.slug} project={project} index={index} />
              ))}
            </div>

            <div className="project-archive-control">
              <div className="project-archive-summary">
                <span>Project archive</span>
                <strong>{archivedProjects.length} more builds</strong>
              </div>
              <button
                type="button"
                className={
                  "button project-archive-toggle" +
                  (isProjectArchiveOpen ? " is-open" : "")
                }
                aria-expanded={isProjectArchiveOpen}
                aria-controls="project-archive"
                onClick={() => setIsProjectArchiveOpen((current) => !current)}
              >
                {isProjectArchiveOpen
                  ? "Hide project archive"
                  : "View " + archivedProjects.length + " more projects"}
                <ChevronDown size={17} aria-hidden="true" />
              </button>
            </div>

            <div
              id="project-archive"
              className="project-archive"
              hidden={!isProjectArchiveOpen}
            >
              <div className="project-grid project-grid-archive">
                {archivedProjects.map((project, index) => (
                  <ProjectTile
                    key={project.slug}
                    project={project}
                    index={index + featuredProjects.length}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="receipts-section section" id="proof" aria-labelledby="proof-title">
          <div className="shell">
            <ScrollReveal>
              <SectionHeading
                id="proof-title"
                eyebrow="Selected proof"
                title="Proof, not a skill cloud."
                copy="Production systems, product judgment, teaching, and hackathon pressure. A clearer answer to what I can own when an idea has to become real."
              />
            </ScrollReveal>

            <div className="receipt-board">
              {proofPoints.map((proof, index) => (
                <ScrollReveal key={proof.label} delay={index * 60}>
                  <div className={"receipt-row accent-" + proof.accent}>
                    <div>
                      <span>{proof.label}</span>
                      <strong>{proof.value}</strong>
                    </div>
                    <p>{proof.detail}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <blockquote className="pressure-note">
                <p>
                  The build is only half the work. Presentation and market alignment decide
                  whether good work gets understood.
                </p>
                <footer>What SOLVIO AI taught me after a Top 20 / 900 finish</footer>
              </blockquote>
            </ScrollReveal>
          </div>
        </section>

        <section
          className="story-section section"
          id="about"
          aria-labelledby="story-title"
        >
          <div className="shell story-layout">
            <ScrollReveal className="story-intro">
              <p className="eyebrow">Builder log</p>
              <h2 id="story-title">The resume is useful. The pattern is better.</h2>
              <p>
                I like owning the awkward middle between idea and shipped thing: interface,
                server, business rules, edge cases, and the sentence that explains why it
                matters.
              </p>
            </ScrollReveal>

            <div className="timeline">
              {experience.map((item, index) => (
                <ScrollReveal key={item.title + item.place} delay={index * 60}>
                  <article className="timeline-row">
                    <div className="timeline-period">{item.period}</div>
                    <div>
                      <p>{item.place}</p>
                      <h3>{item.title}</h3>
                    </div>
                    <p>{item.detail}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section
          className="next-build section"
          id="music-exchange"
          aria-labelledby="next-build-title"
        >
          <div className="shell">
            <ScrollReveal className="next-build-intro">
              <p className="eyebrow">Next build / music x people</p>
              <div className="next-build-heading">
                <h2 id="next-build-title">Leave me a song. Take one back.</h2>
                <p>
                  A small exchange for people who would rather send a track than explain
                  themselves.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <MusicExchange />
            </ScrollReveal>
          </div>
        </section>

        <section className="loadout-teaser section" aria-labelledby="loadout-title">
          <div className="shell loadout-layout">
            <ScrollReveal>
              <p className="eyebrow">Loadout / tuned daily</p>
              <h2 id="loadout-title">Everything has a setting.</h2>
              <p>
                Dev stack, creative tools, desk, peripherals, and the PC underneath it all.
                Match history has its own off-hours tab instead of owning the story.
              </p>
              <Link className="text-link" href="/loadout">
                Open full loadout
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </ScrollReveal>

            <ScrollReveal className="loadout-console" delay={100}>
              <div className="console-head">
                <span>WORK PROFILE</span>
                <i aria-hidden="true" />
                <span>SAMIYEEL</span>
              </div>
              <div className="console-main">
                <div>
                  <span>FRONTEND</span>
                  <strong>REACT<br />NEXT.JS</strong>
                </div>
                <div>
                  <span>BACKEND</span>
                  <strong>NODE<br />EXPRESS</strong>
                </div>
                <div>
                  <span>DATA / ML</span>
                  <strong>PYTHON<br />POSTGRES</strong>
                </div>
                <div>
                  <span>INTEGRATIONS</span>
                  <strong>STRIPE<br />WEBHOOKS</strong>
                </div>
              </div>
              <div className="console-foot">
                <span>WEB SYSTEMS</span>
                <span>AI / ML</span>
                <span>PRODUCT MIND</span>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="shell footer-layout">
          <div>
            <p className="eyebrow">Open channel</p>
            <h2>Bring me the thing that almost works.</h2>
            <p>
              Product UI, production web systems, AI experiments, and unusually specific
              side projects are all welcome.
            </p>
          </div>

          <div className="footer-actions">
            <a className="button button-light" href={"mailto:" + profile.email}>
              <Mail size={18} aria-hidden="true" />
              {profile.email}
            </a>
            <nav className="identity-text-links" aria-label="Verified identity links">
              <a href={profile.github} target="_blank" rel="me noreferrer">
                GitHub / Pronaaf2k
              </a>
              <a href={profile.linkedin} target="_blank" rel="me noreferrer">
                LinkedIn / Samiyeel Alim Binaaf
              </a>
            </nav>
            <div className="social-actions" aria-label="Social links">
              <a
                className="icon-button"
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
              >
                <Code2 size={20} />
              </a>
              <a
                className="icon-button"
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Network size={20} />
              </a>
              <a
                className="icon-button"
                href={profile.steam}
                target="_blank"
                rel="noreferrer"
                aria-label="Steam"
                title="Steam"
              >
                <Gamepad2 size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="shell footer-bottom">
          <span>Dhaka, Bangladesh</span>
          <span>(c) 2026 Samiyeel Alim Binaaf</span>
        </div>
      </footer>
    </>
  );
}
