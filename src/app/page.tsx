'use client';
import PlayIcon from '@/components/PlayIcon';
import useRotatingPlaceholders from '@/util/useRotatingPlaceholders';
import useFocusState from '@/util/useFocusState';
import { isValidNumber, isValidTarget } from '@/util/validateNumber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '@/components/Button';
import { CountdownClosestResult, Value } from '@/util/types';
import doesPreferReducedMotion from '@/util/doesPreferReducedMotion';

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<CountdownClosestResult>();
	const [placeholdesArePaused, setPlaceholdersArePaused] = useState(doesPreferReducedMotion());

	const targetRef = useRef<HTMLInputElement>(null);
	const [target, setTarget] = useState<string>('');
	const [targetIsFocused, targetFocusProps] = useFocusState(targetRef);

	const numbersRefs = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	];
	const numberStates = [
		useState(''),
		useState(''),
		useState(''),
		useState(''),
		useState(''),
		useState(''),
	];
	const numberFocusStates = numbersRefs.map((ref) => useFocusState(ref));

	const anyFocused = useMemo(
		() => targetIsFocused || numberFocusStates.some(([isFocused]) => isFocused),
		[targetIsFocused, numberFocusStates]
	);

	const anyHasValue = useMemo(
		() => Boolean(target) || numberStates.some(([state]) => state),
		[target, numberStates]
	);

	const { targetPlaceholder, numberPlaceholders } = useRotatingPlaceholders(
		!placeholdesArePaused && !anyFocused && !anyHasValue
	);

	const workerRef = useRef<Worker>();
	useEffect(() => {
		workerRef.current = new Worker(new URL('../util/countdownWorker.ts', import.meta.url));
		workerRef.current.onmessage = (event: MessageEvent<CountdownClosestResult>) => {
			setLoading(false);
			setResult(event.data);
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
			numbers: numberStates.map(([value]) => Number(value)),
		});
	};

	const bestResult = useMemo(() => {
		if (!result) return undefined;

		let minDist = Number.MAX_SAFE_INTEGER;
		const sorted = result.results.sort((a, b) => a.used.length - b.used.length);
		for (let i = 0; i < sorted.length; i++) {
			const dist = Math.abs(sorted[i].value - Number(target));
			if (dist < minDist) {
				minDist = dist;
			}
		}

		return sorted.find(({ value }) => Math.abs(value - Number(target)) === minDist)!;
	}, [result]);

	return (
		<main className="flex min-h-screen flex-col items-center p-24 relative">
			<h1 className="uppercase text-5xl font-semibold tracking-wider text-center mb-12">
				Countdown
				<br />
				Combinator
			</h1>

			<div className="absolute top-0 right-0 m-3 opacity-90">
				<label className="flex gap-1 items-center leading-none">
					<span className="text-sm">Placeholders</span>
					<button
						className="border border-white disabled:border-gray-300 disabled:text-gray-300 rounded flex items-center justify-center w-5 h-5 text-xs"
						disabled={anyHasValue}
						onClick={() => setPlaceholdersArePaused((paused) => !paused)}
					>
						{placeholdesArePaused ? '⏵' : '⏸'}
					</button>
				</label>
			</div>

			<div className="flex flex-col items-center gap-8">
				<div className="flex flex-col gap-2 items-center">
					<label className="font-medium">Target</label>
					<input
						ref={targetRef}
						className={twMerge(
							'text-black font-medium p-2 rounded-lg shadow-inner bg-white text-center w-32',
							'border-2 border-transparent transition duration-300',
							target.length > 0 && !isValidTarget(target) && 'border-orange-500'
						)}
						placeholder={targetIsFocused ? undefined : targetPlaceholder}
						value={target}
						onChange={(event) => setTarget(event.target.value.replace(/[^\d]/g, ''))}
						{...targetFocusProps}
						onKeyDown={(event) => {
							if (event.code === 'Space') {
								event.preventDefault();
								const nextRef = event.shiftKey
									? numbersRefs[numbersRefs.length - 1]
									: numbersRefs[0];
								nextRef.current?.focus();
								nextRef.current?.select();
							}
							if (event.code === 'Enter') {
								event.preventDefault();
								runWorker();
							}
						}}
					/>
				</div>
				<div className="flex flex-col gap-2 items-center">
					<label className="font-medium">Numbers</label>
					<div className="flex gap-2">
						{numbersRefs.map((ref, index) => {
							const [state, setState] = numberStates[index];
							const [isFocused, focusProps] = numberFocusStates[index];
							return (
								<input
									key={index}
									ref={ref}
									className={twMerge(
										'text-black font-medium p-2 rounded-lg shadow-inner bg-white text-center w-14',
										'border-2 border-transparent transition duration-300',
										state.length > 0 && !isValidNumber(state) && 'border-orange-500'
									)}
									placeholder={isFocused ? undefined : numberPlaceholders[index]}
									value={state}
									onChange={(event) =>
										setState(event.target.value.replace(/[^\d]/g, '').slice(0, 3))
									}
									{...focusProps}
									onKeyDown={(event) => {
										if (event.code === 'Space') {
											event.preventDefault();
											const nextRef = numbersRefs[index + (event.shiftKey ? -1 : 1)] ?? targetRef;
											nextRef.current?.focus();
											nextRef.current?.select();
										}
										if (event.code === 'Enter') {
											event.preventDefault();
											runWorker();
										}
									}}
								/>
							);
						})}
					</div>
				</div>

				<Button
					loading={loading}
					onClick={runWorker}
					className={twMerge('w-28 font-medium uppercase')}
				>
					<span className="ml-1">Run</span>
					<PlayIcon className="text-xl" />
				</Button>
			</div>

			{bestResult && (
				<div className="flex flex-col mt-12">
					<p>
						Got: {bestResult.value}{' '}
						{bestResult.value !== Number(target) &&
							`(${Math.abs(bestResult.value - result!.target)} away)`}
					</p>
					<p>Way: {bestResult.way}</p>
					<p>In: {result?.timeTaken}ms</p>
					<p>Ways: {result?.results.filter(({ value }) => bestResult.value === value).length}</p>
				</div>
			)}
		</main>
	);
}
