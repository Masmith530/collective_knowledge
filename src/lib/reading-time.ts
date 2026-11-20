/**
 * Reading time from a page's raw Markdown body.
 *
 * Computed from the content collection rather than a remark plugin: Astro 7's
 * default Markdown processor would need the legacy `@astrojs/markdown-remark`
 * pipeline installed to run remark plugins, and a word count is not worth
 * changing how every page is rendered.
 *
 * 220 wpm is a realistic pace for technical prose the reader is meant to absorb.
 * Faster figures flatter the page and mislead.
 */
const WORDS_PER_MINUTE = 220;

/** Strips MDX imports, JSX tags, code fences, and link/image syntax. */
function proseOf(body: string): string {
	return body
		.replace(/^import\s.+$/gm, '')
		.replace(/```[\s\S]*?```/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#*_>`|-]/g, ' ');
}

export function wordCount(body: string): number {
	return proseOf(body).split(/\s+/).filter(Boolean).length;
}

/** Minutes, rounded up, minimum 1. */
export function readingMinutes(body: string): number {
	return Math.max(1, Math.ceil(wordCount(body) / WORDS_PER_MINUTE));
}
