'use client';
import PlayIcon from '@/components/PlayIcon';
import Spinner from '@/components/Spin';
import { Value } from '@/util/countdownClosest';
import { isValidNumber, isValidTarget } from '@/util/validateNumber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<Value[]>();
	const [timeTaken, setTimeTaken] = useState<number>();

	const targetRef = useRef<HTMLInputElement>(null);
	const [target, setTarget] = useState<string>('');

	const numbersRefs = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	];
	const numbersStates = [
		useState(''),
		useState(''),
		useState(''),
		useState(''),
		useState(''),
		useState(''),
	];

	const workerRef = useRef<Worker>();
	useEffect(() => {
		workerRef.current = new Worker(new URL('../util/countdownWorker.ts', import.meta.url));
		workerRef.current.onmessage = (
			event: MessageEvent<{ results: Value[]; timeTaken: number }>
		) => {
			setLoading(false);
			setResults(event.data.results);
			setTimeTaken(event.data.timeTaken);
		};
		workerRef.current.onerror = (error) => {
			setLoading(false);
			console.error(error);
		};

		return () => {
			workerRef.current?.terminate();
		};
	}, []);

	const runWorker = () => {
		setLoading(true);
		workerRef.current?.postMessage({
			target: Number(target),
			numbers: numbersStates.map(([value]) => Number(value)),
		});
	};

	const bestResult = useMemo(() => {
		if (!results) return undefined;

		let minDist = Number.MAX_SAFE_INTEGER;
		const sorted = results.sort((a, b) => a.used.length - b.used.length);
		for (let i = 0; i < sorted.length; i++) {
			const dist = Math.abs(sorted[i].value - Number(target));
			if (dist < minDist) {
				minDist = dist;
			}
		}

		return sorted.find(({ value }) => Math.abs(value - Number(target)) === minDist)!;
	}, [results]);

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<h1 className="uppercase text-5xl font-semibold tracking-wider text-center mb-12">
				Countdown
				<br />
				Combinator
			</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					runWorker();
				}}
				className="flex flex-col items-center gap-8"
			>
				<div className="flex flex-col gap-2 items-center">
					<label className="font-medium">Target</label>
					<input
						ref={targetRef}
						className={twMerge(
							'text-black font-medium p-2 rounded-lg shadow-inner bg-white text-center w-32',
							'border-2 border-transparent transition duration-300',
							target.length > 0 && !isValidTarget(target) && 'border-orange-500'
						)}
						value={target}
						onKeyDown={(event) => {
							if (event.code === 'Space') {
								event.preventDefault();
								const nextRef = event.shiftKey
									? numbersRefs[numbersRefs.length - 1]
									: numbersRefs[0];
								nextRef.current?.focus();
								nextRef.current?.select();
							}
						}}
						onChange={(event) => setTarget(event.target.value.replace(/[^\d]/g, ''))}
					/>
				</div>
				<div className="flex flex-col gap-2 items-center">
					<label className="font-medium">Numbers</label>
					<div className="flex gap-2">
						{numbersRefs.map((ref, index) => {
							const [state, setState] = numbersStates[index];
							return (
								<input
									key={index}
									ref={ref}
									className={twMerge(
										'text-black font-medium p-2 rounded-lg shadow-inner bg-white text-center w-14',
										'border-2 border-transparent transition duration-300',
										state.length > 0 && !isValidNumber(state) && 'border-orange-500'
									)}
									value={state}
									onChange={(event) =>
										setState(event.target.value.replace(/[^\d]/g, '').slice(0, 3))
									}
									onKeyDown={(event) => {
										if (event.code === 'Space') {
											event.preventDefault();
											const nextRef = numbersRefs[index + (event.shiftKey ? -1 : 1)] ?? targetRef;
											nextRef.current?.focus();
											nextRef.current?.select();
										}
									}}
								/>
							);
						})}
					</div>
				</div>

				<button
					className="px-4 py-3 rounded-lg transition hover:bg-black/5 text-center w-32 font-medium uppercase inline-flex items-center"
					type="submit"
				>
					<span className="grow text-center">{loading ? 'Loading' : 'Run'}</span>

					{loading ? <Spinner className="text-lg" /> : <PlayIcon className="text-xl opacity-90" />}
				</button>
			</form>

			{bestResult && (
				<div className="flex flex-col mt-12">
					<p>
						Got: {bestResult.value}{' '}
						{bestResult.value !== Number(target) &&
							`(${Math.abs(bestResult.value - Number(target))} away)`}
					</p>
					<p>Way: {bestResult.way}</p>
					<p>In: {timeTaken}ms</p>
					<p>Ways: {results?.filter(({ value }) => bestResult.value === value).length}</p>
				</div>
			)}
		</main>
	);
}
