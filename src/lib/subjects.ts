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

/*
 * ─── Outline ──────────────────────────────────────────────
 *
 * The one place that turns topic frontmatter into the
 * area → airframe group → article → part structure. The subject index and the
 * sidebar both read it, for the same reason `getCourseOutline()` exists: when
 * two places each built the grouping themselves they could disagree, and an
 * article showing up under the wrong airframe is exactly the kind of error a
 * reader acts on.
 */
import { getCollection } from 'astro:content';
import { AIRFRAMES, GENERAL_GROUP, airframeLabel } from './airframes';

export interface OutlineArticlePart {
	part: number;
	title: string;
	href: string;
}

export interface OutlineArticle {
	/** Unique within a group: the `article` slug, or the page id when single. */
	key: string;
	title: string;
	description?: string;
	/** Where the article link goes: its overview, its first part, or itself. */
	href: string;
	/** The split article's landing page, when it has one. */
	overviewHref?: string;
	parts: OutlineArticlePart[];
	/** Pages that can be marked read. Excludes the overview, which is navigation. */
	pageIds: string[];
}

export interface OutlineGroup {
	/** An airframe slug, or `general`. */
	slug: string;
	label: string;
	/** True for the general group, which is not an airframe. */
	general: boolean;
	articles: OutlineArticle[];
}

export interface OutlineArea {
	slug: string;
	label: string;
	blurb: string;
	groups: OutlineGroup[];
}

/** Group ordering: general first, then airframes in registry order. */
function groupRank(slug: string): number {
	if (slug === GENERAL_GROUP.slug) return -1;
	const i = AIRFRAMES.findIndex((a) => a.slug === slug);
	return i === -1 ? AIRFRAMES.length : i;
}

/** Builds the area → group → article → part outline for every subject area. */
export async function getSubjectOutline(): Promise<OutlineArea[]> {
	const pages = (await getCollection('docs', ({ data }) => Boolean(data.topic))).sort(
		(a, b) => {
			const x = a.data.topic!;
			const y = b.data.topic!;
			return x.order - y.order || (x.part ?? 0) - (y.part ?? 0);
		},
	);

	const areas: OutlineArea[] = SUBJECT_AREAS.map((area) => ({ ...area, groups: [] }));

	for (const entry of pages) {
		const t = entry.data.topic!;
		const area = areas.find((a) => a.slug === t.category);
		// An article naming a category that does not exist is a typo, not a new
		// area — areas are listed deliberately in SUBJECT_AREAS.
		if (!area) continue;

		const href = `/${entry.id}/`;
		const groupSlug = t.airframe ?? GENERAL_GROUP.slug;

		let group = area.groups.find((g) => g.slug === groupSlug);
		if (!group) {
			group = {
				slug: groupSlug,
				label: airframeLabel(t.airframe),
				general: groupSlug === GENERAL_GROUP.slug,
				articles: [],
			};
			area.groups.push(group);
		}

		const key = t.article ?? entry.id;
		let article = group.articles.find((a) => a.key === key);
		if (!article) {
			article = {
				key,
				title: t.articleTitle ?? entry.data.title,
				description: t.part ? undefined : entry.data.description,
				href,
				parts: [],
				pageIds: [],
			};
			group.articles.push(article);
		}

		if (t.overview) {
			// Navigation, not a page anyone reads through — so it is where the
			// article link lands but it stays out of `pageIds`.
			article.overviewHref = href;
			article.title = entry.data.title;
			article.description = entry.data.description ?? article.description;
			continue;
		}

		article.pageIds.push(href);

		if (t.part) {
			article.parts.push({ part: t.part, title: entry.data.title, href });
			article.parts.sort((a, b) => a.part - b.part);
		}
	}

	// Resolve links and ordering once everything has arrived, rather than as
	// pages come in: an overview page has no `part` to sort it ahead of part 1.
	for (const area of areas) {
		area.groups.sort((a, b) => groupRank(a.slug) - groupRank(b.slug));
		for (const group of area.groups) {
			for (const article of group.articles) {
				article.href = article.overviewHref ?? article.parts[0]?.href ?? article.href;
			}
		}
	}

	return areas.filter((a) => a.groups.length > 0);
}
