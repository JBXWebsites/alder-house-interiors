"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMotionEnabled } from "@/components/MotionControl";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Motion() {
  const path = usePathname();
  const enabled = useMotionEnabled();
  const introducedPath = useRef<string | null>(null);
  const sentinel = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = sentinel.current?.closest("body");
      if (!root || !enabled) return;
      const mm = gsap.matchMedia();

      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1000px) and (min-height: 650px) and (pointer: fine)",
        },
        (context) => {
          if (!context.conditions?.animate) return;
          const desktop = Boolean(context.conditions.desktop);
          const cleanups: Array<() => void> = [];
          let disposed = false;
          let refreshTimer: ReturnType<typeof setTimeout> | undefined;
          const refresh = () => {
            if (disposed) return;
            clearTimeout(refreshTimer);
            refreshTimer = setTimeout(() => {
              if (!disposed) ScrollTrigger.refresh();
            }, 160);
          };
          const arrival = root.querySelector<HTMLElement>(".arrival");

          // The opening is a short introduction, never a gate on scrolling.
          // Hash entries and restored scroll positions retain their settled state.
          if (arrival && introducedPath.current !== path && window.scrollY < 24 && !window.location.hash) {
            introducedPath.current = path;
            const lines = arrival.querySelectorAll(".arrival-title .line-mask > span");
            const supporting = arrival.querySelectorAll(".arrival-caption, .arrival-link");
            const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
            if (lines.length) {
              opening.fromTo(
                lines,
                { yPercent: desktop ? 110 : 65 },
                { yPercent: 0, duration: desktop ? 0.94 : 0.7, stagger: 0.09, clearProps: "transform" },
                0,
              );
            }
            if (supporting.length) {
              opening.fromTo(
                supporting,
                { y: 14, opacity: 0.45 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, clearProps: "transform,opacity" },
                0.22,
              );
            }
          }

          if (desktop && arrival) {
            const frame = arrival.querySelector<HTMLElement>(".arrival-photo");
            const photo = arrival.querySelector<HTMLImageElement>(".arrival-plane");
            if (frame) {
              gsap.fromTo(
                frame,
                { scale: 0.92, transformOrigin: "50% 50%" },
                {
                  scale: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: frame,
                    start: "clamp(top 80%)",
                    end: "clamp(top 12%)",
                    scrub: 0.55,
                    invalidateOnRefresh: true,
                  },
                },
              );
            }
            if (photo && frame) {
              gsap.fromTo(photo, { y: 30 }, {
                y: -30,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "clamp(top bottom)",
                  end: "clamp(bottom top)",
                  scrub: 0.55,
                  invalidateOnRefresh: true,
                },
              });
            }
          }

          // Reading order determines the choreography. Elements already in view
          // stay settled when navigating directly to a chapter or restoring history.
          root.querySelectorAll<HTMLElement>("[data-heading], [data-reveal], [data-image-reveal], .footer-signature")
            .forEach((element) => {
              if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;
              const imageFrame = element.hasAttribute("data-image-reveal");
              const heading = element.hasAttribute("data-heading");
              const signature = element.classList.contains("footer-signature");
              const from = imageFrame
                ? { clipPath: desktop ? "inset(6% 6% 6% 6%)" : "inset(2% 2% 2% 2%)" }
                : { y: desktop ? (signature ? 52 : heading ? 36 : 32) : 18, opacity: heading ? 0.3 : 0.65 };
              const to = imageFrame
                ? { clipPath: "inset(0% 0% 0% 0%)", clearProps: "clipPath" }
                : { y: 0, opacity: 1, clearProps: "transform,opacity" };
              gsap.fromTo(element, from, {
                ...to,
                duration: desktop ? (signature ? 1.15 : 0.95) : 0.65,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 92%",
                  once: true,
                },
              });
            });

          if (desktop) {
            root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((frame) => {
              const photo = frame.querySelector<HTMLImageElement>(":scope > img");
              if (!photo) return;
              gsap.fromTo(photo, { yPercent: -6 }, {
                yPercent: 6,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "clamp(top bottom)",
                  end: "clamp(bottom top)",
                  scrub: 0.6,
                  invalidateOnRefresh: true,
                },
              });
            });
          }

          root.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("a, button").forEach((element) => {
            const arrow = element.querySelector(".action-arrow");
            if (!arrow) return;
            const direction = arrow.getAttribute("data-direction") || "right";
            const feedback = gsap.to(arrow, {
              x: direction === "right" ? 5 : direction === "left" ? -5 : 0,
              y: direction === "up" ? -5 : direction === "down" ? 5 : 0,
              duration: 0.22,
              ease: "power2.out",
              paused: true,
            });
            let hovered = false;
            let focused = false;
            const update = () => hovered || focused ? feedback.play() : feedback.reverse();
            const enter = () => { hovered = window.matchMedia("(hover: hover)").matches; update(); };
            const leave = () => { hovered = false; update(); };
            const focus = () => { focused = element.matches(":focus-visible"); update(); };
            const blur = () => { focused = false; update(); };
            element.addEventListener("pointerenter", enter);
            element.addEventListener("pointerleave", leave);
            element.addEventListener("focus", focus);
            element.addEventListener("blur", blur);
            cleanups.push(() => {
              element.removeEventListener("pointerenter", enter);
              element.removeEventListener("pointerleave", leave);
              element.removeEventListener("focus", focus);
              element.removeEventListener("blur", blur);
            });
          });

          if (desktop) {
            root.querySelectorAll<HTMLElement>(".project-photo").forEach((frame) => {
              const photo = frame.querySelector("img");
              const link = frame.closest("a") ?? frame.querySelector("a");
              if (!photo || !link) return;
              // Scale and scroll translation are separate properties. Neither tween
              // clears the other's transform, including during pointer reversals.
              const zoom = gsap.to(photo, { scale: 1.04, duration: 0.75, ease: "power2.out", paused: true });
              let hovered = false;
              let focused = false;
              const update = () => hovered || focused ? zoom.play() : zoom.reverse();
              const enter = () => { hovered = true; update(); };
              const leave = () => { hovered = false; update(); };
              const focus = () => { focused = link.matches(":focus-visible"); update(); };
              const blur = () => { focused = false; update(); };
              link.addEventListener("pointerenter", enter);
              link.addEventListener("pointerleave", leave);
              link.addEventListener("focus", focus);
              link.addEventListener("blur", blur);
              cleanups.push(() => {
                link.removeEventListener("pointerenter", enter);
                link.removeEventListener("pointerleave", leave);
                link.removeEventListener("focus", focus);
                link.removeEventListener("blur", blur);
              });
            });
          }

          // Observe layout boxes, not animated transforms; dimensions are cached so
          // refreshing ScrollTrigger cannot perpetually refresh itself.
          const dimensions = new WeakMap<Element, string>();
          const observer = new ResizeObserver((entries) => {
            let changed = false;
            for (const entry of entries) {
              const size = `${Math.round(entry.contentRect.width)}:${Math.round(entry.contentRect.height)}`;
              if (dimensions.get(entry.target) !== size) {
                dimensions.set(entry.target, size);
                changed = true;
              }
            }
            if (changed) refresh();
          });
          const main = root.querySelector("main");
          observer.observe(root);
          if (main) observer.observe(main);
          root.addEventListener("load", refresh, true);
          root.addEventListener("error", refresh, true);
          root.addEventListener("toggle", refresh, true);
          window.addEventListener("pageshow", refresh);
          void document.fonts.ready.then(refresh);
          refresh();

          return () => {
            disposed = true;
            clearTimeout(refreshTimer);
            observer.disconnect();
            root.removeEventListener("load", refresh, true);
            root.removeEventListener("error", refresh, true);
            root.removeEventListener("toggle", refresh, true);
            window.removeEventListener("pageshow", refresh);
            cleanups.forEach((cleanup) => cleanup());
          };
        },
        root,
      );
      return () => mm.revert();
    },
    { dependencies: [path, enabled], revertOnUpdate: true },
  );

  return <span hidden ref={sentinel} />;
}

