/**
 * Completion marks — the one implementation of "tick what the reader has done".
 *
 * Four places render links to lesson pages and want the completed ones ticked:
 * the sidebar outline, the course contents, the subject index, and a split
 * lesson's part list. Each of the first three had grown its own copy of the
 * same loop, each reaching into `localStorage` directly and each listening to
 * the same three events — four copies free to disagree about what "done" looks
 * like, which is exactly the duplication the token guard exists to catch in CSS
 * and nothing was catching in script.
 *
 * The contract is the markup, not an import: anything carrying
 * `data-ck-lesson="<page path>"` gets `data-ck-done` when that page is
 * complete, and styles itself however it likes. Nothing needs to know what
 * else is on the page.
 *
 * Reads go through `src/lib/progress.ts`, which is the only module allowed to
 * touch storage — so a reader with it disabled gets no ticks rather than a
 * broken page.
 */
import { read } from './progress';

/** Completed page paths, as `{ "/curriculum/.../": timestamp }`. */
export function completions(): Record<string, string> {
	return read().lessons;
}

/**
 * Tick every `[data-ck-lesson]` under `root`.
 *
 * Document-wide by default and safe to run more than once: it sets or clears
 * the attribute on each pass, so two components both asking for a sweep is a
 * wasted query rather than a wrong answer.
 */
export function markCompletions(
	root: ParentNode = document,
	lessons: Record<string, string> = completions(),
): void {
	for (const el of root.querySelectorAll('[data-ck-lesson]')) {
		const id = el.getAttribute('data-ck-lesson');
		if (id && lessons[id]) el.setAttribute('data-ck-done', '');
		else el.removeAttribute('data-ck-done');
	}
}

/**
 * Run `fn` now and whenever progress changes.
 *
 * Three sources, all of which matter:
 *   - `ck:progress`, dispatched by `progress.ts` on every write, so finishing a
 *     quiz ticks the sidebar without a reload;
 *   - `storage`, so a second tab stays in step;
 *   - `astro:page-load`, harmless today and correct if view transitions are
 *     ever turned on.
 */
export function onProgress(fn: () => void): void {
	fn();
	document.addEventListener('astro:page-load', fn);
	window.addEventListener('ck:progress', fn);
	window.addEventListener('storage', fn);
}

/** The common case: tick everything on the page, and keep it ticked. */
export function watchCompletions(): void {
	onProgress(() => markCompletions());
}
