/**
 * Course outline: the one place that turns lesson frontmatter into the
 * week → lesson → part structure the sidebar and the course page both render.
 *
 * Shared deliberately. When the sidebar and the course contents each built this
 * themselves they could disagree about grouping, which is the sort of bug nobody
 * notices until a lesson appears in the wrong week in one of the two places.
 */
import { getCollection } from 'astro:content';

export const KIND_LABEL = { ground: 'Ground', flight: 'Flight', sim: 'Sim' } as const;

export type LessonKind = keyof typeof KIND_LABEL;

/**
 * A lesson's display name, e.g. "Ground 2".
 *
 * Note what this is *not*: an earlier version showed "L2 (G2)", a composite of
 * an overall lesson number and a per-kind number. It was meaningless to readers
 * and the overall number is now gone entirely — a lesson is identified by its
 * kind and its number within that kind, which is how instructors actually refer
 * to them.
 */
export function lessonLabel(kind: LessonKind, kindNumber: number): string {
	return `${KIND_LABEL[kind]} ${kindNumber}`;
}

export interface OutlinePart {
	part: number;
	title: string;
	href: string;
}

export interface OutlineLesson {
	/** Unique within a course: kind + number, e.g. `ground-2`. */
	key: string;
	kind: LessonKind;
	kindNumber: number;
	/** "Ground 2" */
	label: string;
	/** The lesson's title (umbrella title when it has parts). */
	title: string;
	description?: string;
	duration?: string;
	/**
	 * Where the lesson link goes, in order of preference: its overview page, its
	 * first part, or (for a single-page lesson) itself.
	 */
	href: string;
	/**
	 * The split lesson's landing page, when it has one.
	 *
	 * Separate from `pageIds` on purpose: an overview is navigation, not a
	 * sitting, so it must not count towards progress. The sidebar still needs to
	 * know about it to recognise "you are inside this lesson".
	 */
	overviewHref?: string;
	parts: OutlinePart[];
	/**
	 * Every *completable* page in this lesson — its parts, or itself when it has
	 * none. This is the progress denominator, which is why the overview page is
	 * not in it.
	 */
	pageIds: string[];
}

export interface OutlineWeek {
	week: number;
	lessons: OutlineLesson[];
}

/** Builds the week → lesson → part outline for one course. */
export async function getCourseOutline(course: string): Promise<OutlineWeek[]> {
	const pages = (await getCollection('docs', ({ data }) => data.lesson?.course === course)).sort(
		(a, b) => {
			const x = a.data.lesson!;
			const y = b.data.lesson!;
			return (
				x.week - y.week ||
				x.order - y.order ||
				x.kindNumber - y.kindNumber ||
				(x.part ?? 0) - (y.part ?? 0)
			);
		},
	);

	const weeks: OutlineWeek[] = [];

	for (const entry of pages) {
		const l = entry.data.lesson!;
		const href = `/${entry.id}/`;

		let week = weeks.find((w) => w.week === l.week);
		if (!week) {
			week = { week: l.week, lessons: [] };
			weeks.push(week);
		}

		const key = `${l.kind}-${l.kindNumber}`;
		let lesson = week.lessons.find((x) => x.key === key);
		if (!lesson) {
			lesson = {
				key,
				kind: l.kind,
				kindNumber: l.kindNumber,
				label: lessonLabel(l.kind, l.kindNumber),
				title: l.lessonTitle ?? entry.data.title,
				description: l.part ? undefined : entry.data.description,
				duration: l.duration,
				href,
				parts: [],
				pageIds: [],
			};
			week.lessons.push(lesson);
		}

		if (l.overview) {
			// Navigation, not a sitting: it is where the lesson link lands, but it
			// is not a page anyone completes, so it stays out of `pageIds`.
			lesson.overviewHref = href;
			lesson.description = entry.data.description ?? lesson.description;
			lesson.duration = l.duration ?? lesson.duration;
			continue;
		}

		lesson.pageIds.push(href);

		if (l.part) {
			lesson.parts.push({ part: l.part, title: entry.data.title, href });
			lesson.parts.sort((a, b) => a.part - b.part);
			// Keep the umbrella description if any part supplied one.
			lesson.duration = lesson.duration ?? l.duration;
		}
	}

	/*
	 * Resolve each lesson's link last, rather than as pages arrive. Doing it in
	 * the loop meant whichever page happened to come last won, and an overview
	 * page has no `part` to sort it reliably ahead of part 1.
	 */
	for (const week of weeks) {
		for (const lesson of week.lessons) {
			lesson.href = lesson.overviewHref ?? lesson.parts[0]?.href ?? lesson.href;
		}
	}

	return weeks;
}

/** Flat list of every page id in a course, in reading order. */
export function allPageIds(weeks: OutlineWeek[]): string[] {
	return weeks.flatMap((w) => w.lessons.flatMap((l) => l.pageIds));
}
