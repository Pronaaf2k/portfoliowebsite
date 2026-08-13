"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  Code2,
  FileText,
  Gamepad2,
  Mail,
  Network,
} from "lucide-react";
import { experience, profile, projects, type Project } from "@/lib/data";
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

const skills = [
  { name: "React", logo: "react/react-original.svg" },
  { name: "Next.js", logo: "nextjs/nextjs-original.svg", monochrome: true },
  { name: "TypeScript", logo: "typescript/typescript-original.svg" },
  { name: "Node.js", logo: "nodejs/nodejs-original.svg" },
  { name: "Express", logo: "express/express-original.svg", monochrome: true },
  { name: "PostgreSQL", logo: "postgresql/postgresql-original.svg" },
  { name: "Python", logo: "python/python-original.svg" },
  { name: "PyTorch", logo: "pytorch/pytorch-original.svg" },
  { name: "TensorFlow", logo: "tensorflow/tensorflow-original.svg" },
  { name: "Stripe", logo: "/images/skills/stripe.svg" },
  { name: "Git", logo: "git/git-original.svg" },
  { name: "Vercel", logo: "vercel/vercel-original.svg", monochrome: true },
];

function SkillRail({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="skills-rail" aria-hidden={duplicate || undefined}>
      {skills.map((skill) => (
        <div
          className={"skill-logo-item" + (skill.monochrome ? " is-monochrome" : "")}
          key={skill.name}
        >
          <Image
            src={
              skill.logo.startsWith("/")
                ? skill.logo
                : "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/" + skill.logo
            }
            alt=""
            width={64}
            height={64}
            unoptimized
          />
          <span>{skill.name}</span>
        </div>
      ))}
    </div>
  );
}

function SkillsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const segmentWidth = () => carousel.scrollWidth / 3;
    carousel.scrollLeft = segmentWidth();

    const intervalId = window.setInterval(() => {
      const segment = segmentWidth();
      if (!segment) return;

      if (carousel.scrollLeft >= segment * 2) carousel.scrollLeft -= segment;
      if (carousel.scrollLeft <= 0) carousel.scrollLeft += segment;
      if (!isDraggingRef.current) carousel.scrollLeft += 1;
    }, 24);

    return () => window.clearInterval(intervalId);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = carousel.scrollLeft;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel || !isDraggingRef.current) return;

    const segment = carousel.scrollWidth / 3;
    let nextScroll = dragStartScrollRef.current - (event.clientX - dragStartXRef.current);

    if (nextScroll >= segment * 2) nextScroll -= segment;
    if (nextScroll <= 0) nextScroll += segment;

    carousel.scrollLeft = nextScroll;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={carouselRef}
      className={"skills-marquee" + (isDragging ? " is-dragging" : "")}
      aria-label="Technical skills. Drag horizontally to explore."
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        carouselRef.current?.scrollBy({
          left: event.key === "ArrowRight" ? 184 : -184,
          behavior: "smooth",
        });
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="skills-track">
        <SkillRail duplicate />
        <SkillRail />
        <SkillRail duplicate />
      </div>
    </div>
  );
}

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
                <a
                  className="button button-secondary"
                  href="/SamiyeelAlimBinaafResume.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open résumé
                  <FileText size={17} aria-hidden="true" />
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

        <section
          className="story-section section"
          id="about"
          aria-labelledby="story-title"
        >
          <div className="shell about-layout">
            <ScrollReveal className="about-title">
              <p className="eyebrow">About / experience</p>
              <h2 id="story-title">Work and education.</h2>
            </ScrollReveal>

            <ScrollReveal className="about-timeline" delay={80}>
              {experience.map((item) => {
                const isAcademic = item.kind === "academic";

                return (
                  <article className="about-timeline-item" key={item.title + item.place}>
                    <span className="about-timeline-marker" aria-hidden="true" />
                    <div className="about-timeline-meta">
                      <span>{isAcademic ? "Academics" : "Work"}</span>
                      <time>{item.period}</time>
                    </div>
                    <div className="about-timeline-body">
                      <h3>{item.title}</h3>
                      <p className="about-timeline-place">{item.place}</p>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                );
              })}

              <Link className="about-loadout-link" href="/loadout">
                <span>Tools, desk, and competitive setup</span>
                <strong>View loadout</strong>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        <section className="skills-section section" id="skills" aria-labelledby="skills-title">
          <div className="shell skills-heading">
            <ScrollReveal>
              <p className="eyebrow">Skill set / working toolkit</p>
              <h2 id="skills-title">The tools move. The systems thinking stays.</h2>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <p>
                A practical stack for building interfaces, backends, data products, and
                production integrations. Drag the carousel to explore the stack.
              </p>
            </ScrollReveal>
          </div>

          <SkillsCarousel />
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
