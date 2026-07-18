"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Blocks,
  BookOpen,
  Check,
  Gamepad2,
  Headphones,
  Mail,
  Presentation,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { SiteHeader } from "@/components/site-header";
import { experience, profile } from "@/lib/data";

import styles from "@/app/about-me/about.module.css";

type WorkMode = {
  id: "build" | "explain" | "position" | "tune";
  label: string;
  icon: ReactNode;
  title: string;
  statement: string;
  proof: string;
  signal: string;
};

const workModes: WorkMode[] = [
  {
    id: "build",
    label: "Build",
    icon: <Blocks aria-hidden="true" />,
    title: "Software is LEGO with consequences.",
    statement:
      "If I can describe a useful thing, I want to make it real, connect the pieces, and watch it run. The fun is rarely one isolated component. It is owning the awkward middle between idea and production.",
    proof:
      "VoloLeads began as a placeholder site. I turned it into an operating system with payments, meetings, webhooks, PostgreSQL state, transactional email, billing self-service, cron jobs, analytics, and deployment.",
    signal: "CURRENT FAVORITE / VOLOLEADS",
  },
  {
    id: "explain",
    label: "Explain",
    icon: <BookOpen aria-hidden="true" />,
    title: "Understanding is part of the interface.",
    statement:
      "Tutoring taught me to notice where someone actually got lost, not where I expected them to. That habit follows me into documentation, leadership, feedback, and every screen that needs a clear next step.",
    proof:
      "I have taught Cambridge O-Level and Pre O-Level math and science since 2022. Teaching made me a more patient communicator and a better person to have beside you when the work gets complicated.",
    signal: "TEACHING / 2022 TO NOW",
  },
  {
    id: "position",
    label: "Position",
    icon: <Presentation aria-hidden="true" />,
    title: "A good product still has to be understood.",
    statement:
      "Being a CMO taught me how to read a room, choose what matters, and present an idea without hiding behind jargon. Building and positioning are different disciplines. Useful work deserves both.",
    proof:
      "At Discount Den I worked on brand, campaigns, launches, and growth. At my first hackathon, finishing in the top 20 of 900 teams reinforced the same lesson: technical depth matters, and so does making its value legible.",
    signal: "PRODUCT MEMORY / FORMER CMO",
  },
  {
    id: "tune",
    label: "Tune",
    icon: <SlidersHorizontal aria-hidden="true" />,
    title: "Losing is information, not an ending.",
    statement:
      "Competitive games taught me not to stop because one round went badly. There is another move, another angle, another solution nearby. I bring that same stubborn iteration to bugs, systems, and interfaces.",
    proof:
      "When a project hits resistance, I tend to tunnel in. If teammates disappear, I carry more weight and finish the run. It is not always the calmest trait, but it is why unfinished work bothers me more than difficult work.",
    signal: "ONLINE AS / PRONAAF2K",
  },
];

const principles = [
  {
    index: "01",
    title: "Integrity",
    copy: "Say what is true, own what is mine, and do not dress uncertainty up as certainty.",
  },
  {
    index: "02",
    title: "Quality",
    copy: "A feature working is the start. It should also be clear, resilient, and worth putting my name on.",
  },
  {
    index: "03",
    title: "Finish",
    copy: "Hurdles make me narrow my focus. I would rather find the next route than quietly abandon the outcome.",
  },
];

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.14 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${className}`}>
      {children}
    </div>
  );
}

export function AboutPage() {
  const [activeMode, setActiveMode] = useState(0);
  const portraitRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const active = workModes[activeMode];

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const movePortrait = (event: PointerEvent<HTMLDivElement>) => {
    const node = portraitRef.current;
    if (!node) return;

    const bounds = node.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      node.style.setProperty("--portrait-x", x.toFixed(3));
      node.style.setProperty("--portrait-y", y.toFixed(3));
    });
  };

  const resetPortrait = () => {
    const node = portraitRef.current;
    if (!node) return;
    node.style.setProperty("--portrait-x", "0");
    node.style.setProperty("--portrait-y", "0");
  };

  const handleModeKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let next = activeMode;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = workModes.length - 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = (activeMode + 1) % workModes.length;
    } else {
      next = (activeMode - 1 + workModes.length) % workModes.length;
    }

    setActiveMode(next);
    document.getElementById(`work-mode-${workModes[next].id}`)?.focus();
  };

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>ABOUT / DHAKA / BUILDER SINCE THE FIRST QUESTION</p>
            <h1 id="about-title">Samiyeel Alim Binaaf.</h1>
            <p className={styles.heroStatement}>
              Computers felt like LEGO before I knew what code was.
            </p>
            <p className={styles.heroLead}>
              I build full-stack systems and AI experiments, but the longer version starts with
              video games, an uncle playing Unreal Tournament, and a kid who wanted to know
              whether he could make worlds like that himself.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#origin">
                Read the story <ArrowDown aria-hidden="true" />
              </a>
              <a className={styles.secondaryAction} href={`mailto:${profile.email}`}>
                Talk to me <Mail aria-hidden="true" />
              </a>
            </div>

            <dl className={styles.identityRail}>
              <div>
                <dt>Studies</dt>
                <dd>Computer Science / NSU</dd>
              </div>
              <div>
                <dt>Builds</dt>
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
            <div className={styles.cursorSignal} aria-hidden="true" />
            <div className={styles.portraitReadout}>
              <span>SUBJECT / SAMIYEEL</span>
              <strong>BUILDER</strong>
              <span>PRODUCT + CODE + CURIOSITY</span>
            </div>
            <div className={styles.portraitCoordinates} aria-hidden="true">
              <span>23.8041 N</span>
              <span>DHAKA</span>
              <span>90.4152 E</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.origin} id="origin" aria-labelledby="origin-title">
        <div className={styles.shell}>
          <Reveal className={styles.originIntro}>
            <p className={styles.sectionLabel}>ORIGIN / BEFORE THE SYLLABUS</p>
            <h2 id="origin-title">The computer came first.</h2>
          </Reveal>

          <div className={styles.originGrid}>
            <Reveal className={styles.originStory}>
              <p className={styles.dropcap}>
                I was playing computer games at three, watching my uncle play Unreal Tournament,
                and taking computers apart in my head long before I could name the field.
              </p>
              <p>
                I liked staying at the computer all day. First I wanted to know whether I could
                make games. Then the question got wider: if something can exist virtually, how
                much of it can I produce myself?
              </p>
              <p>
                Coding answered that question. It has always felt more like making than studying.
                The courses came easily; the only part I truly hated was writing code on paper.
                Code deserves to be on a computer, running, breaking, and becoming better.
              </p>
            </Reveal>

            <Reveal className={styles.originAside}>
              <p className={styles.asideIndex}>NOT THE PERFECT-STUDENT ARCHETYPE</p>
              <blockquote>
                I am not the best student out there. I am the person who needs to see the thing
                work.
              </blockquote>
              <p>
                That distinction matters. Credentials give me a foundation. Curiosity, pressure,
                and the need to finish are what turn it into output.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.modes} aria-labelledby="modes-title">
        <div className={styles.shell}>
          <Reveal className={styles.modesHeading}>
            <p className={styles.sectionLabel}>OPERATING SYSTEM / FOUR EXPRESSIONS</p>
            <h2 id="modes-title">The same brain, used four ways.</h2>
            <p>
              Code, teaching, marketing, and competition look separate on paper. In practice,
              each one trained a different part of how I build.
            </p>
          </Reveal>

          <Reveal className={styles.modeConsole}>
            <div
              className={styles.modeTabs}
              role="tablist"
              aria-label="Ways Samiyeel works"
              onKeyDown={handleModeKeys}
            >
              {workModes.map((mode, index) => (
                <button
                  key={mode.id}
                  id={`work-mode-${mode.id}`}
                  className={index === activeMode ? styles.modeTabActive : styles.modeTab}
                  type="button"
                  role="tab"
                  aria-selected={index === activeMode}
                  aria-controls="work-mode-panel"
                  tabIndex={index === activeMode ? 0 : -1}
                  onClick={() => setActiveMode(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {mode.icon}
                  <strong>{mode.label}</strong>
                </button>
              ))}
            </div>

            <div
              key={active.id}
              className={styles.modePanel}
              id="work-mode-panel"
              role="tabpanel"
              aria-labelledby={`work-mode-${active.id}`}
            >
              <span className={styles.modeSignal}>{active.signal}</span>
              <h3>{active.title}</h3>
              <p className={styles.modeStatement}>{active.statement}</p>
              <div className={styles.modeProof}>
                <Check aria-hidden="true" />
                <p>{active.proof}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.proofStrip} aria-label="Selected signals">
        <div className={styles.proofGrid}>
          <div>
            <span>PRODUCTION SYSTEM</span>
            <strong>VoloLeads</strong>
          </div>
          <div>
            <span>FIRST HACKATHON</span>
            <strong>Top 20 / 900</strong>
          </div>
          <div>
            <span>PRODUCT LENS</span>
            <strong>Former CMO</strong>
          </div>
          <div>
            <span>TEACHING</span>
            <strong>2022 / now</strong>
          </div>
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <div className={styles.shell}>
          <Reveal className={styles.principlesHeading}>
            <p className={styles.sectionLabel}>NON-NEGOTIABLES</p>
            <h2 id="principles-title">What stays when the stack changes.</h2>
          </Reveal>
          <div className={styles.principleGrid}>
            {principles.map((principle) => (
              <Reveal className={styles.principle} key={principle.title}>
                <span>{principle.index}</span>
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.timeline} aria-labelledby="timeline-title">
        <div className={styles.shell}>
          <Reveal className={styles.timelineHeading}>
            <p className={styles.sectionLabel}>PATH / NOT A STRAIGHT LINE</p>
            <h2 id="timeline-title">Different rooms. Same habit.</h2>
            <p>
              Learn the system, find the useful part, and take responsibility for making it work.
            </p>
          </Reveal>

          <div className={styles.timelineList}>
            {experience.map((item, index) => (
              <Reveal className={styles.timelineItem} key={`${item.place}-${item.period}`}>
                <span className={styles.timelineNumber}>{String(index + 1).padStart(2, "0")}</span>
                <p className={styles.timelinePeriod}>{item.period.replaceAll("\u2014", "/")}</p>
                <div>
                  <h3>{item.title}</h3>
                  <p className={styles.timelineCompany}>{item.place}</p>
                </div>
                <p className={styles.timelineCopy}>{item.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.offClock} aria-labelledby="off-clock-title">
        <div className={styles.shell}>
          <Reveal className={styles.offClockIntro}>
            <p className={styles.sectionLabel}>OFF CLOCK / STILL TUNING</p>
            <h2 id="off-clock-title">The interesting parts do not clock out.</h2>
            <p>
              Music, games, and visual tools are not filler hobbies. They are where I notice taste,
              rhythm, feedback, and the tiny differences that make an experience feel right.
            </p>
          </Reveal>

          <div className={styles.offClockGrid}>
            <Reveal>
              <Link className={styles.offClockLink} href="/#music-exchange">
                <Headphones aria-hidden="true" />
                <span>LISTEN</span>
                <h3>Music as data, memory, and exchange.</h3>
                <p>Spotify experiments, listening fingerprints, and a song pinboard built for strangers.</p>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Reveal>
            <Reveal>
              <Link className={styles.offClockLink} href="/loadout">
                <Gamepad2 aria-hidden="true" />
                <span>COMPETE</span>
                <h3>Pronaaf2k is the optimization brain with a scoreboard.</h3>
                <p>Match history and the lessons that survive after the game closes.</p>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Reveal>
            <Reveal>
              <a className={styles.offClockLink} href={profile.github} target="_blank" rel="noreferrer">
                <Sparkles aria-hidden="true" />
                <span>MAKE</span>
                <h3>Visual polish is part of whether a system gets remembered.</h3>
                <p>Krita, Illustrator, Premiere, and a habit of tuning the last ten percent.</p>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.future} aria-labelledby="future-title">
        <div className={styles.shell}>
          <Reveal className={styles.futureGrid}>
            <div>
              <p className={styles.sectionLabel}>THREE-YEAR SIGNAL</p>
              <h2 id="future-title">Make tedious work smaller.</h2>
            </div>
            <div className={styles.futureCopy}>
              <p>
                I want to build machines and systems that carry the repetitive weight, alongside
                people who also look at tedious work and ask why a human is still doing it.
              </p>
              <p>
                I care about the result, the people using it, and the quality of what ships. I do
                not claim to know everything. I do expect myself to keep going until I know enough
                to make the next move.
              </p>
              <div className={styles.futureActions}>
                <a href={`mailto:${profile.email}`}>
                  Start a conversation <ArrowUpRight aria-hidden="true" />
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>
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
