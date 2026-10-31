import type { Metadata } from "next";
import Image from "@/components/ProjectImage";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Icons";
import { getProject, projects } from "@/lib/projects";
import "@/components/stories.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const title = `${project.title} | Alder House`;
  return {
    title: { absolute: title },
    description: project.seoDescription,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description: project.seoDescription,
      type: "article",
      url: `/projects/${project.slug}`,
      images: [
        {
          url: `/images/social-${project.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: project.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.seoDescription,
      images: [`/images/social-${project.slug}.jpg`],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const next = getProject(project.next)!;
  const introductions: Record<string, string> = {
    "palm-court": "A place to gather. A little space to yourself.",
    "bay-window": "A sunny corner, given a life of its own.",
    "tide-house": "Cooking and company, in the same conversation.",
  };

  return (
    <main
      id="main"
      tabIndex={-1}
      className={`project-story story-${project.slug}`}
    >
      <div className="story-arrival shell">
        <div className="story-breadcrumb">
          <a href="/#work" className="story-link">
            <Arrow direction="left" /> Back to the rooms
          </a>
          <a href="/about-this-project" className="story-provenance">
            An imagined interior by JBX Web Studio
          </a>
        </div>
        <header className="story-heading">
          <p className="story-category">{project.category.split(" / ")[0]}</p>
          <h1 data-heading>{project.title}</h1>
          <p className="story-deck">{introductions[project.slug]}</p>
        </header>
        <figure className="story-establishing">
          <div className="story-establishing-media" data-parallax>
          <Image
            src={project.image}
            alt={project.alt}
            width={project.width}
            height={project.height}
            sizes={
              project.slug === "bay-window"
                ? "(max-width: 760px) calc(100vw - 44px), 55vw"
                : "(max-width: 760px) calc(100vw - 44px), 100vw"
            }
            preload
          />
          </div>
          <figcaption>
            <span>{project.title}, in full.</span>
            <span>Generated concept image</span>
          </figcaption>
        </figure>
      </div>

      <section
        className="story-question shell"
        aria-labelledby="story-question"
      >
        <p className="story-section-label">The starting point</p>
        <h2 id="story-question">{project.question}</h2>
        <p className="story-response">{project.response}</p>
      </section>

      <section
        className="story-observations shell"
        aria-labelledby="story-notes"
      >
        <div className="story-notes-heading">
          <h2 id="story-notes">A closer look.</h2>
          <p>Three decisions within the same room.</p>
        </div>
        <div className="story-note-sequence">
          {project.notes.map((note, index) => (
            <article
              className={`story-note story-note-${index + 1}`}
              key={note.id}
              aria-labelledby={`note-${note.id}`}
            >
              <figure className="story-note-image" data-reveal>
                <Image
                  src={note.image}
                  alt={note.alt}
                  width={note.width}
                  height={note.height}
                  sizes="(max-width: 760px) calc(100vw - 44px), (max-width: 1199px) 55vw, 48vw"
                />
                <figcaption>
                  {String(index + 1).padStart(2, "0")} / Detail from the room
                  study
                </figcaption>
              </figure>
              <div className="story-note-copy">
                <span className="story-note-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 id={`note-${note.id}`}>{note.title}</h3>
                <p>{note.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="story-reflection" aria-labelledby="story-reflection">
        <div className="shell story-reflection-inner">
          <div className="story-palette">
            <span>Threads through the room</span>
            <ul>
              {project.palette.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          </div>
          <div className="story-closing">
            <h2 id="story-reflection">{project.closing}</h2>
            <a
              href={`/?inspiration=${project.slug}#project-brief`}
              className="story-link"
            >
              Use {project.title} as a starting point <Arrow />
            </a>
            <p className="story-demo-note">
              Prepare a brief to keep. This demo does not send an inquiry.
            </p>
          </div>
        </div>
      </section>

      <nav
        className="story-next shell"
        aria-label="Continue exploring room studies"
      >
        <div className="story-next-copy">
          <span>Another way to live</span>
          <a className="story-next-title" href={`/projects/${next.slug}`}>
            {next.title}
            <Arrow />
          </a>
          <p>{next.category.split(" / ")[0]}</p>
          <a href="/#work" className="story-link">
            All room studies <Arrow />
          </a>
        </div>
        <a
          className={`story-next-image next-${next.slug}`}
          href={`/projects/${next.slug}`}
          aria-label={`Explore ${next.title}`}
        >
          <Image
            src={next.image}
            alt={next.alt}
            width={next.width}
            height={next.height}
            sizes="(max-width: 760px) calc(100vw - 44px), 48vw"
          />
        </a>
      </nav>
    </main>
  );
}
