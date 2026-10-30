# Alder House

[Visit Alder House](https://alder-house-interiors.vercel.app) · [Source repository](https://github.com/JBXWebsites/alder-house-interiors)

A fictional residential interiors studio, created as a portfolio concept by JBX Web Studio. Palm Court, Bay Window and Tide House are imagined room studies, not completed client commissions. All interior imagery is AI-generated.

The website pairs broad room views with notes about light, layout and everyday use. Three full stories lead to a working demo that prepares a project brief for the visitor to keep. Alder House is not an operating interiors business.

## Run locally

Use Node.js 22 and npm. Install the exact dependency versions in the committed lockfile:

```sh
npm ci
node -e "require('node:fs').copyFileSync('.env.example', '.env.local')"
npm run dev
```

Open [localhost:3000](http://localhost:3000). The copy command creates local configuration; skip it if `.env.local` already contains settings you want to keep.

```sh
npm test
npm run typecheck
npm run build
npm start
```

Tests cover brief validation, formatting and endpoint behavior. CI runs installation, tests, TypeScript and the production build on Node.js 22 with read-only repository permissions. Browser and visual verification are separate; a passing build is not an accessibility or performance certification.

## Project structure

- `app/`: homepage, project stories, credits/privacy, recovery pages, metadata routes and the brief endpoint.
- `components/`: navigation, Room Notes, brief builder, image fallbacks and GSAP motion.
- `lib/projects.ts`: shared study copy, image descriptions and crop coordinates.
- `lib/brief.ts`: shared validation and plain-text formatting.
- `lib/site.ts`: canonical origin validation and preview indexing policy.
- `tests/`: automated brief tests.
- `public/`: shipped images, brand assets and font licenses.
- `docs/concepts/`: four original generated PNGs for reproducing image derivatives.
- `scripts/prepare-assets.mjs`: image, crop, brand and social-preview generation.

Planning documents and third-party reference downloads are not part of the public repository. No remote source assets are required to display the site.

## Brief behavior and privacy

`POST /api/brief` validates bounded input and returns a downloadable plain-text document. Native form submission and the enhanced interface share validation and formatting. It does not send email, contact a designer, save a project database entry or create an account.

Preparing a brief temporarily processes answers on the hosting provider's systems. Application code does not intentionally store brief contents in files, databases, application logs or analytics. The host may retain technical request information under its own policies. Review actual hosting/log settings before deploying; the application cannot promise that the host records no request metadata.

No personal or sensitive details are needed. Downloads are saved by the browser. There is no application draft storage; browser-controlled form restoration may still occur. Origin checks reduce accidental cross-origin submissions but are not authentication or complete abuse prevention.

## Motion and accessibility

GSAP supplies authored animation: a small eligible desktop hero parallax, source-matched Room Notes transitions, restrained image entrances and arrow feedback. Scrolling and navigation remain native. Reduced motion removes authored movement while preserving content and controls.

Room Notes begins with native disclosures; full stories keep every note readable as static content. The brief has persistent labels, validation feedback and a native form path. Test keyboard use, zoom, touch, reduced motion, delayed hydration and failed image/network requests before release.

## Assets and provenance

The four source images are generated concept art created for this project. Detail images are crops of the corresponding source, not evidence of additional built rooms. `public/images/asset-manifest.json` records source-relative paths, crop rectangles, dimensions and encoded sizes.

To regenerate derivatives after a deliberate source change:

```sh
node scripts/prepare-assets.mjs
```

This overwrites generated files in `public/images`, `public/brand` and `public/licenses`. Review changed crops and social images before committing. Raster social labels use system serif/sans fallbacks, so exact appearance can differ across operating systems; checked-in images are the reviewed publication artifacts. The site self-hosts Gelasio and Hanken Grotesk from the locked Fontsource packages. Their SIL Open Font License notices are preserved in `public/licenses` and linked from the credits page.

The AH mark and interface are project-authored. Third-party research samples are not bundled as application source. Dependencies retain their respective licenses; public visibility does not grant an additional blanket license for the studio identity or generated artwork.

## Deployment configuration

| Setting | Purpose |
| --- | --- |
| `SITE_URL` | Required on Vercel: the verified HTTPS canonical origin for this actual project, without path, query, fragment or credentials. Local development may use `http://localhost:3000`. |
| `APP_ALLOWED_ORIGINS` | Optional comma-separated exact additional origins allowed to submit briefs. No wildcard hosts; add only verified aliases that need access. |
| `BRIEF_ENABLED` | Omit or use `true` normally. Set exactly `false` to return an honest unavailable response while preserving the portfolio. |
| `VERCEL`, `VERCEL_ENV`, `VERCEL_URL` | Supplied by Vercel; do not override in production. The endpoint separately validates the exact platform deployment hostname. |

Set the project runtime to Node.js 22. No database, mail service or paid API credential is required. Keep actual environment files and tokens out of Git. Environment changes require a new deployment.

The live project is connected to this repository on Vercel. Updates to `main` trigger production deployment. Its firewall limits `POST /api/brief` to 10 requests per IP per 60-second fixed window; platform counters are regional, not a global quota. This project setting is not provisioned by the application source.

The URL helper rejects missing deployed configuration, non-HTTPS public origins and origins containing credentials or extra URL components. Previews use noindex/nofollow and an empty, unadvertised sitemap. Robots.txt allows fetching so crawlers can read noindex; it is not access control. Use platform preview protection where required. Production sitemap contains only the homepage, three studies and credits.

Before publication, verify canonical identity in built HTML/sitemap/social URLs; exact API origins; hosting privacy settings; response headers; direct routes and 404 status; keyboard/phone behavior; and native/enhanced brief downloads. Inspect the deployed revision outside an authenticated session. Keep the previous known-good deployment for rollback; disable brief preparation separately if necessary.

## Scope and limitations

This is a portfolio concept with three static studies, not a CMS or real inquiry service. Source images are 1536x1024 landscapes or 1024x1536 portraits; tighter crops contain fewer pixels. Enlarging them does not add image detail.

The first release passed 16 backend tests, TypeScript checks and a production build in clean GitHub CI on Node.js 22. Desktop and phone layouts, navigation, room disclosures, validation, brief preparation and clipboard output were checked in the browser. Automated accessibility checks found no violations in the sampled development pages and form states; this is not an accessibility certification.

Public HTTP checks cover all five pages, a missing-project 404, canonical URLs, response headers, the production sitemap and native/enhanced brief responses. Run them against the production origin:

```sh
node scripts/smoke.mjs https://alder-house-interiors.vercel.app
```

The smoke check submits four synthetic brief requests and does not send an inquiry or create a saved record. Avoid repeated runs within the firewall window. Physical-device Safari, native screen-reader use, rendered print output and field performance remain unverified. No commercial results, award or universal browser compatibility is claimed.
