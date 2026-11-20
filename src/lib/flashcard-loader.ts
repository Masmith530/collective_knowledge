/**
 * Content-layer loader for flashcard decks authored as CSV.
 *
 * Astro's built-in `glob()` loader handles Markdown, JSON and YAML but not CSV.
 * CSV is kept as the authoring format anyway: a deck is 80+ rows of two short
 * fields, which is pleasant in a spreadsheet and miserable in YAML, and the
 * person writing them works in a spreadsheet already.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, posix, sep } from 'node:path';
import type { Loader } from 'astro/loaders';
import { parseFlashcardCsv } from './csv';

interface Options {
	/** Directory to scan, relative to the project root. */
	base: string;
}

/** Recursively lists every `.csv` under `dir`, as paths relative to it. */
function findCsv(dir: string, prefix = ''): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) continue;
		const rel = prefix ? `${prefix}${sep}${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			out.push(...findCsv(join(dir, entry.name), rel));
		} else if (entry.name.toLowerCase().endsWith('.csv')) {
			out.push(rel);
		}
	}
	return out;
}

export function flashcardLoader({ base }: Options): Loader {
	return {
		name: 'flashcard-csv',
		load: async ({ store, parseData, generateDigest, logger, watcher }) => {
			if (!existsSync(base)) {
				logger.warn(`flashcard-csv: ${base} does not exist — no decks loaded.`);
				return;
			}

			store.clear();

			const files = findCsv(base);
			for (const rel of files) {
				const abs = join(base, rel);
				// Re-run the loader when a deck changes during `astro dev`.
				watcher?.add(abs);

				// Entry id is the path without its extension, always posix-style so
				// ids match on Windows too: `private-helicopter/ground-2`.
				const id = rel.split(sep).join(posix.sep).replace(/\.csv$/i, '');

				let cards;
				try {
					cards = parseFlashcardCsv(readFileSync(abs, 'utf8'));
				} catch (err) {
					throw new Error(
						`flashcard-csv: failed to parse ${abs}: ${err instanceof Error ? err.message : err}`,
					);
				}

				const data = await parseData({ id, data: { cards } });
				store.set({ id, data, digest: generateDigest(data) });
			}

			logger.info(`flashcard-csv: loaded ${files.length} deck(s)`);
		},
	};
}
