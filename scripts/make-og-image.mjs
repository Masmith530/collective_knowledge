#!/usr/bin/env node
/**
 * Generate `public/og-image.png` — the social card.
 *
 * Why this exists: Starlight declares `twitter:card: summary_large_image` on
 * every page. Declaring a large-image card and supplying no image renders as a
 * blank or degraded card, which is how the site looked anywhere it was shared.
 * Pilot forums and group chats are exactly how a project like this spreads, so
 * the card is not cosmetic.
 *
 * Why generated rather than designed in a tool: `sharp` is already a dependency
 * (Astro pulls it in for image handling), so this needs no new package, no paid
 * service and no binary blob whose provenance nobody remembers. Re-run it after
 * changing the wordmark or the headline.
 *
 * Fonts: the SVG is rasterised by sharp's bundled renderer, which uses system
 * fonts. The stack below lists widely-present faces and falls back to generic
 * sans-serif, so this produces a sane result on macOS, Linux and CI without
 * shipping a font file.
 *
 * Run: npm run og:image
 */

import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(new URL('..', import.meta.url).pathname, 'public/og-image.png');

// Facebook/LinkedIn/X all crop toward 1.91:1. 1200x630 is the safe canonical size.
const W = 1200;
const H = 630;

// Pulled from the light theme in src/styles/global.css. Kept in sync by hand
// because an SVG string cannot read CSS custom properties — if you change the
// accent or the text colours there, change them here too.
const ACCENT = '#2563eb';
const INK = '#0f172a';
const MUTED = '#64748b';
const HAIRLINE = '#e6ebf1';

const FONTS = "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>

  <!-- A single accent rule along the top, the one flourish the site allows. -->
  <rect width="${W}" height="8" fill="${ACCENT}"/>

  <!-- Wordmark: the favicon mark at scale, plus the name. -->
  <g transform="translate(96, 112)">
    <rect width="64" height="64" rx="15" fill="${ACCENT}"/>
    <g transform="rotate(-28 32 32)">
      <line x1="9.2" y1="32" x2="54.8" y2="32" stroke="#ffffff" stroke-width="6.4" stroke-linecap="round"/>
    </g>
    <circle cx="32" cy="32" r="7.8" fill="#ffffff"/>
    <circle cx="32" cy="32" r="3.2" fill="${ACCENT}"/>

    <text x="84" y="43" font-family="${FONTS}" font-size="30" font-weight="700" fill="${INK}">
      Collective<tspan dx="8" fill="${ACCENT}">Knowledge</tspan>
    </text>
  </g>

  <!-- Headline. Two lines, set by hand: SVG has no text wrapping. -->
  <text x="96" y="300" font-family="${FONTS}" font-size="68" font-weight="700" fill="${INK}" letter-spacing="-2">
    Free, open ground school
  </text>
  <text x="96" y="378" font-family="${FONTS}" font-size="68" font-weight="700" fill="${INK}" letter-spacing="-2">
    for helicopter pilots.
  </text>

  <text x="96" y="446" font-family="${FONTS}" font-size="27" fill="${MUTED}">
    Week-by-week lessons, plus reference articles covering each subject in full.
  </text>

  <line x1="96" y1="516" x2="${W - 96}" y2="516" stroke="${HAIRLINE}" stroke-width="2"/>

  <text x="96" y="562" font-family="${FONTS}" font-size="24" font-weight="600" fill="${MUTED}">
    No accounts &#183; No ads &#183; No paywalls
  </text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(OUT, png);

const meta = await sharp(png).metadata();
console.log(
	`og:image written to public/og-image.png — ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} KB`,
);
