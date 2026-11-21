import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';
import { flashcardLoader } from './lib/flashcard-loader';

/**
 * Lesson metadata.
 *
 * Every page under `curriculum/<course>/` is a lesson and carries this block.
 * It is what makes the curriculum a *sequence* rather than a pile of articles:
 * `number` orders the course, `prerequisites` records what must come first,
 * and `status` lets unfinished lessons ship visibly marked instead of hidden.
 */
const lesson = z.object({
	/** Course slug this lesson belongs to, e.g. `private-helicopter`. */
	course: z.string(),

	/**
	 * Which week of the course this lesson falls in.
	 *
	 * Weeks are the unit students actually plan around ("what am I doing this
	 * week?"), and they are where ground and flight lessons interleave: a week
	 * holds the ground lessons and the maneuver lessons that go with them.
	 */
	week: z.number().int().positive(),

	/** Position within the week. Orders ground and flight lessons against each other. */
	order: z.number().int().nonnegative().default(0),

	/** Whether this is a ground, flight, or simulator lesson. */
	kind: z.enum(['ground', 'flight', 'sim']).default('ground'),

	/**
	 * The lesson's number within its kind, counted across the whole course.
	 * With `kind`, this is the lesson's name: `ground` + `2` renders as
	 * "Ground 2". Pages sharing a kind and kindNumber are parts of one lesson.
	 */
	kindNumber: z.number().int().positive(),

	/**
	 * Which part of a multi-part lesson this page is, 1-based.
	 *
	 * Long lessons are split across pages so each is a single sitting (roughly
	 * 1,000-2,000 words). Parts are grouped under their lesson everywhere.
	 */
	part: z.number().int().positive().optional(),

	/**
	 * Marks this page as a split lesson's landing page rather than one of its
	 * parts: the page a reader arrives at when they pick the lesson.
	 *
	 * Set it with the same `kind` and `kindNumber` as the parts and no `part`.
	 * Everything that links to a lesson — the sidebar row, the course contents —
	 * then points here instead of at part 1, so a reader meets the recording and
	 * the shape of the lesson before being dropped into the middle of it.
	 *
	 * An overview page is not a sitting and carries no prose of its own worth
	 * completing, so it is deliberately left out of `pageIds` and therefore out
	 * of the progress denominator. Only the parts count.
	 *
	 * Single-page lessons do not get one: there is nothing to land in front of.
	 */
	overview: z.boolean().default(false),

	/**
	 * The umbrella lesson title, used as the group heading when the lesson is
	 * split into parts. The page's own `title` is then the part's title.
	 */
	lessonTitle: z.string().optional(),

	/** Authoring state. Drives the status shown to readers. */
	status: z.enum(['stub', 'outline', 'draft', 'review', 'ready']).default('stub'),

	/** Planned contact time, e.g. "2-3 hr ground". */
	duration: z.string().optional(),

	/** What the student should be able to do afterward. */
	objectives: z.array(z.string()).default([]),

	/** Completion standards for the lesson. */
	standards: z.array(z.string()).default([]),

	/** Lessons that should come first, by name, e.g. ['Ground 1']. */
	prerequisites: z.array(z.string()).default([]),

	/** Source documents: FAA handbooks, regulations, POH sections. */
	references: z.array(z.string()).default([]),

	/** Airframes this lesson assumes, if any. Empty = airframe-agnostic. */
	airframes: z.array(z.string()).default([]),

	/** Slug of the quiz entry in the `quizzes` collection, if one exists. */
	quiz: z.string().optional(),

	/** Slug of the deck in the `flashcards` collection, if one exists. */
	flashcards: z.string().optional(),

	/**
	 * A companion audio recording for this lesson — a "podcast" walkthrough.
	 *
	 * `src` is a path under `public/`. Audio only: the recordings are talk, so
	 * video is wasted bytes against Cloudflare Pages' 25 MiB per-file cap.
	 * `LessonAudio.astro` fails the build if the file is missing, so a typo in
	 * this path cannot ship as a silently broken player.
	 */
	audio: z
		.object({
			src: z.string(),
			/** Human-readable length, e.g. "18 min". */
			duration: z.string().optional(),
			/** Shown under the player when the recording covers more than this page. */
			covers: z.string().optional(),
		})
		.optional(),
});

/**
 * Topic metadata — for standalone, full-detail articles in the Handbook.
 *
 * These are the opposite of a lesson: one subject, covered exhaustively, with no
 * assumption about where the reader is in training. Airframe systems are one
 * category of these (R22 drive system, R44 fuel system); aerodynamics, weather,
 * and regulations are others.
 */
const topic = z.object({
	/** Handbook category, e.g. `systems`, `aerodynamics`, `weather`. */
	category: z.string(),
	/**
	 * Set only when the article is specific to one aircraft, e.g. `r22` — it
	 * must match a slug in `src/lib/airframes.ts`.
	 *
	 * This is what puts the article under "Robinson R22" inside its subject
	 * area instead of in the area's general list. Use it when the content is
	 * true of that aircraft and not of helicopters at large: its limits, its
	 * governor behaviour, its safety notices. A swashplate article that happens
	 * to use an R22 as its example is still general.
	 */
	airframe: z.string().optional(),

	/**
	 * Groups the pages of a split article, the way `kind` + `kindNumber` groups
	 * a lesson's parts. Every part and the overview page carry the same value.
	 *
	 * A long reference article is split for the same reason a long lesson is:
	 * so a reader can land on the bit they came for. Omit it on a single-page
	 * article.
	 */
	article: z.string().optional(),

	/** Which part of a split article this page is, 1-based. */
	part: z.number().int().positive().optional(),

	/**
	 * The umbrella article title, used when the article is split into parts.
	 * The page's own `title` is then the part's title.
	 */
	articleTitle: z.string().optional(),

	/**
	 * Marks this page as a split article's landing page rather than one of its
	 * parts — same role as `lesson.overview`. Everything linking to the article
	 * points here. Carries no `part`.
	 */
	overview: z.boolean().default(false),
	/** Reading order within the category. Articles stand alone, but a sensible
	    first-to-last order still helps someone working through a category. */
	order: z.number().int().nonnegative().default(0),
	status: z.enum(['stub', 'outline', 'draft', 'review', 'ready']).default('stub'),
	/** Source documents this article is drawn from. */
	references: z.array(z.string()).default([]),
	/** Curriculum lesson numbers that introduce this subject at a shallower depth. */
	introducedIn: z.array(z.string()).default([]),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				lesson: lesson.optional(),
				topic: topic.optional(),
			}),
		}),
	}),

	/**
	 * Quiz banks, kept out of the lesson prose so the same questions can be
	 * reused in a lesson page, a stage-check review, and a full course exam.
	 */
	quizzes: defineCollection({
		loader: glob({ base: './src/content/quizzes', pattern: '**/*.yaml' }),
		schema: z.object({
			title: z.string(),
			/** Lesson or page this bank belongs to, for cross-referencing. */
			lesson: z.string().optional(),
			questions: z.array(
				z.object({
					q: z.string(),
					/** Answer choices. Exactly one should be marked correct. */
					choices: z.array(z.object({ text: z.string(), correct: z.boolean().default(false) })),
					/** Shown after answering. Explain *why*, and cite the source. */
					explain: z.string().optional(),
					reference: z.string().optional(),
				}),
			),
		}),
	}),

	/**
	 * Flashcard decks, authored as two-column CSV (question, answer) so they can
	 * be written and reordered in a spreadsheet. See `lib/flashcard-loader.ts`.
	 */
	flashcards: defineCollection({
		loader: flashcardLoader({ base: './src/content/flashcards' }),
		schema: z.object({
			cards: z
				.array(
					z.object({
						q: z.string(),
						a: z.string(),
					}),
				)
				.min(1),
		}),
	}),
};
