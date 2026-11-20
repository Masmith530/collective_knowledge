import { useEffect, useState } from 'react';
import { isAvailable, isLessonComplete, setLessonComplete, subscribe } from '../lib/progress';
import './progress.css';

interface Props {
	/** The page's path, used as the progress key. */
	lessonId: string;
}

/**
 * LessonProgress — the end-of-page completion control.
 *
 * A page completes two ways: by passing its lesson's quiz, or by ticking here.
 * Both write the same key, so they stay in sync. The tick exists because not
 * every page has a quiz, and a reader who already knows the material should be
 * able to move on.
 *
 * Navigation to the next page is deliberately NOT here — Starlight's prev/next
 * pagination renders directly below this and would duplicate it.
 */
export default function LessonProgress({ lessonId }: Props) {
	const [done, setDone] = useState(false);
	const [storage, setStorage] = useState(true);

	// Read storage after mount, never during render: the server has none, and a
	// mismatch would make the first client paint disagree with the HTML.
	useEffect(() => {
		setStorage(isAvailable());
		setDone(isLessonComplete(lessonId));
		return subscribe(() => setDone(isLessonComplete(lessonId)));
	}, [lessonId]);

	return (
		<div className={`ck-lp not-content${done ? ' is-done' : ''}`}>
			<label className="ck-lp-check">
				<input
					type="checkbox"
					checked={done}
					onChange={(e) => setLessonComplete(lessonId, e.target.checked)}
				/>
				<span>{done ? 'Complete' : 'Mark complete'}</span>
			</label>

			{!storage && (
				<p className="ck-lp-warn">
					Your browser is blocking local storage, so progress can't be saved.
				</p>
			)}
		</div>
	);
}
