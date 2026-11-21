# Breakpoints

One scale, defined once, in the `@theme` block at the top of
[`src/styles/global.css`](../src/styles/global.css). Nothing else in the repo
may contain a literal screen width. `npm run lint:tokens` enforces it.

## The scale

| Name   | Value   | px     | What it is                                       |
| ------ | ------- | ------ | ------------------------------------------------ |
| `xs`   | `30rem` | 480    | Large phone; phone in landscape                  |
| `sm`   | `40rem` | 640    | Small tablet, portrait                           |
| `md`   | `48rem` | 768    | Tablet, portrait (iPad mini/Air portrait)         |
| `nav`  | `50rem` | 800    | **Structural.** Sidebar ⇄ hamburger              |
| `lg`   | `64rem` | 1024   | Tablet landscape; small laptop                   |
| `wide` | `72rem` | 1152   | **Structural.** Content column starts centring    |
| `xl`   | `80rem` | 1280   | Desktop                                          |
| `2xl`  | `96rem` | 1536   | Wide desktop                                     |

`xs`, `sm`, `md`, `lg`, `xl` and `2xl` are Tailwind's own default values, so a
contributor who already knows `md:` is not surprised by what it means here. `xs`
is the one addition — Tailwind has no name below 640px, and a 480px phone
breakpoint is the single most useful one on this site.

### `nav` and `wide` are Starlight's, not ours

These two are not round numbers and must not be "tidied" to 48rem and 80rem.
Starlight hardcodes **50rem** and **72rem** in its own layout CSS:

- At **`nav` (50rem)** Starlight stops rendering the fixed hamburger button and
  the sidebar becomes a permanent left column (`PageFrame.astro`). Its internal
  utility `md:` is also 50rem, which is *not* our `md`.
- At **`wide` (72rem)** Starlight sets `margin-inline: auto` on the content
  container (`ContentPanel.astro`), so the prose column starts centring in the
  leftover space. Because `tableOfContents: false` means there is no right
  sidebar, this is what keeps lessons centred on a large monitor — we get it for
  free and should not reimplement it.

Move a layout rule off these values and you open a band of widths where our CSS
and Starlight's disagree about whether there is a sidebar. That shows up as a
header nav that overlaps the hamburger, or a page with no section nav at all.

## How to use one

CSS custom properties are **illegal inside `@media`** — `@media (min-width:
var(--x))` does nothing. Tailwind's `theme()` function is resolved at build
time, so it works where `var()` cannot:

```css
<style>
	@reference "../styles/global.css";

	/* Phones */
	@media (width < theme(--breakpoint-xs)) { … }

	/* Tablet portrait only */
	@media (width >= theme(--breakpoint-xs)) and (width < theme(--breakpoint-md)) { … }

	/* Sidebar present */
	@media (width >= theme(--breakpoint-nav)) { … }
</style>
```

Two things to know:

1. **`@reference` is required**, once per style block, pointing at `global.css`
   with a path relative to the component (`../styles/global.css`, or
   `../../styles/global.css` under `components/overrides/`). It loads the theme
   and emits no CSS of its own. Without it `theme()` has nothing to resolve
   against and the build fails.
2. **It compiles away.** `width < theme(--breakpoint-xs)` ships as
   `@media not all and (width >= 30rem)`. There is no runtime cost and no
   custom property lookup in the browser.

Because the scale lives in `@theme`, Tailwind's utility prefixes read the same
numbers — `md:`, `lg:`, and also `nav:` and `wide:`. One definition, three
consumers: media queries, utility classes, and `var(--breakpoint-md)` if JS ever
needs it.

## Prefer no breakpoint

A breakpoint is a guess about a viewport. An intrinsic layout is a fact about
the content, it responds to its *container* rather than the window, and it keeps
working at widths nobody tested. Reach for `theme()` only when the layout
genuinely cannot work it out for itself.

In this repo:

- `CourseCatalog` uses `grid-template-columns: repeat(auto-fit, minmax(17rem,
  1fr))` and has **no** media query. It goes one → two → three columns on its
  own, and stays correct inside the content column whatever the sidebar does.
- The hero headline uses `clamp(2.1rem, 5.4vw, 3.25rem)`. Only the hand-placed
  `<br>`, which clamp cannot express, gets a breakpoint.
- `LessonHeader`'s meta line and several card headers use `flex-wrap: wrap`.

## Touch is not a width

Tap-target sizing uses `@media (pointer: coarse)`, never a width. A touchscreen
laptop needs 44px targets at 1440px, and a phone in landscape does not stop
needing them because it crossed 480px. The shared minimum is `--ck-tap`
(`2.75rem` / 44px — the figure Apple's HIG and WCAG 2.2 target-size both land
on).

Applied to: `.ck-btn` (globally), the quiz and flashcard close buttons and
choices, sidebar links, the completion checkbox, and the audio player's height.

## What changes at each size

| Size      | Behaviour                                                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| < `xs`    | Wordmark is the mark alone; hero buttons stack full-width; lesson-kind chip moves above the lesson title; quiz and flashcard modals go full-screen on `dvh` with a sticky action footer; progress rows stack; headings allow hyphenation |
| < `sm`    | Lesson durations hidden in the outline; flashcard resting card and Again/Got-it pair stack; parts list loses its chip-aligned indent              |
| < `md`    | Prose tables scroll horizontally with `nowrap` cells instead of collapsing columns; modals trim side margin and cap on `90dvh`                     |
| < `nav`   | Starlight renders the sidebar as a full-width drawer — roomier padding, larger type, capped to a 32rem measure; header drops section nav and the GitHub link (both live in the drawer); header gap tightens |
| ≥ `nav`   | Sidebar is a permanent column; header carries section nav and the GitHub link                                                                      |
| ≥ `wide`  | Starlight centres the content column (inherited, not ours)                                                                                         |

## Changing the scale

Edit the `@theme` block in `global.css` — that is the only place. Then:

```sh
npm run lint:tokens   # no literal widths crept in
npm run build         # theme() still resolves everywhere
```

and check the result at each size. If you change `nav` or `wide`, re-read the
section above first; you are overriding Starlight and will need to override its
CSS too.
