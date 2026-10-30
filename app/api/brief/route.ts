import {
  BRIEF_FIELDS,
  COPY,
  DOWNLOAD_NAME,
  FIELD_LABELS,
  MAX_BODY_BYTES,
  OPTIONS as FIELD_OPTIONS,
  emptyDraft,
  formatBrief,
  normalizeText,
  parseBriefBody,
  validateBrief,
  type BriefDraft,
  type BriefField,
  type FieldErrors,
  type SelectField,
} from "../../../lib/brief";

export const runtime = "nodejs";

type ErrorCode =
  | "INVALID_REQUEST"
  | "ORIGIN_NOT_ALLOWED"
  | "METHOD_NOT_ALLOWED"
  | "REQUEST_TIMEOUT"
  | "BODY_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "VALIDATION_ERROR"
  | "PREPARATION_FAILED"
  | "DEMO_UNAVAILABLE";

class RequestFailure extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function canonicalOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      !/^https?:$/.test(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

function allowedOrigins(): Set<string> {
  const origins = new Set<string>();
  const configured = [
    process.env.SITE_URL,
    ...(process.env.APP_ALLOWED_ORIGINS ?? "").split(","),
  ];
  for (const value of configured) {
    if (!value?.trim()) continue;
    const origin = canonicalOrigin(value.trim());
    if (origin) origins.add(origin);
  }
  // This is server-provided deployment configuration, never a visitor Host header.
  const deployment = process.env.VERCEL_URL;
  if (
    process.env.VERCEL === "1" &&
    deployment &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.vercel\.app$/i.test(deployment)
  ) {
    origins.add(`https://${deployment.toLowerCase()}`);
  }
  if (process.env.NODE_ENV === "development") {
    const port = /^\d{1,5}$/.test(process.env.PORT ?? "")
      ? Number(process.env.PORT)
      : 3000;
    if (port > 0 && port <= 65535) {
      origins.add(`http://localhost:${port}`);
      origins.add(`http://127.0.0.1:${port}`);
    }
  }
  return origins;
}

function wantsJSON(request: Request): boolean {
  return (request.headers.get("accept") ?? "").split(",").some((part) => {
    const [media, ...parameters] = part.trim().toLowerCase().split(";");
    return (
      media === "application/json" &&
      !parameters.some((parameter) => /^\s*q=0(?:\.0*)?\s*$/.test(parameter))
    );
  });
}

function responseHeaders(html = false): Headers {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": html ? "strict-origin-when-cross-origin" : "no-referrer",
    Vary: "Accept",
  });
  if (html) {
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set(
      "Content-Security-Policy",
      "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    );
  }
  return headers;
}

function escapeHTML(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}

const nativeCSS = `:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#c9dbe4;color:#2e2118;font:17px/1.6 system-ui,sans-serif}main{max-width:860px;margin:auto;padding:48px 24px 72px}a{color:inherit;text-underline-offset:4px}h1,h2{font-family:Georgia,serif;font-weight:400;line-height:1.15}h1{font-size:clamp(34px,6vw,56px)}h2{font-size:28px}.brand{font-family:Georgia,serif;font-size:24px}.intro{max-width:62ch}.errors{border:1px solid #824e3d;padding:20px;margin:24px 0}.errors p{margin:0}.errors ul{margin:12px 0 0;padding-left:22px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.field{min-width:0}.wide{grid-column:1/-1}label{display:block;margin-bottom:8px;font-size:15px;font-weight:600}input,select,textarea{width:100%;max-width:100%;border:1px solid #776c64;border-radius:2px;background:#f8f6f1;color:#2e2118;padding:13px;font:inherit}textarea{min-height:160px;resize:vertical}[aria-invalid=true]{border-color:#824e3d}.help,.error,.notice{font-size:14px}.help{margin:8px 0 0}.error{color:#824e3d;font-weight:600;margin:8px 0 0}.privacy{margin-top:28px;padding-top:20px;border-top:1px solid #8a9291;max-width:65ch}button{min-height:48px;padding:14px 24px;border:1px solid #44372d;border-radius:2px;background:#44372d;color:#f8f6f1;font:inherit;cursor:pointer;margin-top:18px}:focus-visible{outline:2px solid currentColor;outline-offset:5px}button:focus-visible{outline-color:#2e2118}@media(max-width:600px){.grid{grid-template-columns:1fr}main{padding:30px 20px 56px}}@media(forced-colors:active){input,select,textarea,button{border:1px solid ButtonText}.errors{border:1px solid CanvasText}}`;

function documentHTML(title: string, body: string): string {
  return `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHTML(title)} | Alder House</title><style>${nativeCSS}</style></head><body><main><a class="brand" href="/">Alder House</a>${body}</main></body></html>`;
}

function nativeValidationHTML(values: BriefDraft, errors: FieldErrors): string {
  const fields = BRIEF_FIELDS.map((field) => {
    const id = `brief-${field}`;
    const error = errors[field];
    const helper =
      field === "location"
        ? COPY.locationHelp
        : field === "brief"
          ? COPY.briefHelp
          : "";
    const descriptions = [helper && `${id}-help`, error && `${id}-error`]
      .filter(Boolean)
      .join(" ");
    const attributes = `id="${id}" name="${field}"${error ? ' aria-invalid="true"' : ""}${descriptions ? ` aria-describedby="${descriptions}"` : ""}`;
    let control: string;
    if (field === "brief") {
      control = `<textarea ${attributes} required minlength="10" rows="7" dir="auto">${escapeHTML(values.brief)}</textarea>`;
    } else if (field === "location") {
      control = `<input ${attributes} type="text" value="${escapeHTML(values.location)}" autocomplete="off" dir="auto">`;
    } else {
      const key = field as SelectField;
      const placeholder =
        key === "space"
          ? "Choose a space"
          : key === "scope"
            ? "Choose the kind of help"
            : key === "inspiration"
              ? "No study selected"
              : "Not sure yet";
      const selectedValue =
        normalizeText(values[key]) || (key === "timing" ? "not-sure" : "");
      const knownValue = FIELD_OPTIONS[key].some(
        ([value]) => value === selectedValue,
      );
      const options = FIELD_OPTIONS[key]
        .map(
          ([value, label]) =>
            `<option value="${value}"${selectedValue === value ? " selected" : ""}>${escapeHTML(label)}</option>`,
        )
        .join("");
      const emptyOption =
        key !== "timing" || !knownValue
          ? `<option value=""${!knownValue ? " selected" : ""}>${key === "timing" ? "Choose a timing option" : placeholder}</option>`
          : "";
      control = `<select ${attributes}${key === "space" || key === "scope" ? " required" : ""}>${emptyOption}${options}</select>`;
    }
    return `<div class="field${field === "brief" ? " wide" : ""}"><label for="${id}">${FIELD_LABELS[field]}</label>${control}${helper ? `<p class="help" id="${id}-help">${escapeHTML(helper)}</p>` : ""}${error ? `<p class="error" id="${id}-error">${escapeHTML(error)}</p>` : ""}</div>`;
  }).join("");
  const summary = BRIEF_FIELDS.filter((field) => errors[field])
    .map(
      (field) =>
        `<li><a href="#brief-${field}">${escapeHTML(FIELD_LABELS[field])}: ${escapeHTML(errors[field]!)}</a></li>`,
    )
    .join("");
  return documentHTML(
    "Please check your brief",
    `<h1>Build a project brief</h1><p class="intro">${COPY.notice}</p><section class="errors" aria-labelledby="error-heading" tabindex="-1"><h2 id="error-heading">Please check the answers below.</h2><ul>${summary}</ul></section><form action="/api/brief" method="post" accept-charset="UTF-8"><div class="grid">${fields}</div><div class="privacy"><p class="notice">${COPY.processing}</p><p class="notice">${COPY.hosting} <a href="/about-this-project#privacy">Read how this demo handles information.</a></p><button type="submit">Prepare my brief</button><p class="notice">${COPY.noscript}</p><p class="notice">${COPY.reminder}</p></div></form><p><a href="/#project-brief">Return to the portfolio</a></p>`,
  );
}

function errorResponse(
  request: Request,
  status: number,
  code: ErrorCode,
  message: string,
  fieldErrors?: FieldErrors,
  values?: BriefDraft,
): Response {
  const json = wantsJSON(request);
  const headers = responseHeaders(!json);
  if (status === 405) headers.set("Allow", "POST");
  if (json) {
    headers.set("Content-Type", "application/json; charset=utf-8");
    return new Response(
      request.method === "HEAD"
        ? null
        : JSON.stringify({
            ok: false,
            code,
            message,
            ...(fieldErrors ? { fieldErrors } : {}),
          }),
      { status, headers },
    );
  }
  const html =
    status === 422 && values && fieldErrors
      ? nativeValidationHTML(values, fieldErrors)
      : documentHTML(
          "Brief preparation unavailable",
          `<h1>We could not prepare the brief.</h1><p class="intro">${escapeHTML(message)}</p><p>No inquiry has been sent to a designer.</p><p><a href="/#project-brief">Return to the brief builder</a></p>`,
        );
  return new Response(request.method === "HEAD" ? null : html, {
    status,
    headers,
  });
}

async function boundedBody(request: Request): Promise<Uint8Array> {
  const length = request.headers.get("content-length");
  if (length !== null) {
    if (!/^\d+$/.test(length))
      throw new RequestFailure(
        400,
        "INVALID_REQUEST",
        "The request could not be read. Please try again.",
      );
    if (BigInt(length) > BigInt(MAX_BODY_BYTES))
      throw new RequestFailure(
        413,
        "BODY_TOO_LARGE",
        "This request is too large. Shorten the description and try again.",
      );
  }
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new RequestFailure(
            408,
            "REQUEST_TIMEOUT",
            "The request took too long. Please try again.",
          ),
        ),
      3000,
    );
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES)
        throw new RequestFailure(
          413,
          "BODY_TOO_LARGE",
          "This request is too large. Shorten the description and try again.",
        );
      chunks.push(value);
    }
    const result = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    if (new URL(request.url).search)
      return errorResponse(
        request,
        400,
        "INVALID_REQUEST",
        "Use the form without query parameters.",
      );
    const origins = allowedOrigins();
    const rawOrigin = request.headers.get("origin");
    const origin = rawOrigin ? canonicalOrigin(rawOrigin) : null;
    const fetchSite = request.headers.get("sec-fetch-site");
    if (
      !origin ||
      !origins.has(origin) ||
      (fetchSite !== null && fetchSite !== "same-origin")
    ) {
      return errorResponse(
        request,
        403,
        "ORIGIN_NOT_ALLOWED",
        "This browser could not verify the request came from this site. Reopen the page and try again.",
      );
    }
    if (process.env.BRIEF_ENABLED === "false")
      return errorResponse(
        request,
        503,
        "DEMO_UNAVAILABLE",
        "Brief preparation is temporarily unavailable. You can still explore the room studies.",
      );
    const type = request.headers.get("content-type") ?? "";
    const encoding = request.headers.get("content-encoding");
    if (
      !/^application\/x-www-form-urlencoded(?:\s*;\s*charset\s*=\s*(?:UTF-8|"UTF-8"))?\s*$/i.test(
        type,
      ) ||
      (encoding !== null && encoding.toLowerCase() !== "identity")
    ) {
      return errorResponse(
        request,
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Submit this form as plain form data.",
      );
    }
    const bytes = await boundedBody(request);
    let parsed: Partial<BriefDraft>;
    try {
      parsed = parseBriefBody(bytes);
    } catch {
      return errorResponse(
        request,
        400,
        "INVALID_REQUEST",
        "The request could not be read. Please check the form and try again.",
      );
    }
    const checked = validateBrief(parsed);
    if (!checked.valid)
      return errorResponse(
        request,
        422,
        "VALIDATION_ERROR",
        "Please check the answers below.",
        checked.errors,
        { ...emptyDraft(), ...parsed },
      );
    const briefText = formatBrief(checked.values);
    const headers = responseHeaders();
    if (wantsJSON(request)) {
      headers.set("Content-Type", "application/json; charset=utf-8");
      return new Response(
        JSON.stringify({
          ok: true,
          schemaVersion: 1,
          briefText,
          downloadName: DOWNLOAD_NAME,
          delivery: "not-sent",
          applicationStorage: "not-persisted",
        }),
        { headers },
      );
    }
    headers.set("Content-Type", "text/plain; charset=utf-8");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${DOWNLOAD_NAME}"`,
    );
    return new Response(briefText, { headers });
  } catch (error) {
    if (error instanceof RequestFailure)
      return errorResponse(request, error.status, error.code, error.message);
    return errorResponse(
      request,
      500,
      "PREPARATION_FAILED",
      "We could not prepare the brief. Please try again.",
    );
  }
}

function unsupported(request: Request): Response {
  return errorResponse(
    request,
    405,
    "METHOD_NOT_ALLOWED",
    "Use the brief form to prepare a document.",
  );
}

export const GET = unsupported;
export const HEAD = unsupported;
export const OPTIONS = unsupported;
export const PUT = unsupported;
export const PATCH = unsupported;
export const DELETE = unsupported;
