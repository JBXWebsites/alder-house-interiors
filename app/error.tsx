"use client";

import { Arrow } from "@/components/Icons";
import "@/components/stories.css";

export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main id="main" tabIndex={-1} className="recovery-page shell">
      <p className="story-category">Alder House / A small interruption</p>
      <h1>
        Something interrupted
        <br />
        <em>the visit.</em>
      </h1>
      <p>Try loading this page again, or return to the room studies.</p>
      <div className="recovery-actions">
        <button type="button" className="story-link" onClick={() => retry()}>
          Try again <Arrow />
        </button>
        <a className="story-link" href="/">
          Back to home <Arrow />
        </a>
      </div>
    </main>
  );
}
