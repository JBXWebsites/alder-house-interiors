import StudioImage from "@/components/StudioImage";
import { Suspense } from "react";
import { Arrow } from "@/components/Icons";
import RoomNotes from "@/components/RoomNotes";
import BriefBuilder from "@/components/BriefBuilder";
import { projects } from "@/lib/projects";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ inspiration?: string | string[] }>;
}) {
  const query = await searchParams;
  const inspiration =
    typeof query.inspiration === "string" &&
    projects.some((p) => p.slug === query.inspiration)
      ? query.inspiration
      : "";
  const palm = projects.find((p) => p.slug === "palm-court")!;
  return (
    <main id="main" tabIndex={-1}>
      <section className="hero shell" aria-labelledby="hero-heading">
        <div className="hero-kicker">
          <span>
            Considered spaces.
            <br />
            Everyday living.
          </span>
          <span>
            A fictional studio.
            <br />A JBX Web Studio concept.
          </span>
        </div>
        <div className="hero-brand" aria-hidden="true">
          Alder House
        </div>
        <div className="hero-stage">
          <div className="hero-intro">
            <h1 id="hero-heading">
              Rooms for
              <br />
              <em>
                the way
                <br />
                you live.
              </em>
            </h1>
            <p>
              Residential interiors in Tampa Bay, from a thoughtfully furnished
              room to a considered renovation.
            </p>
            <a className="text-link" href="#work">
              Explore the rooms <Arrow />
            </a>
          </div>
          <figure className="hero-main">
            <div className="hero-image-window">
              <StudioImage
                className="hero-image-plane"
                src="/images/palm-court.webp"
                srcSet="/images/palm-court-640.webp 640w, /images/palm-court-960.webp 960w, /images/palm-court.webp 1536w"
                sizes="(max-width:760px) 100vw, 65vw"
                width="1536"
                height="1024"
                alt="Palm Court: a mineral-blue sofa, leather chair and timber table in a sunlit living room, with a courtyard beyond."
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption>
              <span>Palm Court</span>
              <span>Living, in good company.</span>
            </figcaption>
          </figure>
          <figure className="hero-detail">
            <StudioImage
              src="/images/materials-640.webp"
              width="1024"
              height="1536"
              alt="Linen, stone and timber, the material palette of the imagined studio."
              loading="lazy"
              decoding="async"
            />
            <figcaption>A feeling, in the details.</figcaption>
          </figure>
        </div>
        <div className="hero-foot">
          <span>Light. Texture. A little room to be yourself.</span>
          <a href="#work" aria-label="Explore selected room studies">
            <Arrow direction="down" />
          </a>
        </div>
      </section>
      <section
        className="work-section shell"
        id="work"
        aria-labelledby="work-title"
      >
        <div className="section-heading">
          <span className="eyebrow">01 / The rooms</span>
          <div>
            <h2 id="work-title">
              An ordinary day.
              <br />
              <em>A considered setting.</em>
            </h2>
            <p>
              Three imagined homes. An attention to light, materials and the
              small routines that make a place your own.
            </p>
          </div>
        </div>
        <div className="project-intro">
          <div>
            <span className="eyebrow">
              Living room & dining / Residential study
            </span>
            <h3>Palm Court</h3>
          </div>
          <p>
            A room for conversation, with enough separation to let the day
            unfold around it.
          </p>
        </div>
        <RoomNotes notes={palm.notes} />
        <div className="study-spread">
          <article className="bay-study">
            <a
              href="/projects/bay-window"
              className="image-link"
              aria-label="Explore Bay Window"
            >
              <StudioImage
                src="/images/bay-window.webp"
                srcSet="/images/bay-window-640.webp 640w, /images/bay-window.webp 1024w"
                sizes="(max-width:760px) 100vw, 42vw"
                width="1024"
                height="1536"
                alt={projects[1].alt}
                loading="lazy"
                decoding="async"
                data-reveal
              />
            </a>
            <div className="study-meta">
              <span>02</span>
              <span>Breakfast corner</span>
            </div>
            <h3>
              <a href="/projects/bay-window">
                Bay Window <Arrow />
              </a>
            </h3>
            <p>
              A sunny corner becomes a place to stay a little longer. Breakfast,
              reading and the everyday pile of books.
            </p>
          </article>
          <div className="tide-column">
            <p className="spread-bridge">
              Different rooms.
              <br />
              <em>
                The same attention
                <br />
                to everyday life.
              </em>
            </p>
            <article className="tide-study">
              <a
                href="/projects/tide-house"
                className="image-link"
                aria-label="Explore Tide House"
              >
                <StudioImage
                  src="/images/tide-house.webp"
                  srcSet="/images/tide-house-640.webp 640w, /images/tide-house-960.webp 960w, /images/tide-house.webp 1536w"
                  sizes="(max-width:760px) 100vw, 48vw"
                  width="1536"
                  height="1024"
                  alt={projects[2].alt}
                  loading="lazy"
                  decoding="async"
                  data-reveal
                />
              </a>
              <div className="study-meta">
                <span>03</span>
                <span>Kitchen & dining</span>
              </div>
              <h3>
                <a href="/projects/tide-house">
                  Tide House <Arrow />
                </a>
              </h3>
              <p>
                Cooking and gathering share the same room. Each area has its own
                character, without interrupting the conversation.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section
        className="approach-section"
        id="approach"
        aria-labelledby="approach-title"
      >
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">02 / The approach</span>
            <div>
              <h2 id="approach-title">
                A considered home starts
                <br />
                <em>with a conversation.</em>
              </h2>
              <p>
                You do not need to arrive with a finished vision. Begin with
                what feels right, what feels unresolved, and what you want the
                room to make easier.
              </p>
            </div>
          </div>
          <div className="service-list">
            {[
              {
                name: "A room",
                n: "01",
                text: "Furniture, lighting, color and the details that help a single space feel complete.",
              },
              {
                name: "A home",
                n: "02",
                text: "A connected direction for several rooms, with room for the things you already love.",
              },
              {
                name: "A renovation",
                n: "03",
                text: "Interior layouts, finishes and joinery ideas to develop alongside your project team.",
              },
            ].map((s) => (
              <div className="service-row" key={s.n}>
                <span className="eyebrow">{s.n}</span>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <p className="scope-disclosure">
            An example of how the fictional Alder House studio could present its
            services.
          </p>
          <div className="process">
            <p className="process-title">
              From the first thought
              <br />
              <em>to the final layer.</em>
            </p>
            {[
              {
                name: "Listen",
                text: "The routines, the awkward corners and the things worth keeping.",
              },
              {
                name: "Shape",
                text: "Layout, materials and furnishings, with decisions explained along the way.",
              },
              {
                name: "Bring together",
                text: "The details that make a room coherent, comfortable and ready for daily life.",
              },
            ].map((s) => (
              <div key={s.name}>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        className="studio-section shell"
        id="studio"
        aria-labelledby="studio-title"
      >
        <figure>
          <StudioImage
            src="/images/materials.webp"
            srcSet="/images/materials-640.webp 640w, /images/materials.webp 1024w"
            sizes="(max-width:760px) 100vw, 42vw"
            alt="Blue linen, pale stone, timber and ceramics arranged on a dark wooden table."
            width="1024"
            height="1536"
            loading="lazy"
            decoding="async"
            data-reveal
          />
          <figcaption>A study in texture: linen, stone and timber.</figcaption>
        </figure>
        <div className="studio-copy">
          <span className="eyebrow">03 / A point of view</span>
          <h2 id="studio-title">
            A home should
            <br />
            leave room
            <br />
            <em>for you.</em>
          </h2>
          <p>
            The book left open. The chair that always turns toward the window.
            The pieces that have followed you from one home to the next.
          </p>
          <p>
            Alder House is imagined around those details. A quieter approach to
            interiors, where light, texture and the way a room is used belong in
            the same conversation.
          </p>
          <a className="text-link" href="/about-this-project">
            About this JBX concept <Arrow />
          </a>
        </div>
      </section>
      <section
        className="brief-section"
        id="project-brief"
        aria-labelledby="brief-invitation"
      >
        <div className="shell brief-layout">
          <div className="brief-invitation">
            <span className="eyebrow">04 / Your starting point</span>
            <h2 id="brief-invitation">
              Begin with
              <br />
              the room
              <br />
              <em>you have.</em>
            </h2>
            <p>
              A corner, a whole room, or the first thought of something bigger
              is enough to begin.
            </p>
            <div className="brief-flourish" aria-hidden="true">
              A<span>H</span>
            </div>
          </div>
          <Suspense fallback={<p>The brief form is loading.</p>}>
            <BriefBuilder initialInspiration={inspiration} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
