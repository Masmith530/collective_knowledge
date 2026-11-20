import { useEffect, useMemo, useRef, useState } from 'react';
import { cardKey, getDeck, isAvailable, setDeckKnown } from '../lib/progress';
import './flashcards.css';

export interface Card {
	q: string;
	a: string;
}

export interface FlashcardsProps {
	title?: string;
	cards: Card[];
	/** Deck slug, used as the progress key. */
	slug: string;
}

/**
 * Flashcards — a self-graded deck, launched in a modal.
 *
 * Follows the same shape as the quiz (resting card → modal → summary) so the
 * two study tools behave the same way, but it is practice rather than
 * assessment: nothing here completes a lesson, because self-grading is not a
 * score. That is the quiz's job.
 *
 * Cards graded "Again" go to the back of the queue and come round again, which
 * is the whole mechanism — a deck is finished when every card has been got
 * right once, not when you have seen each card once.
 */
export default function Flashcards({ title = 'Flashcards', cards, slug }: FlashcardsProps) {
	const [open, setOpen] = useState(false);
	const [queue, setQueue] = useState<number[]>([]);
	const [flipped, setFlipped] = useState(false);
	const [known, setKnown] = useState<string[]>([]);
	const [againCount, setAgainCount] = useState(0);
	const [mounted, setMounted] = useState(false);
	const [storage, setStorage] = useState(true);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const keys = useMemo(() => cards.map((c) => cardKey(c.q)), [cards]);

	// Read saved progress after mount only — the server has no localStorage.
	useEffect(() => {
		setStorage(isAvailable());
		setKnown(getDeck(slug)?.known ?? []);
		setMounted(true);
	}, [slug]);

	useEffect(() => {
		const dlg = dialogRef.current;
		if (!dlg) return;
		if (open && !dlg.open) dlg.showModal();
		if (!open && dlg.open) dlg.close();
	}, [open]);

	const knownSet = useMemo(() => new Set(known), [known]);
	const knownCount = keys.filter((k) => knownSet.has(k)).length;
	const total = cards.length;

	const current = queue.length > 0 ? queue[0] : undefined;

	/** Starts a session over the given card indexes, shuffled. */
	function begin(indexes: number[]) {
		const shuffled = [...indexes];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		setQueue(shuffled);
		setFlipped(false);
		setAgainCount(0);
		setOpen(true);
	}

	function studyRemaining() {
		const remaining = keys.map((k, i) => (knownSet.has(k) ? -1 : i)).filter((i) => i >= 0);
		begin(remaining.length > 0 ? remaining : keys.map((_, i) => i));
	}

	function gotIt() {
		if (current === undefined) return;
		const next = [...new Set([...known, keys[current]])];
		setKnown(next);
		setDeckKnown(slug, next);
		setQueue((q) => q.slice(1));
		setFlipped(false);
	}

	function again() {
		if (current === undefined) return;
		// Back of the queue, so it returns after everything else.
		setQueue((q) => [...q.slice(1), q[0]]);
		setAgainCount((n) => n + 1);
		setFlipped(false);
	}

	function resetDeckProgress() {
		setKnown([]);
		setDeckKnown(slug, []);
	}

	// Keyboard shortcuts while the modal is open.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (current === undefined) return;
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				setFlipped((f) => !f);
			} else if (flipped && (e.key === '1' || e.key === 'ArrowLeft')) {
				e.preventDefault();
				again();
			} else if (flipped && (e.key === '2' || e.key === 'ArrowRight')) {
				e.preventDefault();
				gotIt();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, flipped, current, known]);

	if (total === 0) {
		return (
			<div className="ck-fc-card not-content">
				<p className="ck-fc-empty">No flashcards for this lesson yet.</p>
			</div>
		);
	}

	const allKnown = knownCount === total;

	return (
		<>
			{/* ─── Resting card ─── */}
			<div className="ck-fc-card not-content">
				<div className="ck-fc-card-main">
					<h2 className="ck-fc-card-title">{title}</h2>
					<p className="ck-fc-card-meta">
						{total} cards · self-graded · nothing is submitted
					</p>
					{mounted && knownCount > 0 && (
						<>
							<div className="ck-fc-mini" role="presentation">
								<span style={{ width: `${(knownCount / total) * 100}%` }} />
							</div>
							<p className={`ck-fc-known${allKnown ? ' is-all' : ''}`}>
								{allKnown ? `All ${total} cards known` : `${knownCount} of ${total} known`}
								{' · '}
								<button type="button" className="ck-fc-linkbtn" onClick={resetDeckProgress}>
									reset
								</button>
							</p>
						</>
					)}
				</div>

				<div className="ck-fc-actions">
					<button type="button" className="ck-btn ck-btn-primary" onClick={studyRemaining}>
						{knownCount > 0 && !allKnown ? 'Continue' : 'Study cards'}
					</button>
					{mounted && knownCount > 0 && (
						<button
							type="button"
							className="ck-btn ck-btn-secondary"
							onClick={() => begin(keys.map((_, i) => i))}
						>
							Study all
						</button>
					)}
				</div>
			</div>

			{/* ─── Modal ─── */}
			<dialog
				ref={dialogRef}
				className="ck-fc-dialog not-content"
				aria-label={title}
				onCancel={(e) => {
					e.preventDefault();
					setOpen(false);
				}}
			>
				<header className="ck-fc-head">
					<div className="ck-fc-head-main">
						<p className="ck-fc-step">
							{queue.length > 0 ? `${queue.length} left in this round` : 'Round complete'}
						</p>
						<div className="ck-fc-bar" role="presentation">
							<span style={{ width: `${(knownCount / total) * 100}%` }} />
						</div>
					</div>
					<button
						type="button"
						className="ck-fc-close"
						onClick={() => setOpen(false)}
						aria-label="Close flashcards"
					>
						✕
					</button>
				</header>

				{current !== undefined ? (
					<>
						<button
							type="button"
							className="ck-fc-face"
							onClick={() => setFlipped((f) => !f)}
							aria-live="polite"
						>
							<span className="ck-fc-side">{flipped ? 'Answer' : 'Question'}</span>
							<span className="ck-fc-text">{flipped ? cards[current].a : cards[current].q}</span>
							{!flipped && <span className="ck-fc-hint">Click, or press Space, to reveal</span>}
						</button>

						<footer className="ck-fc-foot">
							{flipped ? (
								<>
									<button type="button" className="ck-btn ck-btn-secondary" onClick={again}>
										Again
									</button>
									<button type="button" className="ck-btn ck-btn-primary" onClick={gotIt}>
										Got it
									</button>
								</>
							) : (
								<button
									type="button"
									className="ck-btn ck-btn-primary ck-fc-wide"
									onClick={() => setFlipped(true)}
								>
									Reveal answer
								</button>
							)}
						</footer>
					</>
				) : (
					<div className="ck-fc-done">
						<p className="ck-fc-done-n">{knownCount} / {total}</p>
						<p className="ck-fc-done-label">
							{allKnown ? 'Every card in this deck is known.' : 'Round complete.'}
						</p>
						{againCount > 0 && (
							<p className="ck-fc-done-note">
								{againCount} card{againCount === 1 ? '' : 's'} came round again before sticking.
							</p>
						)}
						<footer className="ck-fc-foot">
							<button
								type="button"
								className="ck-btn ck-btn-secondary"
								onClick={() => begin(keys.map((_, i) => i))}
							>
								Study all again
							</button>
							<button type="button" className="ck-btn ck-btn-primary" onClick={() => setOpen(false)}>
								Done
							</button>
						</footer>
					</div>
				)}

				{!storage && (
					<p className="ck-fc-warn">
						Local storage is blocked, so which cards you know won't be remembered.
					</p>
				)}
			</dialog>
		</>
	);
}
