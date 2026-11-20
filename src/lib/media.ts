/**
 * Where lesson media (audio recordings) is served from.
 *
 * Audio currently ships in `public/`, which is the simplest thing that works
 * and costs nothing: Cloudflare Pages serves it on the free tier with no extra
 * service. The cost is repository size — git stores binaries without delta
 * compression, so every recording is ~20 MB of permanent history.
 *
 * That is fine for a handful of lessons and bad for fifty. When the repo's
 * media passes roughly **250 MB**, move the files to a Cloudflare R2 bucket
 * (10 GB-month free, zero egress fees) with a custom domain, and set
 * `MEDIA_BASE` to that origin. Nothing else has to change: every lesson's
 * `audio.src` stays a root-relative path and is resolved through `mediaUrl()`.
 *
 * See `docs/media.md`.
 */

/** Origin serving media, without a trailing slash. Empty = this site's own `public/`. */
// Annotated `string` rather than inferred: without it TypeScript narrows the
// constant to the literal '' and the R2 branch below becomes unreachable, which
// is exactly the branch that has to work when this value is changed.
export const MEDIA_BASE: string = '';

/** True while media is served from this repo, so the build can check files exist. */
export const MEDIA_IS_LOCAL = MEDIA_BASE === '';

/** Resolves a root-relative media path against the configured origin. */
export function mediaUrl(src: string): string {
	if (!MEDIA_BASE) return src;
	return `${MEDIA_BASE.replace(/\/+$/, '')}${src.startsWith('/') ? '' : '/'}${src}`;
}
