import StudioImage from "@/components/StudioImage";
import { Suspense } from "react";
import { Arrow } from "@/components/Icons";
import RoomNotes from "@/components/RoomNotes";
import BriefBuilder from "@/components/BriefBuilder";
import BriefStart from "@/components/BriefStart";
import { projects } from "@/lib/projects";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ inspiration?: string | string[]; scope?: string; space?: string }>;
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
      <section className="material-story" id="studio" aria-labelledby="studio-title">
        <div className="shell material-layout">
          <figure><div className="material-photo" data-parallax><StudioImage src="/images/materials-daylight-1024.webp" srcSet="/images/materials-daylight-640.webp 640w, /images/materials-daylight-1024.webp 1024w" sizes="(max-width:760px) 100vw, 45vw" width="1024" height="1536" alt="Creased linen, a limestone sample, walnut and a tea cup on a worn oak worktable beside a window." loading="lazy" decoding="async" /></div><figcaption>Linen, limestone and walnut. Seen in daylight.</figcaption></figure>
          <div className="material-copy"><h2 id="studio-title" data-heading>Made to<br />be touched.<br /><em>And lived with.</em></h2><p>Linen that softens. Timber that wears in. Stone that holds its texture. A home gets better when its materials can show a little life.</p><a className="text-link" href="/about-this-project">Our point of view <Arrow /></a></div>
        </div>
      </section>
      <section className="approach-section" id="approach" aria-labelledby="approach-title">
        <div className="shell approach-layout">
          <div className="approach-intro"><h2 id="approach-title" data-heading>A fresh start.<br /><em>At your scale.</em></h2><p>Keep what you love. Change what gets in the way. Start with the part of your home that needs attention.</p></div>
          <div className="service-choices">
            <details name="services"><summary><span>A single room<small>Make one space work harder.</small></span><span aria-hidden="true">+</span></summary><div><p>Begin with the layout. Then bring furniture, lighting and materials into one clear direction.</p><BriefStart scope="single-room">Start with a room</BriefStart></div></details>
            <details name="services"><summary><span>A whole home<small>Find the thread between rooms.</small></span><span aria-hidden="true">+</span></summary><div><p>Build a shared palette and a plan for the way rooms connect, while keeping space for the pieces you already own.</p><BriefStart scope="furnishing" space="several-rooms">Start with your home</BriefStart></div></details>
            <details name="services"><summary><span>A renovation<small>Think through the lasting decisions.</small></span><span aria-hidden="true">+</span></summary><div><p>Explore interior layouts, finishes and joinery before developing the details with your project team.</p><BriefStart scope="renovation">Start a renovation brief</BriefStart></div></details>
            <p className="service-disclosure">Example services for this fictional studio.</p>
          </div>
        </div>
      </section>
      <section
        className="brief-section"
        id="project-brief"
        aria-labelledby="brief-invitation"
      >
        <div className="shell brief-layout">
          <div className="brief-invitation">
            
<h2 id="brief-invitation" data-heading>What would<br /><em>feel better?</em></h2>
<p>Choose a space. Tell us what you would change. Leave with a brief you can make your own.</p>

          </div>
          <Suspense fallback={<p>The brief form is loading.</p>}>
            <BriefBuilder initialScope={typeof query.scope === "string" ? query.scope : ""} initialSpace={typeof query.space === "string" ? query.space : ""} initialInspiration={inspiration} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

