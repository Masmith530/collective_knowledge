# Collective Knowledge

**Free helicopter ground school, written by a working instructor.** No accounts,
no ads, no paywalls — and no running costs, which is what makes that promise
credible.

This repository is **private**. "Open" on the site refers to the content
licence (CC BY-SA), not to the source — see CLAUDE.md.

Live site: https://collectiveknowledge.pages.dev

## What this is

Helicopter training material organized around two deliberately different
pillars:

| | **Curriculum** | **Handbook** |
| --- | --- | --- |
| Shape | Sequenced building-block lessons | Standalone full-detail articles |
| Assumes | The lessons before it | Nothing about your stage |
| For | Learning it the first time | Looking it up and going deep |
| Example | *L2 — Flight Controls & SFAR 73* | *Flight Controls* |

Most free aviation material is the second kind. Handing a week-two student the
complete treatment of retreating blade stall produces memorization, not
understanding — so the sequenced curriculum is what this project adds. Each
lesson links out to the handbook article behind it for anyone who wants the
depth now.

## Status

Early and deliberately small. Two Private Pilot — Helicopter ground lessons and
one handbook article. The structure is in place; content grows from here.

Every page carries a `status` (`stub` → `outline` → `draft` → `review` →
`ready`). That honesty is load-bearing — never upgrade a status to make the site
look more finished. See [`CLAUDE.md`](CLAUDE.md).

## Running it

Requires Node 22 (pinned in `.nvmrc`).

```sh
npm install
npm run dev      # http://localhost:4321
```

```sh
npm run build    # static site → dist/
npm run check    # astro check — keep at 0 errors
npm test         # progress module tests
```

`npm test` needs no framework and no build step — Node strips the TypeScript
types itself.

## Stack

- **[Astro 7](https://astro.build/)** — static output, zero JS by default
- **[Starlight 0.43](https://starlight.astro.build/)** — docs theme
- **[Pagefind](https://pagefind.app/)** — static search index, no search service
- **[Tailwind 4](https://tailwindcss.com/)** + CSS custom properties for theming
- **[React 19](https://react.dev/)** islands — only the quiz and progress UI
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — free tier hosting

Everything there is free at any traffic level this site will see. That is a hard
constraint, not a coincidence — see "It stays free" in `CLAUDE.md`.

## How it works

### Progress

Lesson completion and quiz scores live in the browser's `localStorage`. There is
no server and no account, by design, so progress is **per-browser and does not
sync** — and the UI says so rather than hiding it.

A lesson completes either by passing its quiz (80%) or by ticking the checkbox at
the end. Completed lessons get a ✓ in the sidebar and the course list, and the
course page shows a progress bar.

### Quizzes

Questions live in `src/content/quizzes/` as YAML, separate from lesson prose so a
bank can be reused in a stage-check later. The quiz runs in a modal, one question
at a time, and grades at the end — it does not reveal answers as you go, because
that makes the score meaningless. The results screen reviews every question with
an explanation and a citation.

### Theme

Every text colour clears WCAG AA (4.5:1) against every background it appears on;
interactive borders clear 3:1. The measured ratios are in
[`docs/contrast.md`](docs/contrast.md) — **if you change a colour, re-measure it
and update that file.**

## Repository layout

```
src/
├── content/
│   ├── docs/
│   │   ├── index.mdx                 home page — the course catalog
│   │   ├── curriculum/               PILLAR 1 — sequenced courses
│   │   │   └── private-helicopter/     course overview + l01, l02
│   │   ├── handbook/                 PILLAR 2 — standalone articles
│   │   │   └── flight-controls.mdx
│   │   └── start-here/disclaimer.mdx
│   └── quizzes/                      quiz banks (YAML)
├── components/
│   ├── LessonHeader.astro            meta line + collapsible objectives
│   ├── KeyNotes.astro                condensed takeaways
│   ├── Homework.astro                pre-next-session assignments
│   ├── Quiz.tsx / QuizBlock.astro    graded modal quiz
│   ├── LessonProgress.tsx            end-of-lesson completion control
│   ├── CourseProgress.tsx            progress bar
│   ├── CourseContents.astro          course lesson list
│   ├── CourseCatalog.astro           home page catalog
│   └── overrides/                    Starlight header, hero, sidebar, theme toggle
├── lib/
│   ├── progress.ts                   localStorage progress (tested)
│   └── courses.ts                    the course catalog
├── content.config.ts                 lesson + topic schemas (documented)
└── styles/global.css                 verified-contrast design tokens
```

**Nothing is registered by hand.** Add a lesson file with a `lesson` frontmatter
block and it appears in the course contents, the progress bar, and the sidebar
automatically.

## Contributing

Corrections are the most valuable contribution — especially from instructors.
The site has no *Edit page* link and no source link anywhere a reader can see:
the repository is private, and the audience is pilots rather than developers.
Corrections reach the author directly.

Read [`CLAUDE.md`](CLAUDE.md) for the project rules before making changes.

## Deploying to Cloudflare Pages

Connect the repo once in the Cloudflare dashboard
(**Workers & Pages → Create → Pages → Connect to Git**):

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | `22` (via `NODE_VERSION` env var) |

Pushes to `main` deploy automatically; pull requests get preview URLs. Edge
headers are in `public/_headers`. GitHub Actions typechecks, tests, and builds
every push and PR.

## Licensing

- **Content** (`src/content/`) — [CC BY-SA 4.0](LICENSE-CONTENT)
- **Code** (everything else) — [MIT](LICENSE)

Manufacturer flight manuals and safety notices are copyrighted and are cited,
never reproduced.

> **This is study material, not authority.** It is not an FAA-approved course and
> is no substitute for an authorized instructor, your aircraft's flight manual,
> or the current regulations. See the
> [disclaimer](src/content/docs/start-here/disclaimer.mdx).
