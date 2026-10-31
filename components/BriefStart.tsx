"use client";
import { Arrow } from "./Icons";
export default function BriefStart({ scope, space = "", children }: { scope: string; space?: string; children: React.ReactNode }) {
  return <a className="text-link" href={`/?scope=${encodeURIComponent(scope)}${space ? `&space=${encodeURIComponent(space)}` : ""}#project-brief`}
    onClick={(event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const form = document.getElementById("brief-form-heading");
      if (!form) return;
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("alder:brief-start", { detail: { scope, space } }));
      document.getElementById("project-brief")?.scrollIntoView({ behavior: "instant" });
    }}>{children}<Arrow /></a>;
}
