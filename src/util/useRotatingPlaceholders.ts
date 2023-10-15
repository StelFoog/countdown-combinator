import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { getNumber, randomInt, weightedRandom } from './random';

const CHANGE_TIME_DEFAULT = 2_000;

export default function useRotatingPlaceholders(
	alive: boolean = false,
	changeTime: number = CHANGE_TIME_DEFAULT
) {
	const [targetPlaceholder, setTargetPlaceholder] = useState<string>();
	const numberPlaceholderStates = [
		useState<string>(),
		useState<string>(),
		useState<string>(),
		useState<string>(),
		useState<string>(),
		useState<string>(),
	];
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const aliveRef = useRef(!alive);

	useEffect(() => {
		if (aliveRef.current === alive) return;
		aliveRef.current = alive;
		if (!alive) {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current === null;
			}
		} else {
			if (!targetPlaceholder) setTargetPlaceholder(generateTarget());
			if (numberPlaceholderStates.some(([state]) => !state)) {
				setNumberPlaceholders(numberPlaceholderStates, generateNumbers());
			}
			timeoutRef.current = setTimeout(updatePlaceholders, changeTime);
		}
	}, [alive]);

	function updatePlaceholders() {
		if (!aliveRef.current) return;

		const target = generateTarget();
		const numbers = generateNumbers();
		setTargetPlaceholder(target);
		setNumberPlaceholders(numberPlaceholderStates, numbers);

		timeoutRef.current = setTimeout(updatePlaceholders, changeTime);
	}

	return { targetPlaceholder, numberPlaceholders: numberPlaceholderStates.map(([state]) => state) };
}

function generateTarget() {
	return `${randomInt(1, 9)}${randomInt(9)}${randomInt(9)}`;
}

function generateNumbers() {
	const largeAmount = weightedRandom<number>(
		{ value: 0, weight: 10 },
		{ value: 1, weight: 25 },
		{ value: 2, weight: 30 },
		{ value: 3, weight: 15 },
		{ value: 4, weight: 16 },
		{ value: 5, weight: 3 },
		{ value: 6, weight: 1 }
	);
	const numbers: number[] = [];
	let i: number;
	for (i = 0; i < largeAmount; i++) numbers.push(getNumber('large', numbers));
	for (; i < 6; i++) numbers.push(getNumber('small'));

	return numbers;
}

function setNumberPlaceholders(
	states: [any, Dispatch<SetStateAction<string | undefined>>][],
	numbers: number[]
) {
	states.forEach(([, setState], index) => setState(String(numbers[index])));
}
