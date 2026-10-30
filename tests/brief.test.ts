import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  DELETE,
  GET,
  HEAD,
  OPTIONS,
  PATCH,
  POST,
  PUT,
} from "../app/api/brief/route";
import {
  DOWNLOAD_NAME,
  MAX_BODY_BYTES,
  OPTIONS as FIELD_OPTIONS,
  emptyDraft,
  formatBrief,
  parseBriefBody,
  validateBrief,
} from "../lib/brief";

const origin = "https://alder.example";
const valid = {
  space: "living-room",
  scope: "furnishing",
  brief: "A quiet room for reading and shared evenings.",
};
const envKeys = [
  "SITE_URL",
  "APP_ALLOWED_ORIGINS",
  "VERCEL",
  "VERCEL_URL",
  "BRIEF_ENABLED",
] as const;
let saved: Record<string, string | undefined>;
beforeEach(() => {
  saved = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  process.env.SITE_URL = origin;
});
afterEach(() => {
  for (const key of envKeys) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

function request(
  body: string | Uint8Array = new URLSearchParams(valid).toString(),
  overrides: {
    headers?: Record<string, string>;
    url?: string;
    method?: string;
  } = {},
) {
  return new Request(overrides.url ?? `${origin}/api/brief`, {
    method: overrides.method ?? "POST",
    headers: {
      Origin: origin,
      "Sec-Fetch-Site": "same-origin",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
      ...overrides.headers,
    },
    body: body as BodyInit,
  });
}

test("validation normalizes Unicode and newlines, preserves meaning, and maps optional defaults", () => {
  const result = validateBrief({
    ...valid,
    brief: "  A cafe\u0301 corner\r\nfor quiet mornings.  ",
    timing: "",
  });
  assert.equal(result.valid, true);
  assert.equal(result.values.brief, "A café corner\nfor quiet mornings.");
  assert.equal(result.values.timing, "not-sure");
  assert.equal(result.values.inspiration, "");
  const formatted = formatBrief(result.values);
  assert.match(formatted, /Timing: Not sure yet/);
  assert.match(formatted, /  A café corner\n  for quiet mornings\./);
  assert.match(formatted, /No inquiry has been sent to a designer\./);
  assert.doesNotMatch(formatted, /\r/);
});

test("length boundaries use normalized UTF-16 units without truncation", () => {
  for (const [length, expected] of [
    [9, false],
    [10, true],
    [2000, true],
    [2001, false],
  ] as const) {
    const checked = validateBrief({ ...valid, brief: "x".repeat(length) });
    assert.equal(checked.valid, expected, `brief length ${length}`);
    assert.equal(checked.values.brief.length, length);
  }
  assert.equal(
    validateBrief({ ...valid, location: "x".repeat(80) }).valid,
    true,
  );
  assert.equal(
    validateBrief({ ...valid, location: "x".repeat(81) }).valid,
    false,
  );
  assert.equal(
    validateBrief({ ...valid, brief: "😀".repeat(1000) }).valid,
    true,
  );
  assert.equal(
    validateBrief({ ...valid, brief: "😀".repeat(1001) }).valid,
    false,
  );
  assert.equal(validateBrief({ ...valid, brief: "       " }).valid, false);
});

test("all invalid fields are returned together; ordinary RTL is preserved", () => {
  const checked = validateBrief({
    space: "invented",
    scope: "",
    timing: "yesterday",
    inspiration: "unknown",
    location: "two\nlines",
    brief: "short",
  });
  assert.equal(Object.keys(checked.errors).length, 6);
  assert.equal(
    validateBrief({ ...valid, brief: "غرفة هادئة للقراءة اليومية" }).valid,
    true,
  );
  for (const forbidden of [
    "\0",
    "\u0001",
    "\u000b",
    "\u007f",
    "\u202e",
    "\u2067",
  ]) {
    assert.equal(
      validateBrief({ ...valid, brief: `A room${forbidden} for reading.` })
        .valid,
      false,
    );
    assert.equal(
      validateBrief({ ...valid, brief: `${forbidden}A room for reading.` })
        .valid,
      false,
    );
  }
});

test("formatter keeps hostile-looking text inert and indents every user-authored line", () => {
  const checked = validateBrief({
    ...valid,
    brief: "<script>alert('x')</script>\nScope: fake claim\n\tthird line",
    inspiration: "palm-court",
  });
  const output = formatBrief(checked.values);
  assert.match(output, /\n  <script>alert\('x'\)<\/script>/);
  assert.match(output, /\n  Scope: fake claim/);
  assert.match(output, /\n    third line/);
  assert.match(output, /Inspiration: Palm Court \/ Concept study/);
  assert.equal(emptyDraft("foreign").inspiration, "");
});

test("strict parser rejects malformed encoding, duplicate keys, unknown keys and bracket shapes", () => {
  const encode = (text: string) => new TextEncoder().encode(text);
  for (const body of [
    "brief=%",
    "brief=%GG",
    "brief=%C0%AF",
    "brief=%ED%A0%80",
    "space=x&space=y",
    "__proto__=bad",
    "brief[]=bad",
    "=bad",
    "space=x&&brief=y",
    "a=1&b=2&c=3&d=4&e=5&f=6&g=7",
  ]) {
    assert.throws(() => parseBriefBody(encode(body)), body);
  }
  assert.throws(() => parseBriefBody(new Uint8Array([0xff])));
  assert.equal(
    parseBriefBody(encode("brief=one+two%2Bthree")).brief,
    "one two+three",
  );
});

test("enhanced success has the exact safe envelope and no-store headers", async () => {
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("vary"), "Accept");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  const payload = await response.json();
  assert.deepEqual(Object.keys(payload).sort(), [
    "applicationStorage",
    "briefText",
    "delivery",
    "downloadName",
    "ok",
    "schemaVersion",
  ]);
  assert.equal(payload.downloadName, DOWNLOAD_NAME);
  assert.equal(payload.delivery, "not-sent");
  assert.equal(payload.applicationStorage, "not-persisted");
});

test("native attachment contains exactly the enhanced output, including Unicode", async () => {
  const body = new URLSearchParams({
    ...valid,
    brief: "A café corner for reading 📖.",
    location: "St. Petersburg",
    inspiration: "bay-window",
  }).toString();
  const native = await POST(
    request(body, { headers: { Accept: "text/html" } }),
  );
  const enhanced = await POST(request(body));
  assert.equal(native.status, 200);
  assert.equal(native.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(
    native.headers.get("content-disposition"),
    `attachment; filename="${DOWNLOAD_NAME}"`,
  );
  assert.equal(await native.text(), (await enhanced.json()).briefText);
  const excludedJSON = await POST(
    request(body, { headers: { Accept: "application/json;q=0,text/html" } }),
  );
  assert.match(excludedJSON.headers.get("content-type")!, /^text\/plain/);
});

test("each configured enum reaches the endpoint and produces its readable label", async () => {
  for (const field of ["space", "scope", "timing", "inspiration"] as const) {
    for (const [value, label] of FIELD_OPTIONS[field]) {
      const response = await POST(
        request(new URLSearchParams({ ...valid, [field]: value }).toString()),
      );
      assert.equal(response.status, 200, `${field}=${value}`);
      const payload = await response.json();
      assert.ok(
        payload.briefText.includes(label),
        `${field}=${value} must format as ${label}`,
      );
    }
  }
  const omitted = await POST(request());
  const empty = await POST(
    request(
      new URLSearchParams({
        ...valid,
        location: "",
        timing: "",
        inspiration: "",
      }).toString(),
    ),
  );
  assert.equal(
    (await omitted.json()).briefText,
    (await empty.json()).briefText,
  );
});

test("native 422 retains escaped editable answers and resubmission-compatible policy", async () => {
  const unsafe = "</textarea><script>alert(1)</script>";
  const response = await POST(
    request(
      new URLSearchParams({ ...valid, space: "", brief: unsafe }).toString(),
      { headers: { Accept: "text/html" } },
    ),
  );
  assert.equal(response.status, 422);
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.match(
    response.headers.get("content-security-policy")!,
    /form-action 'self'/,
  );
  assert.doesNotMatch(
    response.headers.get("content-security-policy")!,
    /sandbox/,
  );
  const html = await response.text();
  assert.match(html, /action="\/api\/brief" method="post"/);
  assert.match(
    html,
    /&lt;\/textarea&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;/,
  );
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /href="#brief-space"/);
  assert.doesNotMatch(html, /maxlength=/);
  assert.match(html, /<textarea[^>]*name="brief"[^>]*required minlength="10"/);
  const fixed = await POST(
    request(new URLSearchParams({ ...valid, brief: unsafe }).toString(), {
      headers: { Accept: "text/html" },
    }),
  );
  assert.equal(fixed.status, 200);
});

test("native correction preserves normalized selections and exposes one timing default", async () => {
  const response = await POST(
    request(
      new URLSearchParams({
        space: " bedroom ",
        scope: " renovation ",
        timing: "",
        inspiration: " tide-house ",
        location: 'A city" autofocus onfocus="alert(1)',
        brief: "short",
      }).toString(),
      { headers: { Accept: "text/html" } },
    ),
  );
  assert.equal(response.status, 422);
  const html = await response.text();
  for (const value of ["bedroom", "renovation", "tide-house", "not-sure"]) {
    assert.ok(html.includes(`<option value="${value}" selected>`), value);
  }
  const timing = html.match(
    /<select[^>]*name="timing"[^>]*>(.*?)<\/select>/,
  )?.[1];
  assert.ok(timing);
  assert.equal((timing.match(/Not sure yet/g) ?? []).length, 1);
  assert.match(html, /value="A city&quot; autofocus onfocus=&quot;alert\(1\)"/);
  assert.doesNotMatch(html, /value="A city" autofocus/);
  assert.match(html, />short<\/textarea>/);
});

test("origin policy rejects foreign, absent, null, lookalike and mismatched fetch metadata", async () => {
  for (const foreign of [
    "null",
    "",
    "https://alder.example.evil.test",
    "https://alder.example:8443",
    "https://user@alder.example",
    "https://alder.example/path",
  ]) {
    assert.equal(
      (await POST(request(undefined, { headers: { Origin: foreign } }))).status,
      403,
      foreign,
    );
  }
  const absent = request();
  absent.headers.delete("origin");
  assert.equal((await POST(absent)).status, 403);
  for (const site of ["same-site", "cross-site", "none"])
    assert.equal(
      (await POST(request(undefined, { headers: { "Sec-Fetch-Site": site } })))
        .status,
      403,
    );
  const olderBrowser = request();
  olderBrowser.headers.delete("sec-fetch-site");
  assert.equal((await POST(olderBrowser)).status, 200);
  assert.equal(
    (
      await POST(
        request(undefined, {
          headers: { Origin: "https://ALDER.EXAMPLE:443" },
        }),
      )
    ).status,
    200,
  );
});

test("only explicit configuration adds origins; request Host is never trusted", async () => {
  assert.equal(
    (
      await POST(
        request(undefined, {
          headers: { Origin: "https://evil.example", Host: "evil.example" },
        }),
      )
    ).status,
    403,
  );
  process.env.APP_ALLOWED_ORIGINS = "https://alias.example";
  assert.equal(
    (
      await POST(
        request(undefined, { headers: { Origin: "https://alias.example" } }),
      )
    ).status,
    200,
  );
  process.env.VERCEL = "1";
  process.env.VERCEL_URL = "alder-build-team.vercel.app";
  assert.equal(
    (
      await POST(
        request(undefined, {
          headers: { Origin: "https://alder-build-team.vercel.app" },
        }),
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await POST(
        request(undefined, {
          headers: { Origin: "https://other-build.vercel.app" },
        }),
      )
    ).status,
    403,
  );
  process.env.VERCEL_URL = "alder.vercel.app.evil.test";
  assert.equal(
    (
      await POST(
        request(undefined, {
          headers: { Origin: "https://alder.vercel.app.evil.test" },
        }),
      )
    ).status,
    403,
  );
});

test("query, media, compression, malformed lengths and malformed bodies get precise failures", async () => {
  assert.equal(
    (
      await POST(
        request(undefined, {
          url: `${origin}/api/brief?inspiration=palm-court`,
        }),
      )
    ).status,
    400,
  );
  for (const type of [
    "application/json",
    "multipart/form-data",
    "application/x-www-form-urlencoded;charset=iso-8859-1",
  ]) {
    assert.equal(
      (await POST(request(undefined, { headers: { "Content-Type": type } })))
        .status,
      415,
    );
  }
  assert.equal(
    (
      await POST(
        request(undefined, { headers: { "Content-Encoding": "gzip" } }),
      )
    ).status,
    415,
  );
  assert.equal(
    (await POST(request(undefined, { headers: { "Content-Length": "-1" } })))
      .status,
    400,
  );
  assert.equal(
    (
      await POST(
        request(undefined, {
          headers: { "Content-Length": "9999999999999999999999" },
        }),
      )
    ).status,
    413,
  );
  for (const body of [
    "brief=%FF",
    "brief=%ZZ",
    "brief=a&brief=b",
    "email=person%40example.com",
  ])
    assert.equal((await POST(request(body))).status, 400);
  const validation = await POST(request("space=&scope=&brief=short"));
  assert.equal(validation.status, 422);
  const payload = await validation.json();
  assert.deepEqual(Object.keys(payload.fieldErrors).sort(), [
    "brief",
    "scope",
    "space",
  ]);
  assert.equal("values" in payload, false);
});

test("actual stream size is bounded independently of Content-Length", async () => {
  const prefix = "space=living-room&scope=furnishing&brief=";
  const atLimit = prefix + "x".repeat(MAX_BODY_BYTES - prefix.length);
  assert.equal((await POST(request(atLimit))).status, 422);
  assert.equal((await POST(request(atLimit + "x"))).status, 413);
  assert.equal(
    (await POST(request(atLimit + "x", { headers: { "Content-Length": "1" } })))
      .status,
    413,
  );
  const unicode = new URLSearchParams({
    ...valid,
    brief: "界".repeat(2000),
    location: "城".repeat(80),
  }).toString();
  assert.equal((await POST(request(unicode))).status, 200);
});

test("a stalled request body is cancelled at the application deadline", async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    cancel() {
      cancelled = true;
    },
  });
  const stalled = new Request(`${origin}/api/brief`, {
    method: "POST",
    headers: {
      Origin: origin,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
  const response = await POST(stalled);
  assert.equal(response.status, 408);
  assert.equal(cancelled, true);
});

test("disabled endpoint and unsupported methods do not prepare a brief", async () => {
  process.env.BRIEF_ENABLED = "false";
  assert.equal((await POST(request())).status, 503);
  for (const [method, handler] of [
    ["GET", GET],
    ["HEAD", HEAD],
    ["OPTIONS", OPTIONS],
    ["PUT", PUT],
    ["PATCH", PATCH],
    ["DELETE", DELETE],
  ] as const) {
    const response = await handler(
      new Request(`${origin}/api/brief`, {
        method,
        headers: { Accept: "application/json" },
      }),
    );
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST");
    assert.equal(response.headers.get("cache-control"), "no-store");
    if (method === "HEAD") assert.equal(await response.text(), "");
  }
});
