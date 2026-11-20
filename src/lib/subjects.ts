/**
 * Subject areas — the categories of the reference half of the site.
 *
 * Named "subject areas" rather than "handbook" deliberately: this site cites
 * the FAA *Handbooks* constantly (Helicopter Flying Handbook, PHAK), so calling
 * our own reference section a handbook invited exactly the confusion we least
 * want. "Subject area" is also the language the FAA uses for required knowledge
 * areas, so it is what a student pilot already has a slot for.
 *
 * Listed explicitly so the order is editorial. A category with no articles is
 * not rendered, so this can name areas before they have content.
 */
export interface SubjectArea {
	/** Matches `topic.category` in article frontmatter. */
	slug: string;
	label: string;
	/** One line, shown on the subject areas index. */
	blurb: string;
}

export const SUBJECT_AREAS: SubjectArea[] = [
	{
		slug: 'systems',
		label: 'Aircraft Systems',
		blurb: 'How the machine works, system by system.',
	},
	{
		slug: 'aerodynamics',
		label: 'Aerodynamics',
		blurb: 'Why the rotor does what it does.',
	},
	{
		slug: 'weather',
		label: 'Weather',
		blurb: 'Products, interpretation, and rotorcraft-specific hazards.',
	},
	{
		slug: 'regulations',
		label: 'Regulations',
		blurb: 'The parts and sections that govern what you actually do.',
	},
	{
		slug: 'performance',
		label: 'Performance & Planning',
		blurb: 'Density altitude, weight and balance, and the charts.',
	},
	{
		slug: 'operations',
		label: 'Operations',
		blurb: 'Airport, airspace, and radio procedure in practice.',
	},
];
