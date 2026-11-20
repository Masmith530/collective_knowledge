import { useEffect, useRef, useState } from 'react';
import {
	PASS_THRESHOLD,
	getQuizResult,
	recordQuizResult,
	type QuizResult,
} from '../lib/progress';
import './quiz.css';

export interface QuizChoice {
	text: string;
	correct?: boolean;
}

export interface QuizQuestion {
	q: string;
	choices: QuizChoice[];
	explain?: string;
	reference?: string;
}

export interface QuizProps {
	title?: string;
	questions: QuizQuestion[];
	/** Quiz slug, used as the progress key. */
	slug: string;
	/** Page path of the lesson this quiz completes. */
	lessonId?: string;
}

const LETTERS = 'ABCDEFGH';

/**
 * Quiz — a graded self-check that marks its lesson complete on a pass.
 *
 * The quiz runs in a modal so taking it feels like a distinct act rather than
 * more page to scroll. Answers are NOT revealed as you go: it grades at the end
 * and then shows a full review with explanations, which is both a better test
 * and the only way a score means anything.
 */
export default function Quiz({ title = 'Check Yourself', questions, slug, lessonId }: QuizProps) {
	const [phase, setPhase] = useState<'idle' | 'running' | 'results'>('idle');
	const [current, setCurrent] = useState(0);
	const [answers, setAnswers] = useState<(number | undefined)[]>([]);
	const [best, setBest] = useState<QuizResult | undefined>();
	const [lastResult, setLastResult] = useState<QuizResult | undefined>();
	const dialogRef = useRef<HTMLDialogElement>(null);

	// Read stored progress after mount — never during render, since the server
	// render has no localStorage and must match the first client paint.
	useEffect(() => {
		setBest(getQuizResult(slug));
	}, [slug]);

	const total = questions?.length ?? 0;

	// Drive the native <dialog> from the phase so Esc, backdrop and focus
	// trapping all behave the way the platform already knows how to.
	useEffect(() => {
		const dlg = dialogRef.current;
		if (!dlg) return;
		if (phase === 'idle' && dlg.open) dlg.close();
		if (phase !== 'idle' && !dlg.open) dlg.showModal();
	}, [phase]);

	if (total === 0) {
		return (
			<div className="ck-quiz-card not-content">
				<p className="ck-quiz-empty">No questions have been written for this lesson yet.</p>
			</div>
		);
	}

	function start() {
		setAnswers(new Array(total).fill(undefined));
		setCurrent(0);
		setLastResult(undefined);
		setPhase('running');
	}

	function pick(ci: number) {
		setAnswers((prev) => {
			const next = [...prev];
			next[current] = ci;
			return next;
		});
	}

	function finish(finalAnswers: (number | undefined)[]) {
		const s = finalAnswers.reduce<number>(
			(n, ci, qi) => (ci !== undefined && questions[qi]?.choices[ci]?.correct ? n + 1 : n),
			0,
		);
		const result = recordQuizResult(slug, lessonId, s, total);
		setLastResult(result);
		setBest(getQuizResult(slug));
		setPhase('results');
	}

	function next() {
		if (current + 1 < total) {
			setCurrent(current + 1);
		} else {
			finish(answers);
		}
	}

	const pct = Math.round((PASS_THRESHOLD * 100));

	return (
		<>
			{/* ─── Resting card on the lesson page ─── */}
			<div className="ck-quiz-card not-content">
				<div className="ck-quiz-card-main">
					<h2 className="ck-quiz-card-title">{title}</h2>
					<p className="ck-quiz-card-meta">
						{total} question{total === 1 ? '' : 's'} · {pct}% to pass · marks this lesson complete
					</p>
					{best && (
						<p className={`ck-quiz-best ${best.passed ? 'is-pass' : 'is-fail'}`}>
							{best.passed ? 'Passed' : 'Best attempt'} — {best.score} / {best.total}
						</p>
					)}
				</div>
				<button type="button" className="ck-btn ck-btn-primary" onClick={start}>
					{best ? 'Retake quiz' : 'Start quiz'}
				</button>
			</div>

			{/* ─── Modal ─── */}
			<dialog
				ref={dialogRef}
				className="ck-quiz-dialog not-content"
				onCancel={(e) => {
					e.preventDefault();
					setPhase('idle');
				}}
				aria-label={title}
			>
				{phase === 'running' && (
					<div className="ck-quiz-run">
						<header className="ck-quiz-run-head">
							<div>
								<p className="ck-quiz-run-step">
									Question {current + 1} of {total}
								</p>
								<div className="ck-quiz-bar" role="presentation">
									<span style={{ width: `${((current + 1) / total) * 100}%` }} />
								</div>
							</div>
							<button
								type="button"
								className="ck-quiz-close"
								onClick={() => setPhase('idle')}
								aria-label="Close quiz without finishing"
							>
								✕
							</button>
						</header>

						<p className="ck-quiz-run-q">{questions[current].q}</p>

						<div className="ck-quiz-choices" role="radiogroup" aria-label={questions[current].q}>
							{questions[current].choices.map((choice, ci) => (
								<button
									type="button"
									key={ci}
									role="radio"
									aria-checked={answers[current] === ci}
									className="ck-quiz-choice"
									data-selected={answers[current] === ci ? '' : undefined}
									onClick={() => pick(ci)}
								>
									<span className="ck-quiz-letter" aria-hidden="true">
										{LETTERS[ci] ?? ci + 1}
									</span>
									<span>{choice.text}</span>
								</button>
							))}
						</div>

						<footer className="ck-quiz-run-foot">
							<button
								type="button"
								className="ck-btn ck-btn-secondary"
								onClick={() => setCurrent(Math.max(0, current - 1))}
								disabled={current === 0}
							>
								Back
							</button>
							<button
								type="button"
								className="ck-btn ck-btn-primary"
								onClick={next}
								disabled={answers[current] === undefined}
							>
								{current + 1 === total ? 'Submit' : 'Next'}
							</button>
						</footer>
					</div>
				)}

				{phase === 'results' && lastResult && (
					<div className="ck-quiz-results">
						<header className={`ck-quiz-score ${lastResult.passed ? 'is-pass' : 'is-fail'}`}>
							<p className="ck-quiz-score-n">
								{lastResult.score} / {lastResult.total}
							</p>
							<p className="ck-quiz-score-label">
								{lastResult.passed ? 'Passed — lesson marked complete' : `Not yet — ${pct}% needed to pass`}
							</p>
						</header>

						<h3 className="ck-quiz-review-title">Review</h3>
						<ol className="ck-quiz-review">
							{questions.map((question, qi) => {
								const chosen = answers[qi];
								const right = chosen !== undefined && question.choices[chosen]?.correct;
								const correctIdx = question.choices.findIndex((c) => c.correct);
								return (
									<li key={qi} className="ck-quiz-review-item" data-ok={right ? '' : undefined}>
										<p className="ck-quiz-review-q">
											<span className="ck-quiz-review-mark" aria-hidden="true">
												{right ? '✓' : '✕'}
											</span>
											<span>
												{question.q}
												<span className="sr-only">{right ? ' — you answered correctly' : ' — you answered incorrectly'}</span>
											</span>
										</p>
										{!right && (
											<p className="ck-quiz-review-your">
												You chose:{' '}
												<em>{chosen !== undefined ? question.choices[chosen].text : 'nothing'}</em>
											</p>
										)}
										<p className="ck-quiz-review-ans">
											Correct: <strong>{question.choices[correctIdx]?.text}</strong>
										</p>
										{question.explain && <p className="ck-quiz-review-why">{question.explain}</p>}
										{question.reference && (
											<p className="ck-quiz-review-ref">Reference: {question.reference}</p>
										)}
									</li>
								);
							})}
						</ol>

						<footer className="ck-quiz-run-foot">
							<button type="button" className="ck-btn ck-btn-secondary" onClick={start}>
								Retake
							</button>
							<button type="button" className="ck-btn ck-btn-primary" onClick={() => setPhase('idle')}>
								Done
							</button>
						</footer>
					</div>
				)}
			</dialog>
		</>
	);
}
