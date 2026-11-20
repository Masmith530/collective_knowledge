/**
 * A small RFC 4180 CSV parser.
 *
 * Written rather than depended on because flashcard decks are authored in a
 * spreadsheet and exported, which means the parser has to survive the things
 * real exports contain: fields wrapped in quotes, `""` for a literal quote,
 * and — the one a naive `split('\n')` gets wrong — newlines *inside* a quoted
 * field. The Ground 2 deck has both of those, so this is not hypothetical.
 */

/** Parses CSV text into rows of string fields. */
export function parseCsv(text: string): string[][] {
	// Normalise line endings so a Windows export behaves like any other.
	const src = text.replace(/\r\n?/g, '\n');

	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	let i = 0;

	const endField = () => {
		// Only unquoted fields get trimmed: whitespace inside quotes was asked for.
		row.push(quoted ? field : field.trim());
		field = '';
		quoted = false;
	};

	const endRow = () => {
		endField();
		// Skip rows that are entirely empty (trailing newline, blank separator lines).
		if (row.some((f) => f !== '')) rows.push(row);
		row = [];
	};

	while (i < src.length) {
		const ch = src[i];

		if (ch === '"' && field === '' && !quoted) {
			// Opening quote of a quoted field.
			quoted = true;
			i++;
			while (i < src.length) {
				if (src[i] === '"') {
					if (src[i + 1] === '"') {
						field += '"'; // escaped quote
						i += 2;
						continue;
					}
					i++; // closing quote
					break;
				}
				field += src[i++];
			}
			// Anything between the closing quote and the next delimiter is ignored,
			// which is what a tolerant reader should do with a malformed export.
			while (i < src.length && src[i] !== ',' && src[i] !== '\n') i++;
			continue;
		}

		if (ch === ',') {
			endField();
			i++;
			continue;
		}

		if (ch === '\n') {
			endRow();
			i++;
			continue;
		}

		field += ch;
		i++;
	}

	// Flush whatever the file ended on.
	if (field !== '' || row.length > 0) endRow();

	return rows;
}

const HEADER_WORDS = new Set(['question', 'front', 'q', 'term', 'prompt']);

/**
 * Parses a two-column flashcard CSV into `{ q, a }` pairs.
 *
 * A header row is optional and detected rather than required, because a
 * spreadsheet export may or may not have one and getting it wrong silently
 * turns a header into a flashcard.
 */
export function parseFlashcardCsv(text: string): { q: string; a: string }[] {
	const rows = parseCsv(text);
	if (rows.length === 0) return [];

	const start = HEADER_WORDS.has((rows[0][0] ?? '').trim().toLowerCase()) ? 1 : 0;

	return rows.slice(start).map((row, idx) => {
		const [q, a] = row;
		if (!q || !a) {
			throw new Error(
				`Flashcard row ${idx + 1 + start} needs two non-empty columns (question, answer); got ${JSON.stringify(row)}`,
			);
		}
		return { q, a };
	});
}
