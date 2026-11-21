# Collective Knowledge — project rules

Free helicopter ground school, written by a working instructor. Read this
before changing anything in this repo.

## What this project is

**Free, open ground school for helicopter pilots — and for the instructors
teaching them.** That is the pitch, and it is what the home page says. It is
*not* "learn it in building blocks": the pedagogy is real and it is why the
courses are ordered the way they are, but it is a method, not a reason for a
stranger to stay on the page. The method shows itself once they are reading.

### It is not "community-written", and the source is private

It used to say community-written. It no longer does, anywhere a reader can see,
because the repository is private and there is no way for a stranger to
contribute — so the claim was not true. **"Written by a working helicopter
instructor" replaced it**, which is both accurate and a stronger signal to a
student: "community" could mean anyone.

"Open" stays, and refers to the **licence**, not the source. The content is
CC BY-SA: anyone may copy, teach from and build on what the site publishes.
That is what an open educational resource is, and it does not require the
repository to be public.

Keep the singular until it is actually false. If other instructors start
writing, make it plural then.

**No reader-facing links to the source.** There is no `editLink`, no `social`
entry and no icon in the header — see the note in `astro.config.mjs`. They
would point somewhere a reader cannot go, and even public they were wrong for
this audience. Corrections reach the author directly.

Two pillars, deliberately different:

1. **Courses** (`/curriculum/`, `src/content/docs/curriculum/<course>/`) —
   sequenced ground courses laid out **week by week**. A lesson covers what a
   student needs at that point in training, at a depth they can absorb, and the
   subject is revisited later. This ordering is the project's contribution.

2. **Subject Areas** (`/subjects/`, `src/content/docs/subjects/`) — reference
   articles covering one subject in full, with no assumption about where the
   reader is. Grouped **area → airframe → article**: Aircraft Systems →
   Robinson R22 → Flight Controls. See "Subject articles" below — the airframe
   rung is load-bearing, not decoration.

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

   Those links are **hidden below the `nav` breakpoint (50rem)**, and that is
   not a gap: below 50rem Starlight shows a hamburger and the sidebar becomes a
   drawer, and the drawer carries the section jump at its bottom. Above it the
   sidebar is permanent and the header carries the nav. The reveal is pinned to
   Starlight's own breakpoint — see [`docs/breakpoints.md`](docs/breakpoints.md)
   before moving it, because any other value leaves a band of widths with no
   section nav at all, or two.

   **Keep them, even though the sidebar also offers a section jump.** They are
   not duplicates; they do different jobs, and the header's job got *more*
   important once the sidebar jump moved to the bottom:

   - The header is the only section nav that is **always visible**. A course
     outline with several weeks of lessons is taller than the viewport, so the
     sidebar's jump is frequently below the fold. Removing the header nav would
     mean no visible way to change section without scrolling the sidebar first.
   - The header shows **both** sections and marks the current one with
     `aria-current`. That is the "where am I" signal the sidebar deliberately
     gives up by only ever naming the other section.
   - The home page uses Starlight's `splash` template and therefore renders
     **no sidebar at all**. Its hero buttons cover section entry, but the header
     is the only persistent nav there.
   - It costs nothing on mobile, where it is hidden anyway.

3. **The sidebar is rendered by `Sidebar.astro`, not the `sidebar` config**, and
   is context aware: a course's week-by-week outline inside a course, the subject
   list inside Subject Areas, and the course list on `/curriculum/` itself.

   **Its bottom block is pinned to the bottom edge** (`margin-top: auto` on
   `.ck-sb-bottom`, with `.ck-sb` as a `flex: 1` column). It holds, in order: a
   single jump to the other section, then "Why this is free" and
   "Disclaimer & licensing". When the outline is short this sits on the bottom
   edge; when the outline is long enough to scroll it falls below the last
   lesson, which is the right place for it either way.

   That block lives **outside the three-way branch** in the markup. The fine
   links were previously written out inside two of the three branches, which
   meant Subject Areas pages carried no footer at all — and nobody noticed,
   because the markup looked complete in both places you were likely to read.

   **The section jump is drawer-only** — `display: none` from `nav` up. Above
   that breakpoint the header carries Courses and Subject Areas, so rendering it
   too would put two section navs on one screen; below it the header's links are
   hidden and this is the only way to change section. One section nav at every
   width. It is a single link naming the other section, not a switcher and not a
   "← back" link: a back link was actively confusing, since you can reach
   Subject Areas straight from the home page and "← Curriculum" offered to send
   you back somewhere you had never been.

   **Inside a course the sidebar starts with "← All courses".** Without it there
   is no way back to the course list: "Course overview" only goes up to the
   course's own page, and the bottom jump goes to the other *section*. That gap
   appeared when the two-tab switcher became a one-way jump, and it is the kind
   of thing only a reader notices.

   **A multi-part lesson is a link, not a disclosure.** The row navigates
   (`lesson.href` resolves to "its overview page, its first part, or itself"),
   and the part list renders only for the lesson you are actually in. It used to
   be `<details>`: the row expanded but did not navigate, so starting a lesson
   took two clicks — expand, then click part 1. The constraint that produced
   `<details>` has not changed and is still met: the whole outline expanded at
   once was too tall to navigate, and still only one lesson's parts are ever
   shown. **Subject articles follow the same rule**, now that the subject tree is
   area → airframe → article → part: an article's parts render only for the
   article you are in. Expanding all of them is what made the course outline
   unusable, and three rungs of navigation have even less room for it.

   **Every lesson row carries one status badge** — a ring plus a fraction —
   built from `lesson.pageIds`, the lesson's *completable* pages. It replaced
   "4 parts", which stated a fact about the lesson where a reader wants a fact
   about themselves. It also fixed two things that were only visible on screen:
   a single-page lesson got a `::after` ✓ on a row that is a flex *column*, so a
   finished lesson wore its tick on a third line underneath the title; and a
   one-page lesson and a four-part one reported completely differently. Both now
   use the ring, the fraction appears only when there is more than one page to
   count, and the ring turns `--color-ok` when the lesson is done so it reads
   like the ✓ used everywhere else. Do not put `data-ck-lesson` back on a lesson
   row — that is what drew the wrapping tick.

   **The site-information pages keep the sidebar the reader already had.**
   `/start-here/*` belongs to neither section. Without a branch it fell through
   to the course outline, where `?? openCourses[0]` showed Private Pilot from
   anywhere on the site; a branch of its own replaced that with an "About this
   site" list, which was correct and still wrong — clicking a link in the pinned
   footer should not rearrange the furniture you clicked it in.

   Every view is therefore rendered on those two pages and one is revealed.
   Every page records which view it is in `sessionStorage`; the pages that are
   no view read it back. **The course list is the markup default**, so a cold
   visit, a shared link and a reader with no JavaScript all land on the section
   index, which assumes nothing about them.

   **A "view" is more specific than a section, and that distinction is the
   whole fix.** Courses is two kinds of sidebar: the course *list* at
   `/curriculum/`, and a given course's outline. Remembering only "you were in
   Courses" handed a course outline to a reader who had only ever seen the
   course list — the same wrong-outline bug, one level up. View ids are
   `catalog`, `course:<slug>` and `subjects`, and the site-information pages
   render one block per view, including one per open course.

   Because a view id contains a course slug there is no static CSS selector per
   view, so the reveal toggles two classes and CSS knows only "shown" and "not
   shown". Do not replace that with `[data-ck-show='…']` rules — generating one
   per course would put the course list in two places.
   The reveal is an `is:inline` script for the same reason `ThemeProvider` uses
   one — a bundled module is deferred, so the reader would watch the Courses
   outline appear and then be replaced. It only ever switches *away* from the
   default, so there is nothing to flash on a normal visit.

   **No rendered "back" link on those pages.** With the outline left in place it
   would duplicate navigation already on screen, and "back" cannot be honest on
   a page reached from a search result.

   This also removed the "first open course" fallback entirely: `currentCourse`
   is now undefined outside a course rather than defaulting to `openCourses[0]`,
   which is what produced the original bug and would have produced it again.

   **Exactly one `aria-current="page"` per page.** It marks the page you are on,
   nothing else. A split lesson's row therefore carries `data-ck-in` instead —
   "this is the lesson you are inside" — and the header's section links use
   `aria-current="true"`, the generic form, **always** — it is section nav and
   marks the section you are in, not the page you are on. Even on `/subjects/`,
   where the header link really is the current page: so is the sidebar's "All
   subject areas", and that page shipped two. The sidebar owns "page" because
   it is the page-level nav. On `/curriculum/` nothing claims "page" at all,
   which is honest — the sidebar there lists courses and none of them is that
   page. Getting this wrong is invisible on screen and
   tells a screen reader there are two current pages.

   It is **the same component either side of `nav`** — a permanent left column
   above, Starlight's full-width drawer below. One markup tree. The drawer is
   full-height too, so the pinned bottom block sits on the bottom edge there as
   well, which on a phone is the easiest part of the panel to reach.

   The `sidebar` config in `astro.config.mjs` still exists because **Starlight's
   prev/next pagination reads it.** Keep it in true reading order, and keep it
   holding *only pages that belong in a sequence*. **Subject Areas is
   deliberately not in it:** listing it chained the two sections into one flat
   list, so `/subjects/` advertised "Previous: Low RPM Recovery & Rotor Stall"
   and the course's last lesson pointed "Next" at an unrelated reference
   article. A subject article assumes nothing about where the reader is, so
   there is no next one — having no pagination there is correct, not a gap.

4. **The home page is the hero and nothing else** — a headline, one sentence, and
   the two section buttons. Course cards, feature grids and "why this exists"
   copy were all removed from it; the catalog lives at `/curriculum/`.

   **The buttons name intent, not the taxonomy.** They read "Start a course" and
   "Look something up", not "Browse courses" and "View subject areas". Naming the
   two collections tells a first-time reader nothing — worse, it reads as
   whole-and-part ("a course is the thing; subjects must be pieces of it"), which
   is the opposite of the real distinction. The axis is **teaching order versus
   reference**, and the section indexes already say so about themselves ("the
   same material in teaching order"; "for looking something up"). The home page
   just uses their words.

   Section *headings* stay Courses and Subject Areas — that is the taxonomy, and
   `Subject Areas` is chosen deliberately (see below). Buttons are an invitation.
   Do not collapse the two into one wording.

   **No fine print either.** It used to carry a "study material only — not an
   FAA-approved course" line. That hedged the work instead of describing it:
   this *is* real instruction, written by instructors, and the honest
   distinction is that it is not *official* — which is a point to make properly
   on the licensing page, not to lead a landing page with. Licensing and the
   disclaimer are linked from the sidebar footer on every other page, which is
   where someone looks for them.

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

**Dark is a neutral charcoal, not a navy.** It was rebuilt from a blue-tinted
slate whose surfaces and greys leaned 21-41 points towards blue (channel spread),
which is what made it read as generic "GitHub dark". The neutrals now sit at 2-8
— a touch cool so it looks like charcoal rather than concrete, and no further. If
you add a dark neutral, keep it in that range and re-measure. The **accent stays
blue in both themes**: it is the site's one accent colour, and a neutral charcoal
is what lets it carry.

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

Text on a **filled accent** background uses `--color-on-accent`, never `#fff`.
The dark theme's accent is a light blue, so white on it measures 2.54:1 — this
was a real failure in four places. See the note at the end of `docs/contrast.md`.

### Never duplicate what a shared token or component already provides

This is the rule that the three sections above are each one instance of, and it
is enforced: **`npm run lint:tokens`** (part of `npm run check`) fails the build
on a violation. Every check in it exists because the thing it catches had already
happened here, invisibly, and shipped:

| Found | Consequence |
| --- | --- |
| `var(--ck-radius)` / `--ck-radius-sm` in 4 places — never defined | Those corners were silently square |
| `#d29922` pasted into one component, twice | 2.41:1 contrast, light-theme only |
| `rgba(2, 6, 12, 0.66)` in two modals | Two scrims free to drift apart |
| `color: #fff` on an accent fill, 4 places | 2.54:1 in dark; 1.80:1 on hover |
| Five hand-written media queries at 30, 34, 34, 40 and 50rem | No two components agreed where a phone ends |

None of that is visible in a diff. All of it is visible to a reader.

So, before adding a value or a block of markup, look for the thing that already
owns it:

- **Breakpoints** → the `@theme` block in `global.css`, used via
  `theme(--breakpoint-…)`. Never a literal width. See
  [`docs/breakpoints.md`](docs/breakpoints.md).
- **Colour, radius, shadow, measure, tap target** → the tokens in `global.css`.
  Never a literal. If no token fits, add one *there* with a comment, and
  re-measure contrast.
- **Course structure** → `getCourseOutline()` in `src/lib/lessons.ts`. The
  sidebar and the course page both read it; when they each built the week →
  lesson → part grouping themselves they could disagree, and a lesson showing up
  in the wrong week in one of two places is the kind of bug nobody notices.
- **Subject structure** → `getSubjectOutline()` in `src/lib/subjects.ts`, which
  does the same job for area → airframe → article → part. The sidebar and the
  subject index both read it. An article appearing under the wrong airframe is
  worse than a lesson in the wrong week: a reader may act on it.
- **A list of parts** → `PartList.astro`, which serves a split lesson and a
  split article from one component. The shape is identical — numbered pages,
  reading times, ticks — and only the lookup differs.
- **A lesson's name** → `lessonLabel()`. The only place that formats one.
- **Progress** → `src/lib/progress.ts`. Never touch `localStorage` directly.
- **Ticking a finished page** → `src/lib/completion-marks.ts`. Anything carrying
  `data-ck-lesson="<page path>"` gets `data-ck-done` when that page is complete;
  call `watchCompletions()` once from the component and style the attribute.
  The sidebar, course contents, subject index and lesson part list had each
  grown their own copy of the same loop, each reading storage directly — four
  copies free to disagree, and nothing in CI was looking at script the way
  `lint:tokens` looks at CSS.
- **A clickable card** → `.ck-card` in `global.css`, plus `.ck-card-go` for the
  chevron. The course catalog, the course outline, a part list and the subject
  index all use it. They had each written their own and had already drifted:
  three hover treatments, two radii, and one with no resting elevation.
- **Markup** → extend the existing component rather than adding a parallel one.
  `KeyNotes` and `Homework` are separate because they serve different moments,
  not because one was easier to copy.

Two corollaries worth stating, because they are the common ways round the rule:

1. **A theme-specific override is a missing token.** The quiz had a base rule
   plus a `:root[data-theme='light']` override of the same property, purely
   because there was no name for "text on an accent fill". One token replaced
   both rules.
2. **Prefer no breakpoint to a shared one.** `CourseCatalog` is responsive with
   `auto-fit` + `minmax` and has no media query at all; it responds to its
   container rather than the viewport, which is strictly better. Tap targets use
   `@media (pointer: coarse)`, not a width — a touchscreen laptop needs them at
   1440px. Reach for `theme()` only when the layout cannot work it out itself.

### Looking modern

What separates this from a dated docs theme is mostly restraint plus three
specifics, all tokenised in `global.css`:

- **Radii** (`--ck-r-sm/-r/-r-lg`, 8/12/16px) rather than 4px corners.
- **Soft elevation** (`--ck-shadow*`), and crucially **at rest**, not only on
  hover. A card drawn in the page's own background colour with a 1.1:1 hairline
  is not a card — it is text in a box, which is exactly how these read before.
  `.ck-card` uses `--color-surface` with `--ck-shadow-sm` resting and
  `--ck-shadow` on hover. Elevation that appears only under the pointer tells
  the reader it is clickable after they have already found it.
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

### How the project is funded, and where that may be said

The maintainer also runs **Flight Token**, a weight and balance and performance
app for helicopter pilots, sold by **subscription** — say "a subscription", not
"buying it". ("Weight and balance" is one term — never write it as "weight,
balance and performance", which reads as three separate things.) That is the project's funding model, and it is
deliberately the only one: it needs no ad network, no third-party script and no
reader data, so it is the one option that does not violate the rules above.

It lives on [`why-this-is-free`](src/content/docs/start-here/why-this-is-free.mdx),
linked from the sidebar footer. The rules for it:

- **Not on the home page.** The home page converts a stranger into a reader in
  one screen, and anything else competes with that. A reader should meet the app
  *after* they have evidence the material is good, not before.
- **No superlatives about it.** No "best on the market", no "hands down".
  Describe what it does and let the reader judge. This site's whole posture is
  cited sources and status badges that admit when a page is a draft; an unsourced
  claim about the maintainer's own product next to that makes the courses read as
  a funnel.
- **Do not invent the counterfactual.** An earlier draft said a subscription
  "lets me spend evenings writing lessons instead of chasing sponsors". Neither
  half was true — the hours were overstated and nobody was ever going to chase
  sponsors. It read well, which is exactly why it survived a few passes. State
  the relationship and stop: a subscription helps cover the time this takes.
  Invented colour in the funding pitch is the easiest place on the site to lose
  a reader's trust, because it is the one paragraph they are already reading
  sceptically.
- **Say it funds *time*, not hosting.** Hosting is effectively free and that is a
  non-negotiable above — claiming the app pays a server bill would be untrue and
  a reader can tell. What is scarce is the hours it takes to write a lesson
  correctly.
- **Keep it away from the instruction.** Never put the app in or directly after a
  weight-and-balance or performance lesson. The disclaimer says not to use this
  material for flight planning; teaching W&B and then linking a W&B tool blurs
  that line. Funding explanation and instruction stay structurally separate.
- **Always give the reader an out.** The page ends by telling them to use the
  courses regardless. That line is what makes the rest read as generous rather
  than conditional — do not remove it.

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
  from the **sidebar footer**, which puts it on every course and subject page.
  It is deliberately *not* on the home page any more — see the home page note
  under "Navigation".
- **This site is ground school, never "flight training".** 14 CFR 61.1 defines
  flight training as instruction received from an authorized instructor *in
  flight in an aircraft*, and ground training as everything else. A website
  cannot deliver the first one — so "flight training" in our own copy is a
  category error, not a loose synonym, and it is the sort of imprecision a CFI
  or an examiner notices immediately on a site that otherwise cites its
  regulations carefully. The home page headline said it for months; so did the
  site-wide meta description, the README and this file. Use **ground school**
  (vernacular, warmer) or **ground training** (matches the regulation's term).
  This stays true once `kind: flight` lessons exist: what a page can carry is
  the briefing for a flight lesson, never the flight lesson.
- **Never name the plumbing in reader-facing copy.** The audience is student
  pilots and instructors, not developers. No repository, no GitHub, no hosting
  provider, no "static site", no servers, databases, APIs, build steps, free
  tiers or `localStorage`. `why-this-is-free` once explained the hosting setup
  to justify the site being free; it told a student pilot nothing and made a
  page about *them* read as though written for someone else. Say what a thing
  means for the reader instead — "nothing behind it charges by the visitor", not
  "static output on a free tier"; "saved on the device you're reading on", not
  "progress lives in localStorage". This file and the `docs/` folder are for
  maintainers and are exempt.
- **Say "not official", not "not real".** The instruction here is real and
  written by instructors; what it lacks is FAA *approval*, and an authorized
  instructor's endorsement is a thing only that instructor can give. Write the
  precise limitation. Hedging language that implies the material is merely notes
  is both inaccurate and worse for the reader, who then can't tell which
  cautions are the load-bearing ones.

### Copyright

- FAA publications are public domain — quote and link freely.
- **Manufacturer publications (RFM/POH, safety notices, service bulletins) are
  copyrighted.** Cite and link; never reproduce them wholesale.
- **Keep site-wide policy pages airframe-agnostic.** Name a manufacturer in a
  lesson that actually teaches that aircraft — Robinson in the SFAR 73 and
  mast-bumping material, for instance — but not in the disclaimer or anywhere
  else stating general policy. The disclaimer used to point at Robinson's
  publications by name, which framed the whole site as Robinson-specific. The
  courses lean that way today; the project does not promise to.
- Content is **CC BY-SA 4.0** (`LICENSE-CONTENT`). That is the one that matters
  and the one the site states.
- The `LICENSE` file is MIT for the code. It is **moot while the repository is
  private** — nobody can obtain the code, so there is nobody for the grant to
  apply to. The site no longer mentions it, because telling a reader the code
  is MIT while giving them no way to get it is noise at best. Leave the file; it
  costs nothing and becomes meaningful again if the source is ever published.
- **State the licence in plain English first, formal name second.** The
  disclaimer page leads with what a reader may actually do — print it, teach
  from it, build on it, charge for their instruction — then names CC BY-SA. An
  instructor deciding whether they may use this in a class should not have to
  read a licence deed to find out.

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

### A split lesson has an overview page

A lesson split into parts gets a landing page: `overview: true` in the `lesson`
block, same `kind` and `kindNumber` as its parts, no `part`. Everything that
links to the lesson — the sidebar row, the course contents — points there
instead of at part 1, so a reader meets the recording and the shape of the
lesson before being dropped into the middle of it. It also gives a phone reader
a part list they can reach without opening the drawer, which the sidebar alone
could not.

**This is not a fifth level.** It is the Lesson level finally having a page of
its own; the hierarchy is still Course → Week → Lesson → Part.

Two rules it must keep:

- **An overview is navigation, not a sitting.** It stays out of `pageIds`, so
  it is not in the progress denominator and cannot be "completed". Only parts
  count. `LessonHeader` also suppresses its reading time, which would be a
  misleading minute or two; `LessonParts` states the lesson's total instead.
- **Anything counting parts must exclude it.** It shares the lesson's `kind`
  and `kindNumber`, so a naive sibling count made a four-part lesson say
  "Part 1 of 5".

Single-page lessons do not get one — there is nothing to land in front of.

### Subject articles: area → airframe → article → part

The reference side has the same depth as the course side, and for a reason that
matters more here than tidiness.

**Articles divide into general and airframe-specific, and the division is
real.** How a swashplate turns control inputs into blade pitch is true of every
helicopter that has one. How *this* aircraft's governor behaves, what its RPM
limits are, which safety notices apply — true of exactly one. Mixing them in a
flat list makes a reader guess which they are reading, which is the worst
outcome available in material someone may act on.

So `topic.airframe` puts an article under that aircraft inside its area, and
articles naming none are general and sort first, because the specific ones build
on them. Airframes are listed in `src/lib/airframes.ts`. A **group heading is
suppressed when an area has only the general group** — "General" above the only
list labels nothing.

Use `airframe` when the content is true of that aircraft and not of helicopters
at large. A swashplate article that happens to use an R22 as its example is
still general.

**Long articles split like lessons**, with the same three fields under `topic`:
`article` (the slug grouping the pages, the way `kind` + `kindNumber` groups a
lesson's), `part`, and `overview` on the landing page. Everything linking to the
article points at the overview. An overview stays out of `pageIds` for the same
reason a lesson's does.

Reference articles split at a **lower word count than lessons**, and that is
correct rather than sloppy: a lesson page is sized to one sitting, but someone
looking something up wants to land on the bit they came for. Split on the
subject seam, not at a word count.

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
rendered by `LessonAudio.astro`. On a split lesson it goes on the **overview
page**, not on part 1: the recording covers the whole lesson, and the overview
is where a reader lands.

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
| Styling | Tailwind 4 + CSS custom properties | Tokens *and breakpoints* in `src/styles/global.css` |
| Interactivity | React 19 islands | Only the quiz and progress UI |
| Search | Pagefind (built in) | Static index, no service |
| Host | Cloudflare Pages | Free tier, static |

Node is pinned to **22** (`.nvmrc`, `.node-version`).

```sh
npm run dev          # http://localhost:4321
npm run build        # static output to dist/
npm run check        # token guard + astro check — must stay at 0 errors
npm run lint:tokens  # the guard alone: shared tokens, breakpoints, no literals
npm test             # progress module tests
du -sh public/audio  # media weight — see docs/media.md before this passes ~250 MB
```

`npm test` needs no framework and no build step: Node strips the TypeScript
types itself via `--experimental-strip-types`. `scripts/check-tokens.mjs` has no
dependencies either — it is plain Node, so it costs nothing to run in CI.

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

- `src/lib/courses.ts` — courses, so a course can be named before it is written.
- `src/lib/subjects.ts` — subject areas, so an area can be named before it has
  articles.
- `src/lib/airframes.ts` — airframes, so an aircraft can be named before it has
  articles. A group with none is not rendered.

A planned course has no page, so **only `status: 'open'` courses may be linked**
— and `CourseCatalog` also requires the course to have at least one lesson, so
flipping `status` early cannot produce a link to an empty outline.

#### Real content gets real estate; plans get a line

**Never give a plan the same footprint as something a reader can actually use.**
Planned courses used to render as dashed cards in the same grid as real ones,
and planned subject areas as a heading plus five bullets with blurbs. At launch
that meant three quarters of `/curriculum/` was placeholder: the pages read as
an *empty* site rather than a small one, which is a worse and less accurate
impression than the truth.

Both now collapse to one muted sentence — "Instrument, Commercial and Flight
Instructor are planned." The roadmap is still stated, because hiding it would
be the dishonest version, but it takes a line rather than a grid. This also
scales on its own: as each course opens it moves from the sentence into the
grid, and when the last one does the sentence disappears.

`listSentence()` in `src/lib/format.ts` builds those lists — shared, because
both components need it and two copies can disagree about the serial comma.

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

On a split lesson the pieces are spread across three places, by what each one
covers:

- the **overview page** carries the header, the recording (`<LessonAudio>`) and
  `<LessonParts>` — whole-lesson things, and it is where a reader lands;
- each **part** carries its own prose and Key Notes;
- the **last part** carries the review tools (homework, flashcards, quiz) under
  a `## Review` heading, because they cover the whole lesson and that is where
  a reader finishes it. They are deliberately *not* on the overview: a reader
  who has just read part 4 should not have to navigate back to be tested.

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
- **Always commit and push when a piece of work is finished.** Do not leave
  completed work sitting in the working tree at the end of a session — this is
  standing permission, so there is no need to ask each time. Two conditions:
  the three commands above must pass first, and **never commit a file likely to
  hold secrets** (`.env`, credentials, `.claude/settings.local.json`). If the
  current branch is `main`, branch before committing.
- When adding a schema field, document it with a comment in
  `src/content.config.ts` — that file is the reference for contributors.
- Prefer extending an existing component over adding a parallel one.
- **Check a UI change at each breakpoint and in both themes before calling it
  done.** The scale and what changes at each size are in
  [`docs/breakpoints.md`](docs/breakpoints.md); 380px, 768px, 800px and 1280px
  catch nearly everything, because 800px is where the sidebar appears.
- Status badges are the site's honesty mechanism. Never upgrade a status to make
  the site look more finished than it is.
