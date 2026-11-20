# Collective Knowledge — project rules

Free, community-built helicopter flight training. Read this before changing
anything in this repo.

## What this project is

**Free, open, community-written flight training for helicopter pilots — and for
the instructors teaching them.** That is the pitch, and it is what the home page
says. It is *not* "learn it in building blocks": the pedagogy is real and it is
why the courses are ordered the way they are, but it is a method, not a reason
for a stranger to stay on the page. The method shows itself once they are
reading.

Two pillars, deliberately different:

1. **Courses** (`/curriculum/`, `src/content/docs/curriculum/<course>/`) —
   sequenced ground courses laid out **week by week**. A lesson covers what a
   student needs at that point in training, at a depth they can absorb, and the
   subject is revisited later. This ordering is the project's contribution.

2. **Subject Areas** (`/subjects/`, `src/content/docs/subjects/`) — reference
   articles covering one subject in full, with no assumption about where the
   reader is.

### Why "Subject Areas" and not "Handbook"

This was renamed on purpose. The site cites the FAA **Handbooks** constantly
(Helicopter Flying Handbook, PHAK, Aviation Weather Handbook), so calling our own
reference section "the Handbook" invited exactly the confusion we least want in
aviation material. "Subject area" is also the FAA's own term for a required
knowledge area, so a student pilot already has a slot for it.

Airframe systems are a **subject area**, not a pillar. An R22 drive system
article is one example of a reference article, alongside aerodynamics, weather,
and regulations.

## Design rules

These are not preferences. They were arrived at by looking at the site and
finding it hard to read.

### Keep it simple and let the structure explain itself

**Do not write meta-explanation.** No "how this course works", no "how a lesson
is laid out", no "why this exists" essays on index pages. A numbered list of
lessons explains itself. Earlier versions of the home page and the course page
were mostly prose *about* the content, and nobody reads that — it is furniture
between the reader and what they came for.

An index page gets a title, at most one or two sentences, and then the thing
itself.

### Navigation

1. **`tableOfContents: false` globally.** A right-hand table of contents put two
   columns of navigation around one column of prose and made lessons hard to
   read. Do not re-enable it.

2. **The header has two sections: Courses and Subject Areas**, pointing at
   `/curriculum/` and `/subjects/`. Both are index pages, never a specific
   course — a "Start the Private Pilot course" button goes stale the moment a
   second course exists.

3. **The sidebar is rendered by `Sidebar.astro`, not the `sidebar` config**, and
   is context aware: a course's week-by-week outline inside a course, the subject
   list inside Subject Areas, and the course list on `/curriculum/` itself.

   Its top is a **two-item section switcher, not a "← back" link.** A back link
   was actively confusing: you can reach Subject Areas straight from the home
   page, so "← Curriculum" offered to send you back somewhere you had never
   been. A switcher states where you are and where else you can go, and reads
   the same from any entry point.

   **Inside a course, multi-part lessons are collapsed and only the current one
   is expanded** (`<details open={...}>`). The whole outline expanded at once was
   too tall to navigate. Subject areas stay expanded because they are only two
   levels deep.

   The `sidebar` config in `astro.config.mjs` still exists because **Starlight's
   prev/next pagination reads it.** Keep it in true reading order.

4. **The home page is the hero and nothing else** — a headline, one sentence, and
   the two section buttons, plus a one-line disclaimer. Course cards, feature
   grids and "why this exists" copy were all removed from it; the catalog lives
   at `/curriculum/`.

**`Header.astro` must keep its `Search` import.** An earlier version dropped it,
which left Pagefind building a search index on every deploy with no UI able to
open it.

### Light is the default theme

`ThemeProvider.astro` is overridden so the site is light unless the reader has
explicitly chosen dark. Starlight's default falls back to the OS
`prefers-color-scheme`, which meant anyone on a dark desktop got the dark site.

`:root` in `global.css` is the light palette, so the page is correct even with
JavaScript disabled, and the provider's inline script runs before first paint so
there is no flash.

### Contrast is measured, not guessed

Every text colour must clear **4.5:1** against every background it appears on,
and every interactive border **3:1**. The measured ratios live in
[`docs/contrast.md`](docs/contrast.md).

**If you change a colour, re-measure it and update that file.** This is material
people read for hours; low contrast is the single most common thing that makes a
docs site unpleasant.

Use the tokens in `src/styles/global.css` (`--color-text-primary`,
`--color-accent`, `--color-ok`, …). They are defined for both themes, so anything
built on them works in light and dark. **Never hardcode a hex colour in a
component.** Check both themes before considering a UI change done.

`border` and `border-muted` are decorative separators. Anything a reader clicks
or types into uses `border-strong`, which meets the 3:1 rule.

### Looking modern

What separates this from a dated docs theme is mostly restraint plus three
specifics, all tokenised in `global.css`:

- **Radii** (`--ck-r-sm/-r/-r-lg`, 8/12/16px) rather than 4px corners.
- **Soft elevation** (`--ck-shadow*`) on hover for cards, rather than only
  swapping a border colour.
- **Generous whitespace and a tight heading scale** with negative letter-spacing.

Avoid gradients, heavy borders, and more than one accent colour. This is aviation
training material — it should look like a serious reference, not a marketing page.

## Non-negotiables

### It stays free

"Free" includes free for the maintainers to run. Every choice must keep the
total cost at zero:

- **Static output only.** No SSR adapter, no server runtime, no database, no
  paid API.
- **No service that bills at scale.** Search is [Pagefind](https://pagefind.app/),
  which builds a static index at build time. Do not swap in Algolia or any
  hosted search.
- **No accounts, no auth, no user data.** This is why progress is in
  localStorage (see below) — there is no server to save to, by design.
- **No ads, no trackers, no analytics that cost money or harvest readers.**
- Hosting is **Cloudflare Pages** on the free tier.

If a proposed feature cannot be done for free and statically, it does not go in.

### Safety and accuracy

This is aviation training material that people will act on. Accuracy is a safety
property, not a quality metric.

- **Never present a limitation, V-speed, performance number, or procedure as
  authoritative for a specific aircraft.** Explain how the system works and point
  to that aircraft's RFM/POH. Numbers vary by model, serial number, equipment,
  and manual revision.
- **Cite the source for anything a pilot could act on** — a regulation section,
  an FAA handbook chapter, a POH section, a safety notice number.
- **Do not invent regulatory content.** If you are not certain what a regulation
  says, say so, or read it at [eCFR](https://www.ecfr.gov/). Never paraphrase a
  reg from memory into something that reads as authoritative.
- The [disclaimer](src/content/docs/start-here/disclaimer.mdx) must stay linked
  from the home page and the sidebar footer.

### Copyright

- FAA publications are public domain — quote and link freely.
- **Manufacturer publications (RFM/POH, safety notices, service bulletins) are
  copyrighted.** Cite and link; never reproduce them wholesale.
- Content is **CC BY-SA 4.0**; code is **MIT**. See `LICENSE` and
  `LICENSE-CONTENT`.

## Course structure and naming

### Lessons are named by kind and number: "Ground 2"

A lesson's name is its kind plus its number within that kind — `Ground 1`,
`Ground 2`, later `Flight 1`, `Sim 1`. That is how instructors refer to them.

**Do not reintroduce a composite code like "L2 (G2)".** It paired an overall
lesson number with a per-kind number, meant nothing to a reader, and the overall
number no longer exists. `lessonLabel()` in `src/lib/lessons.ts` is the only
place that formats a lesson name.

### Weeks are the organizing unit

Lessons carry a `week`, and the course page and sidebar group by it. Weeks are
what students plan around, and they are where ground and maneuver lessons
interleave — a week holds its ground lessons and the flight lessons that go with
them. `order` positions lessons within a week.

### The hierarchy stops at four levels

```
Course  →  Week  →  Lesson (Ground 2)  →  Part (1 of 4)
```

That is the conventional depth for course software and it is where this stops.
A fifth level is not needed: the place to break content down further is **within
a part**, using headings, which is what the prose already does. Going deeper in
navigation makes the sidebar unusable and forces the reader to hold a path in
their head to know where they are.

If a part still feels too big, add another part — do not add a level.

### Lesson length: a page is one sitting

Target roughly **1,000-2,000 words / 5-10 minutes** per page. Ground 2 was
originally a single 5,700-word page (~25 minutes) and was unreadable in one
pass; it is now four parts of 6-10 minutes.

When a lesson runs longer, split it into **parts** rather than trimming — the
depth is the point. Parts are sibling pages sharing a `kind` and `kindNumber`,
each with its own `part` index and a shared `lessonTitle`:

```yaml
lesson:
  course: private-helicopter
  week: 1
  order: 2
  kind: ground
  kindNumber: 2
  part: 2                                  # 1-based
  lessonTitle: Flight Controls & SFAR 73   # the umbrella lesson's title
```

The page's own `title` is then the *part's* title. `LessonHeader` shows
"Part 2 of 4" with the total counted from the collection — never hand-write it.

Split on **existing heading boundaries at natural topic seams**, not at a word
count. Each part needs its own Key Notes. Put the Homework and the quiz on the
**last** part, since they cover the whole lesson.

**Reading time** is computed in `LessonHeader` from the entry's raw `body` via
`src/lib/reading-time.ts`. It is deliberately *not* a remark plugin: Astro 7's
default Markdown processor would need the legacy `@astrojs/markdown-remark`
pipeline installed to run one, and a word count is not worth changing how every
page renders.

A **reading-progress bar** sits on the header's bottom edge (`Header.astro`),
which is the other half of making a long page feel finishable.

### One outline builder

`getCourseOutline()` in `src/lib/lessons.ts` turns frontmatter into the
week → lesson → part structure, and **both** the sidebar and the course page use
it. When they each built it themselves they could disagree about grouping, which
is the sort of bug nobody notices until a lesson shows up in the wrong week in
one of the two places.

## Progress and quizzes

### Progress is per-browser, and the UI says so

Progress lives in `localStorage` under `ck-progress-v1`, managed by
`src/lib/progress.ts`. That is a direct consequence of the no-accounts, no-server
constraint: **there is nowhere else to put it.**

It therefore does not sync across devices or browsers. **Say so in the UI rather
than hiding it** — a reader who switches laptops and finds an empty progress bar
deserves to know why. `CourseProgress` carries that line.

Rules for anything touching progress:

- **Every storage access is wrapped in try/catch.** localStorage throws in some
  private-browsing modes and can be disabled outright. A reader with it off must
  still get a fully working site, just without saved progress.
- **Read storage in an effect, never during render.** The server has no
  localStorage, so reading during render makes the first client paint disagree
  with the server HTML.
- **`read()` must return a fully-owned object.** Callers mutate what it returns.
  A shallow spread of a shared constant aliases the nested objects and the first
  write permanently pollutes the default — this was a real bug, and
  `npm test` covers it.
- Changes dispatch a `ck:progress` event so the sidebar ticks, the course list,
  and the progress bar all update without a reload. Storage events are also
  handled, so a second tab stays in sync.

A lesson is keyed by **its page path** (`/curriculum/private-helicopter/l01-…/`).
That is what lets the sidebar and course list find completions by matching
`href`, with no shared registry.

### Quizzes are graded, and a pass completes the lesson

- Questions live in `src/content/quizzes/<course>/<lesson>.yaml`, **not** inline
  in the lesson, so a bank can be reused in a stage-check or end-of-course review.
- The quiz runs in a **modal**, one question at a time, and **does not reveal
  answers as you go.** It grades at the end and then shows a full review with
  explanations. Immediate per-question feedback makes the score meaningless.
- **80%** passes (`PASS_THRESHOLD`). A pass marks the lesson complete.
- Only a **better** attempt overwrites the stored one, so a casual retake cannot
  undo a pass.
- Mark exactly one choice `correct: true`, and **always write the `explain`** — a
  quiz that only reports a score teaches nothing. Cite a `reference`.
- A lesson can also be completed by hand, via the checkbox in `LessonProgress`.
  Not every lesson will have a quiz, and a reader who already knows the material
  should be able to move on.

### Flashcards are practice, not assessment

Decks live in `src/content/flashcards/<course>/<lesson>.csv` as **two-column
CSV** (question, answer). CSV is the authoring format on purpose: a deck is 80+
rows of two short fields, which is pleasant in a spreadsheet and miserable in
YAML, and the person writing them works in a spreadsheet already.

Astro's built-in `glob()` loader does not read CSV, so `src/lib/flashcard-loader.ts`
is a small custom content-layer loader, and `src/lib/csv.ts` is a real RFC 4180
parser — **not** a `split(',')`. Real spreadsheet exports contain quoted fields,
`""` escapes, and newlines *inside* quoted fields; the Ground 2 deck has all
three.

Behaviour:

- Launched from a resting card into a modal, same shape as the quiz, so the two
  study tools behave alike.
- Self-graded: "Again" sends a card to the **back of the queue** and it comes
  round again. A deck is finished when every card has been right once, not when
  every card has been seen once.
- **Flashcards never complete a lesson.** Self-grading is not a score; that is
  the quiz's job. They do persist which cards are known.
- Known cards are keyed by a hash of the **question text**, not the row index,
  so reordering the CSV does not scramble a reader's progress. Rewording a
  question does reset that card, which is correct — a reworded card is a new card.

### Audio recordings

A lesson may carry a companion recording via an `audio` block in frontmatter,
rendered by `LessonAudio.astro` on **part 1** of a split lesson.

The binding constraint is **Cloudflare Pages' hard 25 MiB per-file limit** (every
plan). So: audio only, mono, target ~20 MB. `afconvert` is built into macOS, so
no toolchain install is needed. Full recipe and the bitrate table are in
[`docs/media.md`](docs/media.md).

- **A plain `<audio>` element, never a third-party embed.** A podcast-host or
  YouTube embed hands the reader to someone else's tracker, which this project
  does not do.
- **The written lesson is the transcript.** The recording is never the only route
  to the content.
- `LessonAudio` **fails the build** on a missing file or one over 25 MiB. A typo
  would otherwise ship a player that 404s on play.
- Media resolves through `mediaUrl()` in `src/lib/media.ts`. When repo media
  passes ~250 MB, set `MEDIA_BASE` to a Cloudflare R2 origin (10 GB free, zero
  egress) — that one line is the whole migration, because every `audio.src`
  stays root-relative.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7 (static) | Zero-JS by default, free to host anywhere |
| Docs theme | Starlight 0.43 | Sidebar, search, a11y for free |
| Styling | Tailwind 4 + CSS custom properties | Tokens in `src/styles/global.css` |
| Interactivity | React 19 islands | Only the quiz and progress UI |
| Search | Pagefind (built in) | Static index, no service |
| Host | Cloudflare Pages | Free tier, static |

Node is pinned to **22** (`.nvmrc`, `.node-version`).

```sh
npm run dev     # http://localhost:4321
npm run build   # static output to dist/
npm run check   # astro check — must stay at 0 errors
npm test        # progress module tests
du -sh public/audio   # media weight — see docs/media.md before this passes ~250 MB
```

`npm test` needs no framework and no build step: Node strips the TypeScript
types itself via `--experimental-strip-types`.

## Conventions

### Imports in content

Use the **`@components/` alias**, never relative `../../../` hops — content sits
at varying depths and relative paths break when a page moves.

```mdx
import KeyNotes from '@components/KeyNotes.astro';          // yes
import KeyNotes from '../../../components/KeyNotes.astro';  // no
```

Aliases are in `tsconfig.json`.

### Frontmatter

A course lesson carries a `lesson` block; a subject article carries a `topic`
block. Both schemas are defined and documented in `src/content.config.ts` — read
it before adding fields.

```yaml
lesson:
  course: private-helicopter
  week: 1            # the organizing unit
  order: 2           # position within the week
  kind: ground       # ground | flight | sim
  kindNumber: 2      # with kind, this is the name: "Ground 2"
  status: draft      # stub | outline | draft | review | ready
```

```yaml
topic:
  category: systems  # must match a slug in src/lib/subjects.ts
  order: 1
  status: draft
```

**YAML gotcha:** a value containing `: ` parses as a nested mapping and breaks
the build. Quote it:

```yaml
references:
  - '14 CFR 61 — Certification: Pilots, Flight Instructors, and Ground Instructors'
```

### Nothing is registered by hand

Add a lesson file with a `lesson` block and it appears in its week on the course
page, in the sidebar, and in the progress count. Add a subject article with a
`topic` block and it appears under its area. **Never hand-maintain a list of
pages** — use or extend the component instead.

Two lists *are* explicit, so that something can be named before it has content:

- `src/lib/courses.ts` — courses, so a course can show as "Planned".
- `src/lib/subjects.ts` — subject areas, so an area can be listed as planned.
  An area with no articles is not rendered as an empty section.

A planned course has no page, so **only `status: 'open'` courses may be linked.**

### Lesson page shape

Every curriculum lesson follows the same order:

1. `<LessonHeader lesson={frontmatter.lesson} />` — a quiet meta line and
   collapsible objectives
2. The prose
3. `<KeyNotes>` — condensed takeaways for review
4. `<Homework due="...">` — what to do before the next session
5. `<FlashcardDeck slug="course/lesson" />` — the deck, if there is one
6. `<QuizBlock slug="course/lNN" />` — the graded quiz
7. `<LessonProgress lessonId="/page/path/" />` — completion control

On a split lesson, the recording (`<LessonAudio>`) goes on **part 1** just below
the header, and the review tools (flashcards, quiz, homework) go on the **last**
part under a `## Review` heading, because they cover the whole lesson.

`LessonProgress` is the checkbox only. Navigation to the next page is Starlight's
prev/next pagination, which renders directly below it — do not add a "next" button
and duplicate it.

Wrap custom UI in `not-content` so Starlight's prose typography does not
override it.

## Writing voice

Lessons are written the way a good instructor talks — first and second person,
opinions, and "here's what I actually see students get wrong." That voice is
intentional; **do not flatten it into neutral documentation prose.** Keep a
lesson sized to one real session; if it will not fit, it is two lessons.

Handbook articles are more neutral but still explanatory rather than
encyclopedic. Explain the mechanism, not just the facts.

## Working agreements

- Run `npm run build`, `npm run check`, and `npm test` before claiming a change
  works.
- When adding a schema field, document it with a comment in
  `src/content.config.ts` — that file is the reference for contributors.
- Prefer extending an existing component over adding a parallel one.
- Status badges are the site's honesty mechanism. Never upgrade a status to make
  the site look more finished than it is.
