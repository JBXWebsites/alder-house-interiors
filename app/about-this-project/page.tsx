import type { Metadata } from "next";
import Image from "@/components/ProjectImage";
import { Arrow } from "@/components/Icons";
import "@/components/stories.css";

export const metadata: Metadata = {
  title: { absolute: "About this concept | Alder House" },
  description:
    "The story behind Alder House, a fictional residential interiors studio by JBX Web Studio. Concept imagery, website credits and how the demo handles your brief.",
  alternates: { canonical: "/about-this-project" },
};

export default function AboutThisProject() {
  return (
    <main id="main" tabIndex={-1} className="concept-page">
      <header className="concept-heading shell">
        <p className="story-category">Behind Alder House</p>
        <h1>
          An imagined studio.
          <br />
          <em>A real website project.</em>
        </h1>
      </header>
      <div className="concept-body shell">
        <aside className="concept-image">
          <Image
            src="/images/materials-daylight-1024.webp"
            alt="Creased linen, limestone and walnut samples beside a tea cup on a worn oak worktable in daylight."
            width={1024}
            height={1536}
            sizes="(max-width: 760px) calc(100vw - 44px), 32vw"
          />
          <p>Material palette / Generated concept image</p>
        </aside>
        <div className="concept-sections">
          <section aria-labelledby="concept-purpose">
            <h2 id="concept-purpose">A place to explore an idea.</h2>
            <p>
              Alder House is a self-initiated portfolio concept by JBX Web
              Studio. It explores how an independent residential interior
              designer could present a clear point of view, explain the
              decisions behind a room, and make a first project brief easier to
              write.
            </p>
          </section>
          <section aria-labelledby="concept-work">
            <h2 id="concept-work">The rooms are imagined.</h2>
            <p>
              Alder House is not an operating interiors business. Palm Court,
              Bay Window and Tide House are fictional studies. The names,
              settings and design intentions are part of the concept, not
              records of completed client commissions.
            </p>
            <p>
              The interior images were generated for this project and are not
              photographs of built work.
            </p>
          </section>
          <section id="privacy" aria-labelledby="concept-privacy">
            <h2 id="concept-privacy">Your brief stays a brief.</h2>
            <p>
              The demo prepares a downloadable document from your answers. It
              does not contact a designer, send email or save your brief in a
              project database.
            </p>
            <p>
              Preparing a brief temporarily processes your answers on our
              hosting provider’s systems. We do not intentionally store brief
              content in a database, files, application logs or analytics. The
              hosting provider may retain technical request information under
              its own policies.
            </p>
            <p>
              A downloaded file is saved by your browser to your device. Please
              do not enter personal or sensitive details. This page does not
              provide saved drafts; browser-controlled form restoration may
              still occur.
            </p>
          </section>
          <section aria-labelledby="concept-credits">
            <h2 id="concept-credits">Made by JBX Web Studio.</h2>
            <p>
              Website concept, art direction, interface design, writing, motion
              direction and implementation by{" "}
              <a className="underlined" href="https://www.jbxwebstudio.com">
                JBX Web Studio
              </a>
              .
            </p>
            <p>
              Set in Gelasio and Hanken Grotesk, self-hosted under the SIL Open
              Font License.
            </p>
            <ul className="concept-licenses">
              <li>
                <a href="/licenses/Gelasio-OFL.txt">Gelasio font license</a>
              </li>
              <li>
                <a href="/licenses/Hanken-Grotesk-OFL.txt">
                  Hanken Grotesk font license
                </a>
              </li>
            </ul>
          </section>
          <a href="/#work" className="story-link">
            Return to the rooms <Arrow />
          </a>
        </div>
      </div>
    </main>
  );
}
