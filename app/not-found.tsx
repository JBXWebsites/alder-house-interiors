import { Arrow } from "@/components/Icons";
import "@/components/stories.css";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="recovery-page shell">
      <p className="story-category">Alder House / Page not found</p>
      <h1>
        This room
        <br />
        <em>is not here.</em>
      </h1>
      <p>
        The page may have moved, or the address may be incomplete. The selected
        room studies are a good place to begin.
      </p>
      <div className="recovery-actions">
        <a className="story-link" href="/#work">
          Explore the rooms <Arrow />
        </a>
        <a className="story-link" href="/">
          Back to home <Arrow />
        </a>
      </div>
    </main>
  );
}
