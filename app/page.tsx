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
      <section className="arrival" aria-labelledby="hero-heading">
        <div className="arrival-heading shell">
          <h1 className="arrival-title" id="hero-heading"><span className="line-mask"><span>Rooms for</span></span><span className="line-mask"><span><em>the life within.</em></span></span></h1>
          <a className="text-link arrival-link" href="#work">Come inside <Arrow direction="down" /></a>
        </div>
        <figure>
          <div className="arrival-photo"><StudioImage className="arrival-plane" src="/images/arrival-1536.webp" srcSet="/images/arrival-640.webp 640w, /images/arrival-960.webp 960w, /images/arrival-1536.webp 1536w" sizes="100vw" width="1536" height="1024" alt="A shaded plaster doorway opens into a linen-furnished sitting room and a leafy courtyard." fetchPriority="high" decoding="async" /></div>
          <figcaption className="arrival-caption shell"><span>Residential interiors, with room to live.</span><span>A fictional studio by JBX Web Studio.</span></figcaption>
        </figure>
      </section>
      <section
        className="work-section shell"
        id="work"
        aria-labelledby="work-title"
      >
        <div className="work-heading"><h2 id="work-title" data-heading>Three rooms.<br /><em>Three ways to live.</em></h2><p>Imagined interiors, explored in detail.</p></div>
        <nav className="room-directory" aria-label="Choose a room">
          <a href="#palm-court"><span>Palm Court</span><span>Gather & unwind</span><Arrow direction="down" /></a>
          <a href="#bay-window"><span>Bay Window</span><span>Pause & read</span><Arrow direction="down" /></a>
          <a href="#tide-house"><span>Tide House</span><span>Cook & connect</span><Arrow direction="down" /></a>
        </nav>
        <div className="project-intro" id="palm-court">
          <div>
            <span className="eyebrow">
              Living & dining
            </span>
            <h3>Palm Court</h3>
          </div>

        </div>
        <RoomNotes notes={palm.notes} />
        <div className="study-spread">
          <article className="bay-study room-chapter" id="bay-window">
            <div className="chapter-copy"><p className="room-kind">Breakfast & reading</p><h3 data-heading>Bay<br /><em>Window.</em></h3><p>A built-in seat turns a sunny corner into somewhere to spend the morning.</p><a className="text-link" href="/projects/bay-window">Explore Bay Window <Arrow /></a></div>
            <a href="/projects/bay-window" className="project-photo" aria-label="View the Bay Window room story"><div className="photo-depth" data-parallax data-image-reveal><StudioImage src="/images/bay-window.webp" srcSet="/images/bay-window-640.webp 640w, /images/bay-window.webp 1024w" sizes="(max-width:760px) 100vw, 55vw" width="1024" height="1536" alt={projects[1].alt} loading="lazy" decoding="async" /></div><span className="image-visit" aria-hidden="true">Enter the room <Arrow /></span></a>
          </article>
          <div className="tide-column">
            <article className="tide-study room-chapter" id="tide-house">
              <a href="/projects/tide-house" className="project-photo" aria-label="View the Tide House room story"><div className="photo-depth" data-parallax data-image-reveal><StudioImage src="/images/tide-house.webp" srcSet="/images/tide-house-640.webp 640w, /images/tide-house-960.webp 960w, /images/tide-house.webp 1536w" sizes="100vw" width="1536" height="1024" alt={projects[2].alt} loading="lazy" decoding="async" /></div><span className="image-visit" aria-hidden="true">Enter the room <Arrow /></span></a>
              <div className="tide-caption"><div><p className="room-kind">Kitchen & gathering</p><h3 data-heading>Tide House.</h3></div><div><p>One space for making dinner.<br />And making a night of it.</p><a className="text-link" href="/projects/tide-house">Explore Tide House <Arrow /></a></div></div>
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
            <span className="eyebrow">How we work</span>
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
          <span className="eyebrow">The things we live with</span>
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
            <span className="eyebrow">Your project</span>
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
