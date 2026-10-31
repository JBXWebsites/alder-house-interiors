"use client";
import StudioImage from "@/components/StudioImage";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
type Note = {
  id: string;
  title: string;
  observation?: string;
  text: string;
  image: string;
  alt: string;
  crop?: { x: number; y: number; width: number; height: number } | number[];
};
const positions: Record<string, number[]> = {
  light: [0, 60, 800, 600],
  layout: [360, 50, 800, 600],
  material: [850, 40, 686, 514],
};
function Locator({ id, title }: { id: string; title: string }) {
  const [x, y, w, h] = positions[id] || [0, 0, 1536, 1024];
  return (
    <svg
      className="room-locator"
      viewBox="0 0 1536 1024"
      role="img"
      aria-label={`${title}: outlined area within the whole room`}
    >
      <image href="/images/palm-court-640.webp" width="1536" height="1024" />
      <rect
        x={x + 5}
        y={y + 5}
        width={w - 10}
        height={h - 10}
        fill="none"
        stroke="white"
        strokeWidth="24"
      />
      <rect
        x={x + 5}
        y={y + 5}
        width={w - 10}
        height={h - 10}
        fill="none"
        stroke="#2e2118"
        strokeWidth="10"
      />
    </svg>
  );
}
export default function RoomNotes({ notes }: { notes: Note[] }) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLImageElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Note | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ds = Array.from(el.querySelectorAll<HTMLDetailsElement>("details"));
    const read = (event?: Event) => {
      const target = event?.currentTarget as HTMLDetailsElement | undefined;
      if (target?.open)
        ds.forEach((d) => {
          if (d !== target) d.open = false;
        });
      const opened = ds.find((d) => d.open);
      setSelected(opened?.dataset.note || null);
    };
    read();
    setEnhanced(true);
    ds.forEach((d) => d.addEventListener("toggle", read));
    return () => ds.forEach((d) => d.removeEventListener("toggle", read));
  }, []);
  useEffect(() => {
    let live = true;
    setFailed(false);
    setLoaded(null);
    if (!selected) {
      setLoaded(null);
      return;
    }
    const note = notes.find((n) => n.id === selected);
    if (!note) return;
    const img = new window.Image();
    img.src = note.image;
    img
      .decode()
      .then(() => {
        if (live) setLoaded(note);
      })
      .catch(() => {
        if (live) {
          setLoaded(null);
          setFailed(true);
        }
      });
    return () => {
      live = false;
    };
  }, [selected, notes]);
  useGSAP(
    () => {
      if (
        layer.current &&
        !matchMedia("(prefers-reduced-motion:reduce)").matches
      )
        gsap.fromTo(
          layer.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.22, ease: "power1.out" },
        );
    },
    { dependencies: [loaded], scope: root, revertOnUpdate: true },
  );
  const active = notes.find((n) => n.id === selected);
  return (
    <div className={`room-notes ${enhanced ? "is-enhanced" : ""}`} ref={root}>
      <div className="room-visual">
        <div className="room-frame" data-reveal>
          <StudioImage
            src="/images/palm-court.webp"
            srcSet="/images/palm-court-640.webp 640w, /images/palm-court-960.webp 960w, /images/palm-court.webp 1536w"
            sizes="(min-width:1200px) 55vw, 100vw"
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
            alt="A blue sofa faces a low timber table, with courtyard light, a slatted screen and dark shelves around the room."
          />
          {loaded && (
            <img
              ref={layer}
              className="room-detail-plane"
              src={loaded.image}
              alt={loaded.alt}
            />
          )}
        </div>
        <div className="room-caption">
          <span>
            Palm Court
            <br />
            <span className="caption-muted">Living, in good company.</span>
          </span>
          <span className="desktop-detail-caption">
            {active ? active.title : "The whole room"}
          </span>
        </div>
        {active && (
          <div className="desktop-locator">
            <Locator id={active.id} title={active.title} />
            <p>
              From the room, to the detail.
              <br />
              {failed
                ? "The detail image could not load. Read the observation alongside."
                : "The outline shows where this detail belongs."}
            </p>
          </div>
        )}
      </div>
      <div className="notes-column">
        <div className="notes-heading">
          <span className="notes-label">Look closer</span>
          <button
            type="button"
            className="overview-button"
            disabled={!enhanced}
            onClick={() => {
              root.current
                ?.querySelectorAll("details")
                .forEach((d) => (d.open = false));
              setSelected(null);
            }}
          >
            The whole room <span aria-hidden="true">↗</span>
          </button>
        </div>
<p className="notes-intro">A room is made<br />of small decisions.</p>
        {notes.map((note) => (
          <details name="room-notes" key={note.id} data-note={note.id}>
            <summary>
              <span className="summary-copy">
                <span className="note-title">{note.title}</span>
              </span>
              <span className="disclosure-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M5 12h14" />
                  <path className="plus-vertical" d="M12 5v14" />
                </svg>
              </span>
            </summary>
            <div className="note-body">
              <figure className="inline-detail">
                <StudioImage
                  src={note.image}
                  alt={note.alt}
                  loading="lazy"
                  decoding="async"
                  width="800"
                  height="600"
                />
                <figcaption>
                  <Locator id={note.id} title={note.title} />
                  <span>The detail, within the whole.</span>
                </figcaption>
              </figure>
              <p>{note.observation} {note.text}</p>
            </div>
          </details>
        ))}
        <a className="text-link story-link" href="/projects/palm-court">
          Explore Palm Court{" "}
          <svg
            className="action-arrow"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12h16m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
