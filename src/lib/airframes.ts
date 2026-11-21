/**
 * Airframes — the aircraft a subject article can be specific to.
 *
 * Reference articles divide into two kinds, and the division is real rather
 * than tidy-minded: how a swashplate turns control inputs into blade pitch is
 * true of every helicopter with one, while how *this* aircraft's governor
 * behaves, what its RPM limits are and which safety notices apply to it are
 * true of exactly one. Mixing them in a flat list makes a reader guess which
 * they are reading, which is the worst possible outcome for material someone
 * may act on.
 *
 * So an article may name an `airframe`, and the subject areas group by it:
 * Aircraft Systems → Robinson R22 → Flight Controls. Articles that name none
 * are general and come first, because they are what the airframe-specific ones
 * build on.
 *
 * Listed explicitly, like `courses.ts` and `subjects.ts`, so the order is
 * editorial and an airframe can be named before it has articles. A group with
 * no articles is not rendered.
 */
export interface Airframe {
	/** Matches `topic.airframe` in article frontmatter. */
	slug: string;
	/** Full name, used as the group heading. */
	label: string;
	/** Short form for tight spaces, e.g. a badge. */
	short: string;
}

export const AIRFRAMES: Airframe[] = [
	{ slug: 'r22', label: 'Robinson R22', short: 'R22' },
	{ slug: 'r44', label: 'Robinson R44', short: 'R44' },
];

/**
 * The group an article with no `airframe` belongs to.
 *
 * Not an airframe, so it is not in the list above — but it needs a slug and a
 * label for the same grouping code to handle it, and it must sort first.
 */
export const GENERAL_GROUP = { slug: 'general', label: 'General', short: 'General' } as const;

export function airframeLabel(slug: string | undefined): string {
	if (!slug) return GENERAL_GROUP.label;
	return AIRFRAMES.find((a) => a.slug === slug)?.label ?? slug.toUpperCase();
}
