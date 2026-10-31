"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import "./motion-control.css";

const preferenceKey = "alder-motion-paused";
const changeEvent = "alder:motion-change";
let memoryPaused: boolean | undefined;

function deviceReducesMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function motionEnabled() {
  if (deviceReducesMotion()) return false;
  if (memoryPaused === undefined) {
    try {
      memoryPaused = sessionStorage.getItem(preferenceKey) === "true";
    } catch {
      memoryPaused = false;
    }
  }
  return !memoryPaused;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener(changeEvent, onChange);
  query.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    query.removeEventListener("change", onChange);
  };
}

function publish(enabled: boolean) {
  document.documentElement.dataset.alderMotion = enabled ? "on" : "off";
  window.dispatchEvent(new CustomEvent(changeEvent, { detail: { enabled } }));
}

// A settled server snapshot makes delayed hydration safe. Every motion island
// listens to the same preference, including live changes to the device setting.
export function useMotionEnabled() {
  return useSyncExternalStore(subscribe, motionEnabled, () => false);
}

export default function MotionControl() {
  const enabled = useMotionEnabled();
  const reducedByDevice = useSyncExternalStore(subscribe, deviceReducesMotion, () => true);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (ready) publish(enabled);
  }, [enabled, ready]);

  if (!ready) return null;
  if (reducedByDevice) {
    return <p className="motion-control">Motion reduced to match your device.</p>;
  }

  function toggle() {
    memoryPaused = enabled;
    try {
      sessionStorage.setItem(preferenceKey, String(memoryPaused));
    } catch {
      // The control still works if the browser blocks session storage.
    }
    publish(motionEnabled());
  }

  return (
    <div className="motion-control">
      <button
        type="button"
        className="text-link"
        aria-label="Motion effects"
        aria-pressed={enabled}
        onClick={toggle}
      >
        Motion effects: <span aria-hidden="true">{enabled ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

