#!/usr/bin/env node
/**
 * Token guard — keeps the shared design system actually shared.
 *
 * This exists because every rule it enforces was already broken in this repo
 * before it was written: four `var(--ck-radius)` references to a token that was
 * never defined (so those corners were square), `#d29922` pasted into one
 * component, `rgba(2, 6, 12, 0.66)` in two, `#fff` on an accent fill that
 * measures 2.5:1 in the dark theme, and five hand-written media queries at five
 * different widths. None of it was visible in review. All of it is visible to a
 * reader.
 *
 * Checks, in order of how much they matter:
 *
 *   1. Every `--ck-*` / `--color-*` a file reads is defined in global.css.
 *   2. No literal colour outside global.css.
 *   3. No literal width in a media query — use `theme(--breakpoint-*)`.
 *   4. Any file using `theme()` declares `@reference` to global.css.
 *
 * Run: `npm run lint:tokens` (and it runs as part of `npm run check`).
 */

import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const TOKENS_FILE = join(ROOT, 'src/styles/global.css');

/** global.css is the one file allowed to hold raw values — it defines them. */
const TOKEN_SOURCE = relative(ROOT, TOKENS_FILE);

/**
 * Custom-property prefixes we do not own and therefore cannot check:
 * Starlight's, Tailwind's internals, and Pagefind's search UI.
 */
const FOREIGN_PREFIXES = ['--sl-', '--tw-', '--pagefind-', '--astro-'];

const problems = [];
const fail = (file, line, msg, hint) =>
	problems.push({ file: relative(ROOT, file), line, msg, hint });

// ─── Collect the defined tokens ──────────────────────────
const tokensCss = readFileSync(TOKENS_FILE, 'utf8');
const defined = new Set(
	[...tokensCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);

// ─── Walk src/ ───────────────────────────────────────────
async function walk(dir) {
	const out = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await walk(p)));
		else if (['.css', '.astro', '.tsx'].includes(extname(entry.name))) out.push(p);
	}
	return out;
}

/**
 * The CSS regions of a file.
 *
 * A `.css` file is all CSS. In `.astro` and `.tsx` only `<style>` blocks are —
 * scanning the whole file would flag `fill="currentColor"` and every SVG
 * `stroke=` as a hardcoded colour.
 *
 * Returns segments carrying their starting line so messages point somewhere.
 */
function cssRegions(file, text) {
	if (extname(file) === '.css') return [{ text, startLine: 1 }];

	const regions = [];
	const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
	let m;
	while ((m = re.exec(text))) {
		regions.push({
			text: m[1],
			startLine: text.slice(0, m.index).split('\n').length,
		});
	}
	return regions;
}

const files = await walk(SRC);

for (const file of files) {
	const text = readFileSync(file, 'utf8');
	const isTokenSource = relative(ROOT, file) === TOKEN_SOURCE;

	for (const region of cssRegions(file, text)) {
		const lines = region.text.split('\n');

		// Tokens this region defines itself are legitimate to read.
		const localDefs = new Set(
			[...region.text.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
		);

		lines.forEach((raw, i) => {
			const lineNo = region.startLine + i;
			// Strip trailing comments so a documented hex in a comment is fine.
			const line = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/, '');
			if (!line.trim()) return;

			// ── 1. Undefined token ──
			for (const [, name] of line.matchAll(/var\((--[a-z0-9-]+)/g)) {
				if (FOREIGN_PREFIXES.some((p) => name.startsWith(p))) continue;
				if (defined.has(name) || localDefs.has(name)) continue;
				fail(
					file,
					lineNo,
					`var(${name}) is not defined in ${TOKEN_SOURCE}`,
					'A missing custom property silently resolves to nothing — this is how four radii became square corners. Define it, or use the token that already exists.',
				);
			}

			// ── 2. Literal colour ──
			if (!isTokenSource) {
				const hex = line.match(/#[0-9a-fA-F]{3,8}\b/);
				const fn = line.match(/\b(?:rgba?|hsla?)\(/);
				// `color-mix(in srgb, var(--token) 45%, …)` is composition of
				// tokens, not a literal, and is used deliberately for hovers.
				if ((hex || fn) && !/color-mix\(/.test(line)) {
					fail(
						file,
						lineNo,
						`hardcoded colour ${hex ? hex[0] : fn[0] + '…)'}`,
						`Use a token from ${TOKEN_SOURCE}. Tokens are defined for both themes, so a literal is a light-theme-only colour — and nobody re-measures it for contrast.`,
					);
				}
			}

			// ── 3. Literal media-query width ──
			if (/@media/.test(line) || /^\s*(and|or)\b/.test(line)) {
				const widthish = /(?:min-width|max-width)\s*:\s*[\d.]+(?:rem|em|px)|\bwidth\s*[<>]=?\s*[\d.]+(?:rem|em|px)/;
				if (widthish.test(line)) {
					fail(
						file,
						lineNo,
						'literal width in a media query',
						'Use `theme(--breakpoint-…)` so every component switches at the same place. See docs/breakpoints.md.',
					);
				}
			}
		});

		// ── 4. theme() without @reference ──
		if (
			/theme\(\s*--/.test(region.text) &&
			!/@reference\s/.test(region.text) &&
			!isTokenSource
		) {
			fail(
				file,
				region.startLine,
				'uses theme() but has no `@reference`',
				'Without `@reference "…/styles/global.css";` in the same style block, theme() has no theme to read and the build fails — or worse, silently drops the rule.',
			);
		}
	}
}

// ─── Report ──────────────────────────────────────────────
if (problems.length === 0) {
	console.log(`tokens: OK — ${files.length} files, ${defined.size} tokens defined`);
	process.exit(0);
}

console.error(`\ntokens: ${problems.length} problem(s)\n`);
const byFile = new Map();
for (const p of problems) {
	if (!byFile.has(p.file)) byFile.set(p.file, []);
	byFile.get(p.file).push(p);
}
for (const [file, list] of byFile) {
	console.error(`  ${file}`);
	for (const p of list) {
		console.error(`    ${p.line}: ${p.msg}`);
		console.error(`      → ${p.hint}`);
	}
	console.error('');
}
process.exit(1);
