"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  BRIEF_FIELDS,
  COPY,
  DOWNLOAD_NAME,
  FIELD_LABELS,
  OPTIONS,
  draftFromForm,
  isOption,
  normalizeText,
  optionLabel,
  validateBrief,
  type BriefDraft,
  type BriefField,
  type FieldErrors,
  type SelectField,
} from "../lib/brief";
import "./brief.css";

type Mode = "editing" | "preparing" | "invalid" | "failed" | "ready";
type Result = { text: string; answers: BriefDraft };

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function serverErrors(value: unknown): FieldErrors {
  if (!value || typeof value !== "object") return {};
  const errors: FieldErrors = {};
  for (const field of BRIEF_FIELDS) {
    const message = (value as Record<string, unknown>)[field];
    if (
      typeof message === "string" &&
      message.length > 0 &&
      message.length <= 240
    )
      errors[field] = message;
  }
  return errors;
}

export default function BriefBuilder({
  initialInspiration = "",
  initialScope = "",
  initialSpace = "",
}: {
  initialInspiration?: string;
  initialScope?: string;
  initialSpace?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const extrasRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const lastInspiration = useRef(initialInspiration);
  const downloadURLs = useRef(new Set<string>());
  const downloadTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const [enhanced, setEnhanced] = useState(false);
  const [mode, setMode] = useState<Mode>("editing");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [feedback, setFeedback] = useState("");
  const [copying, setCopying] = useState(false);
  const [counts, setCounts] = useState({ brief: 0, location: 0 });
  const [retryUntil, setRetryUntil] = useState(0);
  const preparing = mode === "preparing";

  useEffect(() => {
    setEnhanced(true);
    if (formRef.current) {
      const values = draftFromForm(formRef.current);
      setCounts({
        brief: normalizeText(values.brief).length,
        location: normalizeText(values.location).length,
      });
      // The server rendered the URL default. Adopt the DOM here: a visitor may
      // already have changed or cleared that choice before hydration.
    }
    const abort = () => {
      requestId.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
    };
    const pageHide = () => {
      abort();
      setCopying(false);
      setMode((current) => (current === "preparing" ? "editing" : current));
    };
    window.addEventListener("pagehide", pageHide);
    return () => {
      abort();
      window.removeEventListener("pagehide", pageHide);
      for (const url of downloadURLs.current) URL.revokeObjectURL(url);
      for (const timer of downloadTimers.current) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (initialInspiration === lastInspiration.current) return;
    lastInspiration.current = initialInspiration;
    requestId.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    const field = formRef.current?.elements.namedItem(
      "inspiration",
    ) as HTMLSelectElement | null;
    if (field)
      field.value = isOption("inspiration", initialInspiration)
        ? initialInspiration
        : "";
    setResult(null);
    setFeedback("");
    setCopying(false);
    setErrors({});
    setFailure("");
    setMode("editing");
  }, [initialInspiration]);

  useEffect(() => {
    if ((errors.location || errors.timing || errors.inspiration) && extrasRef.current)
      extrasRef.current.open = true;
    if (mode === "invalid" || mode === "failed") summaryRef.current?.focus();
    if (mode === "ready") resultHeadingRef.current?.focus();
  }, [mode, errors, failure]);

  useEffect(() => {
    if (!retryUntil) return;
    const timer = setTimeout(
      () => setRetryUntil(0),
      Math.max(0, retryUntil - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [retryUntil]);

  useEffect(() => {
    const start = (event: Event) => {
      const choice = (event as CustomEvent<{scope: string; space: string}>).detail;
      if (!choice || !isOption("scope", choice.scope)) return;
      event.preventDefault();
      requestId.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
      for (const field of ["scope", "space"] as const) {
        const input = formRef.current?.elements.namedItem(field) as HTMLSelectElement | null;
        if (input && isOption(field, choice[field])) input.value = choice[field];
      }
      setResult(null); setErrors({}); setFailure(""); setFeedback(""); setCopying(false); setMode("editing");
      requestAnimationFrame(() => (formRef.current?.elements.namedItem("scope") as HTMLElement | null)?.focus({preventScroll:true}));
    };
    window.addEventListener("alder:brief-start", start);
    return () => window.removeEventListener("alder:brief-start", start);
  }, []);

  function onInput() {
    if (!formRef.current) return;
    const values = draftFromForm(formRef.current);
    setCounts({
      brief: normalizeText(values.brief).length,
      location: normalizeText(values.location).length,
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current || retryUntil > Date.now()) return;
    const draft = draftFromForm(event.currentTarget);
    const checked = validateBrief(draft);
    setErrors(checked.errors);
    setFailure("");
    setFeedback("");
    setResult(null);
    if (!checked.valid) {
      setMode("invalid");
      return;
    }

    const controller = new AbortController();
    const token = ++requestId.current;
    requestRef.current = controller;
    setMode("preparing");
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 12_000);
    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
        },
        body: new URLSearchParams(draft),
        signal: controller.signal,
        cache: "no-store",
        credentials: "same-origin",
      });
      if (requestId.current !== token) return;
      if (controller.signal.aborted) throw new Error(COPY.failure);
      if (response.status === 429) {
        const retry = response.headers.get("retry-after");
        const seconds = retry && /^\d+$/.test(retry) ? Number(retry) : NaN;
        const date = retry && !/^\d+$/.test(retry) ? Date.parse(retry) : NaN;
        const wait = Number.isFinite(seconds)
          ? seconds * 1000
          : date - Date.now();
        if (wait > 0 && wait <= 60_000) setRetryUntil(Date.now() + wait);
        throw new Error(
          "The demo has handled several requests in a short time. Please wait a moment, then try again. Your answers are still here.",
        );
      }
      if (response.status === 413)
        throw new Error(
          "This request is too large. Shorten the description and try again.",
        );
      if (response.status === 403)
        throw new Error(
          "This browser could not verify the request came from this site. Reopen the page and try again.",
        );
      if (
        !response.headers
          .get("content-type")
          ?.toLowerCase()
          .startsWith("application/json")
      )
        throw new Error(COPY.failure);
      const text = await response.text();
      if (text.length > 24_000) throw new Error(COPY.failure);
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error(COPY.failure);
      }
      if (!payload || typeof payload !== "object")
        throw new Error(COPY.failure);
      if (requestId.current !== token) return;
      if (controller.signal.aborted) throw new Error(COPY.failure);
      if (response.status === 422) {
        const corrections = serverErrors(payload.fieldErrors);
        if (!Object.keys(corrections).length) throw new Error(COPY.failure);
        setErrors(corrections);
        setMode("invalid");
        return;
      }
      if (
        !response.ok ||
        payload.ok !== true ||
        payload.schemaVersion !== 1 ||
        payload.downloadName !== DOWNLOAD_NAME ||
        payload.delivery !== "not-sent" ||
        payload.applicationStorage !== "not-persisted" ||
        typeof payload.briefText !== "string" ||
        !payload.briefText.length ||
        payload.briefText.length > 16_000
      )
        throw new Error(COPY.failure);
      setResult({ text: payload.briefText, answers: checked.values });
      setMode("ready");
    } catch (error) {
      if (requestId.current !== token) return;
      const allowed =
        error instanceof Error &&
        [
          COPY.failure,
          "The demo has handled several requests in a short time. Please wait a moment, then try again. Your answers are still here.",
          "This request is too large. Shorten the description and try again.",
          "This browser could not verify the request came from this site. Reopen the page and try again.",
        ].includes(error.message);
      setFailure(
        timedOut
          ? COPY.timeout
          : allowed && error instanceof Error
            ? error.message
            : COPY.failure,
      );
      setMode("failed");
    } finally {
      clearTimeout(timer);
      if (requestId.current === token) requestRef.current = null;
    }
  }

  async function copy() {
    if (!result || copying) return;
    setCopying(true);
    setFeedback("");
    const token = requestId.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Unavailable");
      await navigator.clipboard.writeText(result.text);
      if (requestId.current === token) setFeedback(COPY.copied);
    } catch {
      if (requestId.current === token) {
        setFeedback(COPY.copyFailure);
        outputRef.current?.focus();
      }
    } finally {
      if (requestId.current === token) setCopying(false);
    }
  }

  function download() {
    if (!result) return;
    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;
    try {
      url = URL.createObjectURL(
        new Blob([result.text], { type: "text/plain;charset=utf-8" }),
      );
      downloadURLs.current.add(url);
      link = document.createElement("a");
      link.href = url;
      link.download = DOWNLOAD_NAME;
      document.body.appendChild(link);
      link.click();
      link.remove();
      const completedURL = url;
      const timer = setTimeout(() => {
        URL.revokeObjectURL(completedURL);
        downloadURLs.current.delete(completedURL);
        downloadTimers.current.delete(timer);
      }, 60_000);
      downloadTimers.current.add(timer);
      setFeedback(COPY.downloaded);
    } catch {
      if (url) {
        URL.revokeObjectURL(url);
        downloadURLs.current.delete(url);
      }
      setFeedback(
        "The download could not start. Copy the brief or select the text below to keep it.",
      );
    } finally {
      link?.remove();
    }
  }

  function edit() {
    requestId.current += 1;
    setResult(null);
    setFeedback("");
    setCopying(false);
    setErrors({});
    setFailure("");
    setMode("editing");
    requestAnimationFrame(() =>
      (
        formRef.current?.elements.namedItem("space") as HTMLSelectElement | null
      )?.focus(),
    );
  }

  function description(field: BriefField) {
    return (
      [
        field === "location" || field === "brief" ? `brief-${field}-help` : "",
        errors[field] ? `brief-${field}-error` : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined
    );
  }

  function select(field: SelectField) {
    return (
      <div className="brief-field" key={field}>
        <label htmlFor={`brief-${field}`}>{FIELD_LABELS[field]}</label>
        <select
          id={`brief-${field}`}
          name={field}
          required={field === "space" || field === "scope"}
          defaultValue={
            field === "scope" && isOption("scope", initialScope) ? initialScope
            : field === "space" && isOption("space", initialSpace) ? initialSpace
            : field === "timing"
              ? "not-sure"
              : field === "inspiration" &&
                  isOption("inspiration", initialInspiration)
                ? initialInspiration
                : ""
          }
          aria-invalid={Boolean(errors[field]) || undefined}
          aria-describedby={description(field)}
        >
          {field !== "timing" && (
            <option value="">
              {field === "space"
                ? "Choose a space"
                : field === "scope"
                  ? "Choose the kind of help"
                  : "No study selected"}
            </option>
          )}
          {OPTIONS[field].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors[field] && (
          <p className="brief-error" id={`brief-${field}-error`}>
            {errors[field]}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="brief-builder" data-ready={mode === "ready"}>
      <form
        ref={formRef}
        action="/api/brief"
        method="post"
        acceptCharset="UTF-8"
        noValidate={enhanced}
        onSubmit={submit}
        onChange={onInput}
        hidden={mode === "ready"}
        aria-labelledby="brief-form-heading"
        aria-busy={preparing}
      >
        <div className="brief-introduction">
          <h3 id="brief-form-heading">Your starting point.</h3>
          <p>{COPY.notice}</p>
          <p className="brief-required">
            Space, type of help and description are required.
          </p>
        </div>
        {(mode === "invalid" || mode === "failed") && (
          <div ref={summaryRef} className="brief-error-summary" tabIndex={-1}>
            <p>
              {mode === "invalid" ? "Please check the answers below." : failure}
            </p>
            {Object.keys(errors).length > 0 && (
              <ul>
                {BRIEF_FIELDS.filter((field) => errors[field]).map((field) => (
                  <li key={field}>
                    <a
                      href={`#brief-${field}`}
                      onClick={(event) => {
                        event.preventDefault();
                        if (["location", "timing", "inspiration"].includes(field) && extrasRef.current)
                          extrasRef.current.open = true;
                        (
                          formRef.current?.elements.namedItem(
                            field,
                          ) as HTMLElement | null
                        )?.focus();
                      }}
                    >
                      {FIELD_LABELS[field]}: {errors[field]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <fieldset className="brief-fields" disabled={preparing}>
          <legend className="brief-visually-hidden">Your project</legend>
          {select("space")}
          {select("scope")}
          <div className="brief-field brief-field-wide">
            <label htmlFor="brief-brief">{FIELD_LABELS.brief}</label>
            <textarea id="brief-brief" name="brief" required minLength={10} rows={5} dir="auto"
              placeholder={COPY.placeholder} aria-invalid={Boolean(errors.brief) || undefined}
              aria-describedby={description("brief")} />
            <div className="brief-help-row">
              <p className="brief-help" id="brief-brief-help">{COPY.briefHelp}</p>
              <span className={`brief-count${counts.brief > 2000 ? " is-over" : ""}`}>{counts.brief.toLocaleString("en-US")} / 2,000</span>
            </div>
            {errors.brief && <p className="brief-error" id="brief-brief-error">{errors.brief}</p>}
          </div>
          <details ref={extrasRef} className="brief-extras">
            <summary><span>A few more details</span><span>Optional +</span></summary>
            <div className="brief-fields">
          <div className="brief-field">
            <label htmlFor="brief-location">{FIELD_LABELS.location}</label>
            <input
              id="brief-location"
              name="location"
              type="text"
              autoComplete="off"
              dir="auto"
              aria-invalid={Boolean(errors.location) || undefined}
              aria-describedby={description("location")}
            />
            <p className="brief-help" id="brief-location-help">
              {COPY.locationHelp}
            </p>
            {counts.location > 60 && (
              <p
                className={`brief-count${counts.location > 80 ? " is-over" : ""}`}
              >
                {counts.location} / 80 characters
              </p>
            )}
            {errors.location && (
              <p className="brief-error" id="brief-location-error">
                {errors.location}
              </p>
            )}
          </div>
          {select("timing")}
          {select("inspiration")}
            </div>
          </details>
        </fieldset>
        <div className="brief-processing">
          <p>{COPY.processing}</p>
          <p>
            {COPY.hosting}{" "}
            <a href="/about-this-project#privacy">
              Read how this demo handles information.
            </a>
          </p>
        </div>
        <div className="brief-submit-row">
          <button
            className="brief-button"
            type="submit"
            disabled={preparing || retryUntil > Date.now()}
          >
            <span>{preparing ? COPY.pending : "Prepare my brief"}</span>
            <Arrow />
          </button>
          <p className="brief-draft-reminder">{COPY.reminder}</p>
        </div>
        <noscript>
          <p className="brief-noscript">{COPY.noscript}</p>
        </noscript>
        <p className="brief-visually-hidden" role="status">
          {preparing ? COPY.pending : ""}
        </p>
      </form>
      {mode === "ready" && result && (
        <section
          className="brief-result"
          aria-labelledby="brief-result-heading"
        >
          <p className="brief-result-label">A starting point to keep</p>
          <h3 ref={resultHeadingRef} tabIndex={-1} id="brief-result-heading">
            Your brief is ready.
          </h3>
          <p className="brief-result-intro">{COPY.success}</p>
          <dl className="brief-answer-summary">
            <div>
              <dt>Space</dt>
              <dd>{optionLabel("space", result.answers.space)}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{optionLabel("scope", result.answers.scope)}</dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>{optionLabel("timing", result.answers.timing)}</dd>
            </div>
            {result.answers.inspiration && (
              <div>
                <dt>Study</dt>
                <dd>
                  {optionLabel("inspiration", result.answers.inspiration)}
                </dd>
              </div>
            )}
          </dl>
          <div className="brief-result-actions">
            <button className="brief-button" type="button" onClick={download}>
              <span>Download brief (.txt)</span>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              className="brief-text-button"
              type="button"
              disabled={copying}
              onClick={copy}
            >
              Copy brief
            </button>
            <button className="brief-text-button" type="button" onClick={edit}>
              Edit answers
            </button>
          </div>
          <p className="brief-feedback" role="status">
            {feedback}
          </p>
          <label className="brief-output-label" htmlFor="brief-output">
            Your complete project brief
          </label>
          <textarea
            ref={outputRef}
            id="brief-output"
            className="brief-output"
            readOnly
            dir="auto"
            value={result.text}
            rows={16}
          />
          <pre className="brief-print-output" aria-hidden="true">
            {result.text}
          </pre>
        </section>
      )}
    </div>
  );
}
