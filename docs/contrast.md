# Theme contrast

Measured record of the theme tokens in `src/styles/global.css`.
**If you change a colour, re-measure it and update this file.**

Targets: **4.5:1** for body text (WCAG AA), **3:1** for interactive
borders and other non-text UI (WCAG AA non-text).

Light is the site default; dark applies only when a reader explicitly
picks it. See `src/components/overrides/ThemeProvider.astro`.

## Light (default)

### Text

| Token | canvas | canvas-subtle |
| --- | --- | --- |
| `text-primary` `#0f172a` | 17.85:1 PASS | 17.06:1 PASS |
| `text-secondary` `#475569` | 7.58:1 PASS | 7.24:1 PASS |
| `text-muted` `#64748b` | 4.76:1 PASS | 4.55:1 PASS |
| `accent` `#2563eb` | 5.17:1 PASS | 4.94:1 PASS |
| `accent-strong` `#1d4ed8` | 6.70:1 PASS | 6.41:1 PASS |
| `ok` `#15803d` | 5.02:1 PASS | 4.79:1 PASS |
| `warn` `#a16207` | 4.92:1 PASS | 4.71:1 PASS |
| `bad` `#b91c1c` | 6.47:1 PASS | 6.18:1 PASS |
| `info` `#6d28d9` | 7.10:1 PASS | 6.79:1 PASS |

### Interactive borders (need 3:1)

| Token | canvas | canvas-subtle |
| --- | --- | --- |
| `border-strong` `#858fa0` | 3.26:1 PASS | 3.12:1 PASS |
| `border-accent` `#5c88e4` | 3.44:1 PASS | 3.29:1 PASS |

### Text on an accent fill

| Token | accent `#2563eb` | accent-strong `#1d4ed8` (hover) |
| --- | --- | --- |
| `on-accent` `#ffffff` | 5.17:1 PASS | 6.70:1 PASS |

The light theme's own neutrals are still slate-tinted (`#f8fafc`, `#475569`).
That is unchanged and intentional — the charcoal rework was for dark, where the
cast was doing the damage. On a white canvas a faint cool tint is not what makes
a page look dated.

## Dark — neutral charcoal

The dark theme is a **neutral charcoal**, not a navy. It was rebuilt from a
blue-tinted slate palette whose every surface and grey leaned 21-41 points
towards blue (measured as channel spread, max − min). That cast is what made it
read as a generic "GitHub dark" rather than as a dark reference.

| Neutral | Old | Spread | New | Spread |
| --- | --- | --- | --- | --- |
| `canvas` | `#0b1120` | 21 | `#17181a` | 3 |
| `canvas-subtle` | `#111a2b` | 26 | `#1e1f21` | 3 |
| `surface` | `#172034` | 29 | `#252729` | 4 |
| `border` | `#223049` | 39 | `#343638` | 4 |
| `border-muted` | `#1a2437` | 29 | `#26282a` | 4 |
| `border-strong` | `#6b7d94` | 41 | `#84888c` | 8 |
| `text-primary` | `#e8eef7` | 15 | `#e9eaeb` | 2 |
| `text-secondary` | `#a3b3c9` | 38 | `#b3b6b9` | 6 |
| `text-muted` | `#8798b0` | 41 | `#929598` | 6 |

A small residual spread is deliberate — a perfectly neutral grey reads flat, and
a couple of points of cool is what makes it charcoal rather than concrete.

The **accent stays blue** in both themes. It is the site's one accent colour, and
on a neutral charcoal it now has nothing to compete with.

### Text

| Token | canvas | canvas-subtle | surface |
| --- | --- | --- | --- |
| `text-primary` `#e9eaeb` | 14.75:1 PASS | 13.69:1 PASS | 12.44:1 PASS |
| `text-secondary` `#b3b6b9` | 8.72:1 PASS | 8.10:1 PASS | 7.36:1 PASS |
| `text-muted` `#929598` | 5.90:1 PASS | 5.48:1 PASS | 4.98:1 PASS |
| `accent` `#60a5fa` | 6.99:1 PASS | 6.49:1 PASS | 5.90:1 PASS |
| `accent-strong` `#93c5fd` | 9.85:1 PASS | 9.15:1 PASS | 8.31:1 PASS |
| `ok` `#4ade80` | 10.20:1 PASS | 9.47:1 PASS | 8.60:1 PASS |
| `warn` `#fbbf24` | 10.64:1 PASS | 9.88:1 PASS | 8.98:1 PASS |
| `bad` `#fb7185` | 6.60:1 PASS | 6.13:1 PASS | 5.57:1 PASS |
| `info` `#c4b5fd` | 9.62:1 PASS | 8.93:1 PASS | 8.12:1 PASS |

### Interactive borders (need 3:1)

| Token | canvas | canvas-subtle | surface |
| --- | --- | --- | --- |
| `border-strong` `#84888c` | 4.98:1 PASS | 4.62:1 PASS | 4.20:1 PASS |
| `border-accent` `#517eb6` | 4.24:1 PASS | 3.93:1 PASS | 3.58:1 PASS |

### Text on an accent fill

| Token | accent `#60a5fa` | accent-strong `#93c5fd` (hover) |
| --- | --- | --- |
| `on-accent` `#17181a` | 6.99:1 PASS | 9.85:1 PASS |

### Derived colours checked against the new charcoal

Composed values are not exempt — these are the ones that end up behind or as
text, measured after compositing:

| Where | Resolves to | Ratio |
| --- | --- | --- |
| `ok` on `ok-soft` over canvas | `#1c2c24` | 8.40:1 PASS |
| `warn` on `warn-soft` over canvas | `#2e291b` | 8.68:1 PASS |
| `bad` on `bad-soft` over canvas | `#2e2125` | 5.74:1 PASS |
| `accent` on `accent-soft` over canvas | `#202935` | 5.78:1 PASS |
| Sidebar current-page kind label (`accent` 75% / `text-muted`) | `#6ca1e2` | 6.63:1 PASS |

## Notes

- Worst text ratio across both themes: **4.55:1** (Light (default) ·
  text-muted on canvas-subtle). Dark's worst is **4.98:1** (text-muted on
  surface).
- Worst interactive border: **3.29:1** (Light · border-accent on canvas-subtle).
- Failures: **none**.
- `border` and `border-muted` are decorative separators, so the 3:1
  non-text rule does not apply to them. Anything a reader clicks or types
  into uses `border-strong`, which does meet it.
- The focus ring uses `accent`, which clears 3:1 on every background in
  both themes.

### Why `on-accent` exists

Text on a *filled accent* background — the primary button, the current
part chip, the selected quiz choice — was a hardcoded `#fff` in four
places. That is fine in the light theme, where the accent is a mid blue,
and badly wrong in the dark theme, where the accent is a **light** blue:

| Measured before | Ratio |
| --- | --- |
| `#ffffff` on dark `accent` `#60a5fa` | **2.54:1 FAIL** |
| `#ffffff` on dark `accent-strong` `#93c5fd` (hover) | **1.80:1 FAIL** |

`--color-on-accent` is `#ffffff` in light and `#0b1120` in dark, so the
same rule is correct in both. There is now no `#fff` in any component —
`npm run lint:tokens` fails the build if one comes back.

The same fix applied to the Homework callout, which had `#d29922`
hardcoded twice: **2.41:1 FAIL** on `canvas-subtle`. It now uses the
`warn` token at 4.71:1.

### Why `border-accent` exists

The accent-tinted edge a card takes on hover was
`color-mix(in srgb, var(--color-accent) 45%, var(--color-border))`, written
out identically in `CourseCatalog` and `SubjectIndex`. It is an
**interactive** border, so it owes 3:1 — and it never met it:

| Measured before | Ratio |
| --- | --- |
| light, on `canvas` | **2.22:1 FAIL** |
| light, on `canvas-subtle` | **2.12:1 FAIL** |
| dark (new charcoal), on `canvas-subtle` | **2.87:1 FAIL** |

A duplicated expression is also a value nobody can measure, which is
exactly how it went unnoticed. It is now one token per theme, measured
above, and the two components reference it.
