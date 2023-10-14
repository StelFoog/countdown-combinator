export function isValidTarget(target: number | string) {
	const strTarget = typeof target === 'string' ? target : String(target);
	return strTarget.length === 3;
}

export function isValidNumber(number: number | string) {
	const numNumber = typeof number === 'number' ? number : Number(number);
	return numNumber <= 10 || [25, 50, 75, 100].includes(numNumber);
}
