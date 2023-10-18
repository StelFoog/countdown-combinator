'use client';
import PlayIcon from '@/components/PlayIcon';
import useRotatingPlaceholders from '@/util/useRotatingPlaceholders';
import useFocusState from '@/util/useFocusState';
import { isValidNumber, isValidTarget } from '@/util/validateNumber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '@/components/Button';
import { CountdownClosestResult } from '@/util/types';
import doesPreferReducedMotion from '@/util/doesPreferReducedMotion';
import ClearIcon from '@/components/ClearIcon';
import Results from './Results';
import SendIcon from '@/components/SendIcon';

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

	function runWorker() {
		setLoading(true);
		workerRef.current?.postMessage({
			target: Number(target),
			numbers: numberStates.map(([value]) => Number(value)),
		});
	}

	function sendPlaceholdersToValues() {
		setTarget(targetPlaceholder ?? '');
		numberStates.forEach(([, setState], index) => setState(numberPlaceholders[index] ?? ''));
	}

	return (
		<main className="flex min-h-screen flex-col items-center p-24 relative">
			<h1 className="uppercase text-5xl font-semibold tracking-wider text-center mb-12">
				Countdown
				<br />
				Combinator
			</h1>

			<div className="absolute top-0 right-0 m-3 opacity-90">
				<p className="text-sm mb-1">Placeholders</p>
				<div className="flex gap-1 justify-end">
					<button
						className={twMerge(
							'border border-white rounded flex items-center justify-center w-5 h-5 text-xs',
							anyHasValue && 'border-gray-200/90 text-gray-200/90'
						)}
						onClick={() => setPlaceholdersArePaused((paused) => !paused)}
					>
						{placeholdesArePaused ? '⏵' : '⏸'}
					</button>
					<button
						className={twMerge(
							'border border-white rounded flex items-center justify-center w-5 h-5 text-xs'
						)}
						onClick={sendPlaceholdersToValues}
					>
						<SendIcon />
					</button>
				</div>
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

				<div className="flex gap-4">
					<Button
						onClick={() => {
							setTarget('');
							numberStates.forEach(([, setState]) => setState(''));
						}}
						disabled={!anyHasValue}
						className="w-28 px-3.5 font-medium uppercase"
					>
						<span>Clear</span>
						<ClearIcon className="text-xl" />
					</Button>
					<Button onClick={runWorker} loading={loading} className="w-28 font-medium uppercase">
						<span className="ml-1">Run</span>
						<PlayIcon className="text-xl" />
					</Button>
				</div>
			</div>

			<Results results={result} />
		</main>
	);
}
