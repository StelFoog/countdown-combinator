/**
 * Returns a random number between from and to
 */
export function randomInt(from: number, to: number, inclusive?: boolean): number;
/**
 * Returns a random number between `0` and to
 */
export function randomInt(to: number, inclusive?: boolean): number;
export function randomInt(arg1: number, arg2?: number | boolean, arg3: boolean = true): number {
	const to = typeof arg2 === 'number' ? arg2 : arg1;
	const from = typeof arg2 === 'number' ? arg1 : 0;
	const inclusive = typeof arg2 === 'boolean' ? arg2 : arg3;
	if (!isFinite(to)) throw new Error('to must be an integer');
	if (!isFinite(from)) throw new Error('from must be an integer');
	if (inclusive ? from > to : from >= to) throw new Error('from must be less than to');

	const res = Math.floor(Math.random() * (to - from + Number(inclusive))) + from;

	return inclusive ? res : res + 1;
}

export function getNumber(type: 'large' | 'small', usedLarge?: number[]): number {
	if (type === 'small') return randomInt(1, 10);

	if (!usedLarge) return randomInt(4, false) * 25;
	const bannedLarge = usedLarge.length >= 4 ? usedLarge.slice(4) : usedLarge;
	const availableLarge = [25, 50, 75, 100].filter((value) => !bannedLarge.includes(value));

	return randomFromArray(availableLarge);
}

export function weightedRandom<T>(...options: { value: T; weight: number }[]): T {
	if (!options.length) throw new Error('Must provide at least one option');

	let i: number;
	const weights = [options[0].weight];
	for (i = 1; i < options.length; i++) weights[i] = options[i].weight + weights[i - 1];

	const rand = Math.random() * weights[weights.length - 1];
	for (i = 0; i < weights.length && weights[i] <= rand; i++);

	if (i >= weights.length) throw new Error('Something went wrong when finding the corrent option');
	return options[i].value;
}

export function randomFromArray<T>(array: T[]): T {
	const randomIndex = randomInt(array.length - 1);
	return array[randomIndex];
}
