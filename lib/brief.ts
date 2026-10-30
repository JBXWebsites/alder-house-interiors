export const BRIEF_FIELDS = [
  "space",
  "scope",
  "location",
  "timing",
  "brief",
  "inspiration",
] as const;
export type BriefField = (typeof BRIEF_FIELDS)[number];
export type BriefDraft = Record<BriefField, string>;
export type FieldErrors = Partial<Record<BriefField, string>>;
export const DOWNLOAD_NAME = "alder-house-project-brief.txt";
export const MAX_BODY_BYTES = 32_768;

export const FIELD_LABELS: Record<BriefField, string> = {
  space: "Which space are you thinking about?",
  scope: "What kind of help would be useful?",
  location: "Where is the home? (optional)",
  timing: "When are you thinking of starting? (optional)",
  brief: "What would you like the space to make easier?",
  inspiration: "A study you connected with (optional)",
};

export const OPTIONS = {
  space: [
    ["living-room", "Living room"],
    ["kitchen-dining", "Kitchen / dining"],
    ["bedroom", "Bedroom"],
    ["several-rooms", "Several rooms"],
    ["other", "Another space"],
  ],
  scope: [
    ["single-room", "A single-room rethink"],
    ["furnishing", "Furnishing and finishing touches"],
    ["renovation", "Planning a renovation"],
    ["not-sure", "Not sure yet"],
  ],
  timing: [
    ["exploring", "Just exploring"],
    ["within-six-months", "Within six months"],
    ["later", "Later"],
    ["not-sure", "Not sure yet"],
  ],
  inspiration: [
    ["palm-court", "Palm Court"],
    ["bay-window", "Bay Window"],
    ["tide-house", "Tide House"],
  ],
} as const;
export type SelectField = keyof typeof OPTIONS;

export const COPY = {
  notice: "This is a demo. Prepare a brief to keep; no inquiry will be sent.",
  processing:
    "Your answers are sent to this site's server to prepare your brief, then returned to you. The application does not save a copy or send it to a designer. Please leave out names, contact details, street addresses, and other private information.",
  hosting:
    "Our hosting provider processes requests and may retain technical logs.",
  reminder:
    "Keep a copy before leaving. This page does not provide saved drafts.",
  locationHelp:
    "A city or broad area is enough. Please do not include a street address.",
  briefHelp:
    "Describe what is not working, or what you would like to change. Use 10–2,000 characters and leave out personal information.",
  placeholder:
    "For example, a living room that works for quiet evenings and a full house on weekends.",
  pending: "Preparing your brief…",
  success:
    "No inquiry has been sent to a designer. Download or copy this starting point, then keep it for a future conversation with a designer.",
  failure:
    "We could not prepare the brief. Your answers are still here. Check your connection and try again.",
  timeout:
    "This is taking longer than expected. Your answers are still here. Try again when you are ready.",
  copied: "Brief copied. No inquiry has been sent.",
  copyFailure:
    "Copy is unavailable in this browser. Select the brief below to copy it manually, or download it instead.",
  downloaded:
    "Your browser has been asked to download the brief. If it did not start, copy the text below.",
  noscript:
    "You can still prepare a brief. Submitting this form will open or download a plain-text file. Nothing is sent to a designer.",
};

export function isOption(field: SelectField, value: string): boolean {
  return OPTIONS[field].some(([key]) => key === value);
}

export function emptyDraft(inspiration = ""): BriefDraft {
  return {
    space: "",
    scope: "",
    location: "",
    timing: "not-sure",
    brief: "",
    inspiration: isOption("inspiration", inspiration) ? inspiration : "",
  };
}

export function normalizeText(value: string): string {
  return value.replace(/\r\n?/g, "\n").normalize("NFC").trim();
}

const forbiddenCharacters =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u;

export function validateBrief(input: Partial<BriefDraft>): {
  values: BriefDraft;
  errors: FieldErrors;
  valid: boolean;
} {
  const values = emptyDraft();
  const errors: FieldErrors = {};
  for (const key of BRIEF_FIELDS) values[key] = normalizeText(input[key] ?? "");
  if (!values.timing) values.timing = "not-sure";
  if (!isOption("space", values.space))
    errors.space = "Choose a space to begin with.";
  if (!isOption("scope", values.scope))
    errors.scope = "Choose the kind of help you are considering.";
  if (!isOption("timing", values.timing))
    errors.timing = "Choose one of the timing options.";
  if (values.inspiration && !isOption("inspiration", values.inspiration))
    errors.inspiration =
      "Choose one of the listed studies, or leave this blank.";
  if (values.location.length > 80)
    errors.location = "Use 80 characters or fewer for the city or region.";
  if (values.location.includes("\n"))
    errors.location = "Use one line for the city or region.";
  if (values.brief.length < 10)
    errors.brief =
      "Write at least 10 characters about what you would like to change.";
  if (values.brief.length > 2000)
    errors.brief = "Keep the description to 2,000 characters or fewer.";
  for (const key of BRIEF_FIELDS) {
    const beforeTrim = (input[key] ?? "").replace(/\r\n?/g, "\n");
    if (forbiddenCharacters.test(beforeTrim))
      errors[key] =
        "Remove the unsupported formatting characters and try again.";
  }
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export function optionLabel(field: SelectField, value: string): string {
  return OPTIONS[field].find(([key]) => key === value)?.[1] ?? "Not specified";
}

export function formatBrief(values: BriefDraft): string {
  const text = values.brief
    .replace(/\t/g, "  ")
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return [
    "ALDER HOUSE / PROJECT BRIEF",
    "",
    "Personal planning draft from a fictional-studio website demo.",
    "Not a submitted inquiry, quote, booking, or designer assessment.",
    "",
    `Space: ${optionLabel("space", values.space)}`,
    `Scope: ${optionLabel("scope", values.scope)}`,
    `City or region: ${values.location.replace(/\t/g, "  ") || "Not specified"}`,
    `Timing: ${optionLabel("timing", values.timing)}`,
    `Inspiration: ${values.inspiration ? `${optionLabel("inspiration", values.inspiration)} / Concept study` : "None selected"}`,
    "",
    "What I would like to feel different:",
    text,
    "",
    "Prepared for you to keep or share yourself.",
    "No inquiry has been sent to a designer.",
    "The application does not persist a copy; hosting technical logs may remain.",
    "",
    "Alder House is a fictional studio created by JBX Web Studio.",
    "",
  ].join("\n");
}

/** URLSearchParams alone silently replaces malformed UTF-8; decode each part strictly. */
export function parseBriefBody(bytes: Uint8Array): Partial<BriefDraft> {
  const raw = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
    bytes,
  );
  const entries = raw ? raw.split("&") : [];
  if (entries.length > BRIEF_FIELDS.length)
    throw new Error("Invalid form shape");
  const result: Partial<BriefDraft> = {};
  const seen = new Set<string>();
  for (const entry of entries) {
    const separator = entry.indexOf("=");
    const key = decodeURIComponent(
      (separator < 0 ? entry : entry.slice(0, separator)).replace(/\+/g, " "),
    );
    const value = decodeURIComponent(
      (separator < 0 ? "" : entry.slice(separator + 1)).replace(/\+/g, " "),
    );
    if (!BRIEF_FIELDS.includes(key as BriefField) || seen.has(key))
      throw new Error("Invalid form shape");
    seen.add(key);
    result[key as BriefField] = value;
  }
  return result;
}

export function draftFromForm(form: HTMLFormElement): BriefDraft {
  const data = new FormData(form);
  const draft = emptyDraft();
  for (const key of BRIEF_FIELDS) draft[key] = String(data.get(key) ?? "");
  return draft;
}
