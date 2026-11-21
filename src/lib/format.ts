/**
 * Small shared formatters.
 *
 * Here rather than in a component because the course catalog and the subject
 * index both need the same thing — naming what is planned in one readable
 * sentence — and two copies of a list formatter is two copies that can disagree
 * about the serial comma.
 */

/**
 * Join names into a sentence fragment: "A", "A and B", "A, B and C".
 *
 * No serial comma, matching the prose style used across the site.
 */
export function listSentence(items: string[]): string {
	if (items.length === 0) return '';
	if (items.length === 1) return items[0]!;
	return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
