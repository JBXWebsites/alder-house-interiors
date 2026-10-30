"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Arrow, Monogram } from "./Icons";
export function TopLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const path = usePathname();
  const isWordmark = className === "wordmark";
  return (
    <a
      className={className}
      href={isWordmark ? "/#top" : "#top"}
      aria-label={
        isWordmark
          ? path === "/"
            ? "Alder House, back to top"
            : "Alder House, home"
          : undefined
      }
      onClick={(e) => {
        if (
          (path === "/" || !isWordmark) &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "instant" });
          const target = document.getElementById("top");
          target?.focus({ preventScroll: true });
          if (location.hash)
            history.pushState(null, "", location.pathname + location.search);
        }
      }}
    >
      {children}
    </a>
  );
}
export default function Navigation() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () =>
      document.documentElement.style.setProperty(
        "--header-height",
        `${el.getBoundingClientRect().height}px`,
      );
    resize();
    const ob = new ResizeObserver(resize);
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <header className="site-header" ref={ref}>
      <TopLink className="wordmark">
        <Monogram />
        <span>Alder House</span>
      </TopLink>
      <span className="header-descriptor">
        Residential interiors
        <br />
        Tampa Bay, imagined
      </span>
      <nav aria-label="Main navigation">
        <a href="/#work">Work</a>
        <a className="desktop-nav" href="/#approach">
          Approach
        </a>
        <a className="desktop-nav" href="/#studio">
          Studio
        </a>
        <a href="/#project-brief" className="header-begin">
          <span className="desktop-label">Begin a project</span>
          <span className="phone-label">Begin</span>
          <Arrow />
        </a>
      </nav>
    </header>
  );
}
