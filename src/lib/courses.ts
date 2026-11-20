/**
 * The course catalog.
 *
 * Listed explicitly rather than inferred from directories so a course can be
 * shown as planned before it has any lessons, and so the order on the home page
 * is the order a pilot actually progresses through the ratings.
 */
export interface Course {
	/** Matches `lesson.course` in lesson frontmatter. */
	slug: string;
	title: string;
	/** One line. What the course gets you. */
	blurb: string;
	href: string;
	status: 'open' | 'planned';
}

export const COURSES: Course[] = [
	{
		slug: 'private-helicopter',
		title: 'Private Pilot — Helicopter',
		blurb: 'Fly a helicopter for your own purposes. The starting point for every other rating.',
		href: '/curriculum/private-helicopter/',
		status: 'open',
	},
	{
		slug: 'instrument-helicopter',
		title: 'Instrument — Helicopter',
		blurb: 'Fly on instruments, in the IFR system, without outside visual reference.',
		href: '/curriculum/instrument-helicopter/',
		status: 'planned',
	},
	{
		slug: 'commercial-helicopter',
		title: 'Commercial — Helicopter',
		blurb: 'Fly for hire. Precision, judgment, and the regulations that come with being paid.',
		href: '/curriculum/commercial-helicopter/',
		status: 'planned',
	},
	{
		slug: 'cfi-helicopter',
		title: 'Flight Instructor — Helicopter',
		blurb: 'Teach it. Fundamentals of instructing, plus every maneuver from the right seat.',
		href: '/curriculum/cfi-helicopter/',
		status: 'planned',
	},
];
