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
  const menu = useRef<HTMLDetailsElement>(null);
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
        <details ref={menu} className="phone-menu" onKeyDown={(event) => {
          if (event.key === "Escape" && menu.current?.open) {
            menu.current.open = false;
            menu.current.querySelector("summary")?.focus();
          }
        }}>
          <summary>Explore <span aria-hidden="true">+</span></summary>
          <div className="phone-menu-links" onClick={(event) => {
            if ((event.target as HTMLElement).closest("a") && menu.current) menu.current.open = false;
          }}>
            <a href="/#work">The rooms</a>
            <a href="/#studio">Point of view</a>
            <a href="/#approach">Our approach</a>
            <a href="/about-this-project">About this concept</a>
          </div>
        </details>
        <a className="desktop-nav" href="/#work">Work</a>
        <a className="desktop-nav" href="/#studio">
          Studio
        </a>
        <a className="desktop-nav" href="/#approach">Approach</a>
        <a href="/#project-brief" className="header-begin">
          <span className="desktop-label">Begin a project</span>
          <span className="phone-label">Begin</span>
          <Arrow />
        </a>
      </nav>
    </header>
  );
}
