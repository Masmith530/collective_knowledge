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

## Dark

### Text

| Token | canvas | canvas-subtle | surface |
| --- | --- | --- | --- |
| `text-primary` `#e8eef7` | 16.14:1 PASS | 14.92:1 PASS | 13.93:1 PASS |
| `text-secondary` `#a3b3c9` | 8.83:1 PASS | 8.16:1 PASS | 7.62:1 PASS |
| `text-muted` `#8798b0` | 6.41:1 PASS | 5.93:1 PASS | 5.53:1 PASS |
| `accent` `#60a5fa` | 7.41:1 PASS | 6.85:1 PASS | 6.39:1 PASS |
| `accent-strong` `#93c5fd` | 10.44:1 PASS | 9.65:1 PASS | 9.01:1 PASS |
| `ok` `#4ade80` | 10.81:1 PASS | 9.99:1 PASS | 9.32:1 PASS |
| `warn` `#fbbf24` | 11.28:1 PASS | 10.43:1 PASS | 9.73:1 PASS |
| `bad` `#fb7185` | 7.00:1 PASS | 6.47:1 PASS | 6.04:1 PASS |
| `info` `#c4b5fd` | 10.20:1 PASS | 9.43:1 PASS | 8.80:1 PASS |

### Interactive borders (need 3:1)

| Token | canvas | canvas-subtle | surface |
| --- | --- | --- | --- |
| `border-strong` `#6b7d94` | 4.47:1 PASS | 4.13:1 PASS | 3.86:1 PASS |

## Notes

- Worst text ratio across both themes: **4.55:1** (Light (default) · text-muted on canvas-subtle).
- Failures: **none**.
- `border` and `border-muted` are decorative separators, so the 3:1
  non-text rule does not apply to them. Anything a reader clicks or types
  into uses `border-strong`, which does meet it.
- The focus ring uses `accent`, which clears 3:1 on every background in
  both themes.
