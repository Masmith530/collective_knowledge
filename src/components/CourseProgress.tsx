import { useEffect, useState } from 'react';
import { read, resetAll, subscribe } from '../lib/progress';
import './progress.css';

interface Props {
	/** Every lesson path in the course, in order. */
	lessonIds: string[];
}

/**
 * CourseProgress — how far through the course this browser is.
 *
 * Progress lives in localStorage, so it is per-browser and does not sync across
 * devices. That is stated in the UI rather than hidden, because a reader who
 * switches laptops and finds an empty progress bar deserves to know why.
 */
export default function CourseProgress({ lessonIds }: Props) {
	const [doneIds, setDoneIds] = useState<string[]>([]);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const sync = () => {
			const p = read();
			setDoneIds(lessonIds.filter((id) => p.lessons[id]));
		};
		sync();
		setMounted(true);
		return subscribe(sync);
	}, [lessonIds]);

	const total = lessonIds.length;
	const done = doneIds.length;
	const pct = total === 0 ? 0 : Math.round((done / total) * 100);

	// Render a neutral shell until mounted so the server HTML and the first
	// client paint agree.
	if (!mounted) {
		return <div className="ck-cp not-content" aria-hidden="true" />;
	}

	return (
		<div className="ck-cp not-content">
			<div className="ck-cp-row">
				<p className="ck-cp-label">
					<strong>
						{done} of {total}
					</strong>{' '}
					lessons complete
				</p>
				{done > 0 && (
					<button
						type="button"
						className="ck-cp-reset"
						onClick={() => {
							if (confirm('Clear your saved progress for every course?')) resetAll();
						}}
					>
						Reset
					</button>
				)}
			</div>
			<div
				className="ck-cp-bar"
				role="progressbar"
				aria-valuenow={pct}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Course progress"
			>
				<span style={{ width: `${pct}%` }} />
			</div>
			<p className="ck-cp-note">Saved in this browser only — it won't follow you to another device.</p>
		</div>
	);
}
