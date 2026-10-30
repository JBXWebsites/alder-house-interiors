"use client";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP, ScrollTrigger);
export default function Motion() {
  const path = usePathname();
  const sentinel = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cleanups: Array<() => void> = [];
        document
          .querySelectorAll<HTMLElement>("[data-reveal]")
          .forEach((el) => {
            if (el.getBoundingClientRect().top < window.innerHeight) return;
            const tween = gsap.fromTo(
              el,
              { y: 8 },
              {
                y: 0,
                duration: 0.42,
                ease: "power2.out",
                paused: true,
                clearProps: "transform",
              },
            );
            ScrollTrigger.create({
              trigger: el,
              start: "top 94%",
              once: true,
              onEnter: () => {
                tween.play();
              },
            });
          });
        document
          .querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("a,button")
          .forEach((el) => {
            const arrow = el.querySelector(".action-arrow");
            if (!arrow) return;
            let hovered = false,
              focused = false;
            const direction = arrow.getAttribute("data-direction") || "right";
            const update = () =>
              gsap.to(arrow, {
                x:
                  hovered || focused
                    ? direction === "right"
                      ? 4
                      : direction === "left"
                        ? -4
                        : 0
                    : 0,
                y:
                  hovered || focused
                    ? direction === "up"
                      ? -4
                      : direction === "down"
                        ? 4
                        : 0
                    : 0,
                duration: 0.16,
                ease: "power1.out",
                overwrite: true,
              });
            const enter = () => {
              hovered = matchMedia("(hover:hover)").matches;
              update();
            };
            const leave = () => {
              hovered = false;
              update();
            };
            const focus = () => {
              focused = el.matches(":focus-visible");
              update();
            };
            const blur = () => {
              focused = false;
              update();
            };
            el.addEventListener("pointerenter", enter);
            el.addEventListener("pointerleave", leave);
            el.addEventListener("focus", focus);
            el.addEventListener("blur", blur);
            cleanups.push(() => {
              el.removeEventListener("pointerenter", enter);
              el.removeEventListener("pointerleave", leave);
              el.removeEventListener("focus", focus);
              el.removeEventListener("blur", blur);
              gsap.killTweensOf(arrow);
              gsap.set(arrow, { clearProps: "transform" });
            });
          });
        return () => cleanups.forEach((fn) => fn());
      });
      mm.add(
        "(min-width:1200px) and (min-height:720px) and (pointer:fine) and (prefers-reduced-motion:no-preference)",
        () => {
          const photo = document.querySelector(".hero-image-plane");
          if (!(photo instanceof HTMLImageElement)) return;
          gsap.fromTo(
            photo,
            { y: 12 },
            {
              y: -12,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero-main",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.15,
              },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { dependencies: [path], revertOnUpdate: true },
  );
  return <span hidden ref={sentinel} />;
}
