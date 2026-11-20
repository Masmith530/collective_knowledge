/**
 * Progress tracking.
 *
 * Stored in the browser's localStorage and nowhere else. That is a deliberate
 * consequence of the project's no-accounts, no-server, zero-cost constraint:
 * there is no backend to save to, so progress is per-browser and per-device and
 * does not sync. The UI says so plainly rather than pretending otherwise.
 *
 * Every access is wrapped: localStorage throws in some private-browsing modes
 * and can be disabled entirely, and a reader with it turned off should still
 * get a fully working site, just without saved progress.
 */

const KEY = 'ck-progress-v1';

/** Fraction of questions needed to pass a quiz and auto-complete the lesson. */
export const PASS_THRESHOLD = 0.8;

export interface QuizResult {
	score: number;
	total: number;
	passed: boolean;
	/** ISO timestamp of the attempt. */
	at: string;
}

export interface DeckProgress {
	/**
	 * Keys of the cards marked known.
	 *
	 * Keys are derived from the question text, not the card's index, so
	 * reordering or inserting cards in the CSV does not scramble what the reader
	 * has learned. Editing a question's wording does reset that one card, which
	 * is the correct outcome: a reworded card is a different card.
	 */
	known: string[];
	at: string;
}

export interface Progress {
	/** Lesson id (the page's content id) -> completion timestamp. */
	lessons: Record<string, string>;
	/** Quiz slug -> best attempt. */
	quizzes: Record<string, QuizResult>;
	/** Deck slug -> which cards are known. */
	decks: Record<string, DeckProgress>;
}

/**
 * A fresh, fully-owned empty progress object.
 *
 * This is a factory rather than a shared constant on purpose: callers mutate
 * what `read()` hands back, and a spread of a shared constant copies only the
 * top level, so the nested `lessons`/`quizzes` objects would be aliased and the
 * first write would permanently pollute the default for the rest of the session.
 */
function empty(): Progress {
	return { lessons: {}, quizzes: {}, decks: {} };
}

/** True when localStorage is actually usable in this browser/context. */
export function isAvailable(): boolean {
	try {
		const probe = '__ck_probe__';
		localStorage.setItem(probe, '1');
		localStorage.removeItem(probe);
		return true;
	} catch {
		return false;
	}
}

export function read(): Progress {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return empty();
		const parsed = JSON.parse(raw) as Partial<Progress>;
		return {
			lessons: parsed.lessons ?? {},
			quizzes: parsed.quizzes ?? {},
			// Absent in progress saved before decks existed.
			decks: parsed.decks ?? {},
		};
	} catch {
		return empty();
	}
}

function write(p: Progress): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(p));
	} catch {
		// Storage unavailable or full — progress simply is not saved. Nothing
		// else in the UI depends on this succeeding.
	}
	// Let every mounted island and the sidebar react to the change.
	try {
		window.dispatchEvent(new CustomEvent('ck:progress', { detail: p }));
	} catch {
		/* no window (SSR) */
	}
}

export function isLessonComplete(lessonId: string): boolean {
	return Boolean(read().lessons[lessonId]);
}

export function setLessonComplete(lessonId: string, complete: boolean): Progress {
	const p = read();
	if (complete) {
		p.lessons[lessonId] = new Date().toISOString();
	} else {
		delete p.lessons[lessonId];
	}
	write(p);
	return p;
}

export function getQuizResult(slug: string): QuizResult | undefined {
	return read().quizzes[slug];
}

/**
 * Records an attempt, keeping it only if it beats the stored one, and completes
 * the associated lesson when the attempt passes.
 */
export function recordQuizResult(
	slug: string,
	lessonId: string | undefined,
	score: number,
	total: number,
): QuizResult {
	const passed = total > 0 && score / total >= PASS_THRESHOLD;
	const result: QuizResult = { score, total, passed, at: new Date().toISOString() };

	const p = read();
	const prev = p.quizzes[slug];
	// Keep the better attempt so a practice retake can't lower a pass.
	if (!prev || score > prev.score) {
		p.quizzes[slug] = result;
	}
	if (passed && lessonId) {
		p.lessons[lessonId] = p.lessons[lessonId] ?? new Date().toISOString();
	}
	write(p);

	return result;
}

/**
 * A stable key for a flashcard, derived from its question text.
 *
 * djb2 over the normalised question. Short, deterministic, and good enough:
 * a collision would mark one extra card known, not corrupt anything.
 */
export function cardKey(question: string): string {
	const text = question.trim().replace(/\s+/g, ' ').toLowerCase();
	let hash = 5381;
	for (let i = 0; i < text.length; i++) {
		hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
	}
	return (hash >>> 0).toString(36);
}

export function getDeck(slug: string): DeckProgress | undefined {
	return read().decks[slug];
}

/** Replaces the known-card set for a deck. */
export function setDeckKnown(slug: string, known: string[]): void {
	const p = read();
	if (known.length === 0) {
		delete p.decks[slug];
	} else {
		// De-duplicate so repeated passes cannot inflate the count.
		p.decks[slug] = { known: [...new Set(known)], at: new Date().toISOString() };
	}
	write(p);
}

export function resetDeck(slug: string): void {
	setDeckKnown(slug, []);
}

export function resetAll(): void {
	try {
		localStorage.removeItem(KEY);
	} catch {
		/* ignore */
	}
	try {
		window.dispatchEvent(new CustomEvent('ck:progress', { detail: empty() }));
	} catch {
		/* ignore */
	}
}

/** Subscribes to progress changes, including changes made in another tab. */
export function subscribe(fn: (p: Progress) => void): () => void {
	const onCustom = () => fn(read());
	const onStorage = (e: StorageEvent) => {
		if (e.key === KEY || e.key === null) fn(read());
	};
	window.addEventListener('ck:progress', onCustom);
	window.addEventListener('storage', onStorage);
	return () => {
		window.removeEventListener('ck:progress', onCustom);
		window.removeEventListener('storage', onStorage);
	};
}
