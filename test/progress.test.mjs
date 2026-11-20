/**
 * Tests for the progress module.
 *
 * Progress is the one piece of real logic on this otherwise-static site, and it
 * is the piece a reader would notice breaking, so it has tests. Run with
 * `npm test`. Node strips the TypeScript types itself, so this needs no build
 * step and no test framework.
 *
 * These caught a genuine aliasing bug: `read()` used to return a shallow spread
 * of a module-level constant, so the first write polluted the empty default for
 * the rest of the session and a reset appeared not to work.
 */
// Minimal localStorage + window shims so the module can run under node.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = { dispatchEvent: () => true };
globalThis.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o?.detail; } };

const P = await import('../src/lib/progress.ts');

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n        got ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`);
  ok ? pass++ : fail++;
};

eq('storage detected as available', P.isAvailable(), true);
eq('starts empty', P.read(), { lessons: {}, quizzes: {}, decks: {} });
eq('lesson not complete initially', P.isLessonComplete('/l1/'), false);

P.setLessonComplete('/l1/', true);
eq('manual completion sticks', P.isLessonComplete('/l1/'), true);
P.setLessonComplete('/l1/', false);
eq('manual un-completion works', P.isLessonComplete('/l1/'), false);

// 5/7 = 71% — below the 80% threshold.
const r1 = P.recordQuizResult('c/l2', '/l2/', 5, 7);
eq('71% does not pass', r1.passed, false);
eq('failing quiz does not complete lesson', P.isLessonComplete('/l2/'), false);

// 6/7 = 86% — passes.
const r2 = P.recordQuizResult('c/l2', '/l2/', 6, 7);
eq('86% passes', r2.passed, true);
eq('passing quiz completes the lesson', P.isLessonComplete('/l2/'), true);
eq('best attempt stored', P.getQuizResult('c/l2').score, 6);

// A worse retake must not overwrite the better stored attempt.
P.recordQuizResult('c/l2', '/l2/', 2, 7);
eq('worse retake keeps best score', P.getQuizResult('c/l2').score, 6);
eq('worse retake keeps lesson complete', P.isLessonComplete('/l2/'), true);

eq('exactly 80% passes (4/5)', P.recordQuizResult('c/l3', '/l3/', 4, 5).passed, true);

// ── flashcard decks ──
eq('deck starts absent', P.getDeck('d1'), undefined);

const k1 = P.cardKey('What is the lateral axis?');
const k2 = P.cardKey('What is the vertical axis?');

P.setDeckKnown('d1', [k1]);
eq('deck records a known card', P.getDeck('d1').known, [k1]);

P.setDeckKnown('d1', [k1, k2, k1]);
eq('deck de-duplicates known cards', P.getDeck('d1').known, [k1, k2]);

// Keys come from the question text, so whitespace and case must not matter...
eq('card key ignores case and whitespace',
   P.cardKey('  What  is the LATERAL axis? '), k1);
// ...but a genuinely different question must be a different card.
eq('card key differs for different questions', P.cardKey('Something else') === k1, false);

P.resetDeck('d1');
eq('resetDeck clears the deck', P.getDeck('d1'), undefined);

P.setDeckKnown('d2', [k1]);
P.resetAll();
eq('reset clears everything', P.read(), { lessons: {}, quizzes: {}, decks: {} });

// With storage throwing, nothing should blow up.
globalThis.localStorage = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
  removeItem: () => { throw new Error('blocked'); },
};
eq('reports unavailable when blocked', P.isAvailable(), false);
eq('read survives blocked storage', P.read(), { lessons: {}, quizzes: {}, decks: {} });
let threw = false;
try {
  P.setLessonComplete('/x/', true);
  P.recordQuizResult('q', '/x/', 1, 1);
  P.setDeckKnown('d', ['a']);
  P.resetDeck('d');
} catch { threw = true; }
eq('writes survive blocked storage', threw, false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
