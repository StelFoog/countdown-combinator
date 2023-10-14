type Expression = '+' | '-' | '*' | '/';

export type Value = { value: number; way: string; used: number[]; lastExpr?: Expression };

function cleanWay(value: Value, ...on: Expression[]) {
	if (on.includes(value.lastExpr!)) return value.way.slice(1, -1);
	return value.way;
}

function add(a: Value, b: Value): Value {
	return {
		value: a.value + b.value,
		way: `(${cleanWay(a, '+', '-')} + ${cleanWay(b, '+', '-')})`,
		used: [...a.used, ...b.used],
		lastExpr: '+',
	};
}

function mult(a: Value, b: Value): Value {
	return {
		value: a.value * b.value,
		way: `(${cleanWay(a, '*')} * ${cleanWay(b, '*')})`,
		used: [...a.used, ...b.used],
		lastExpr: '*',
	};
}

function sub(a: Value, b: Value): Value {
	return {
		value: a.value - b.value,
		way: `(${cleanWay(a, '+', '-', '*')} - ${cleanWay(b, '-')})`,
		used: [...a.used, ...b.used],
		lastExpr: '-',
	};
}

function div(a: Value, b: Value): Value {
	return {
		value: a.value / b.value,
		way: `(${cleanWay(a, '*', '+')} / ${b.way})`,
		used: [...a.used, ...b.used],
		lastExpr: '/',
	};
}

export function search(
	target: number,
	values: Value[],
	completed: Set<string> = new Set<string>()
): Value[] {
	const definedAs = values
		.map(({ way }) => way)
		.sort()
		.join('_');
	if (completed.has(definedAs)) return [];

	if (values.length === 1) return values;
	const hit = values.find(({ value }) => value === target);
	if (hit) return [hit];

	const results: Value[] = [];
	for (let i = 0; i < values.length - 1; i++) {
		for (let j = i + 1; j < values.length; j++) {
			const one = values[i];
			const two = values[j];
			const rest = values.filter((_, index) => index !== i && index !== j);
			results.push(...search(target, [add(one, two), ...rest], completed));
			results.push(...search(target, [mult(one, two), ...rest], completed));
			results.push(...search(target, [sub(one, two), ...rest], completed));
			results.push(...search(target, [sub(two, one), ...rest], completed));
			const oneOverTwo = div(one, two);
			if (Number.isInteger(oneOverTwo.value))
				results.push(...search(target, [oneOverTwo, ...rest], completed));
			const twoOverOne = div(two, one);
			if (Number.isInteger(twoOverOne.value))
				results.push(...search(target, [twoOverOne, ...rest], completed));
		}
	}

	completed.add(definedAs);
	return results;
}

export default function countdownClosest(
	target: number,
	numbers: number[]
): { results: Value[]; timeTaken: number } {
	const values = numbers.map((number) => ({ value: number, way: String(number), used: [number] }));
	const start = new Date();
	const completed = new Set<string>();

	const results = search(target, values, completed);
	const timeTaken = new Date().getTime() - start.getTime();

	return { results, timeTaken };

	let minDist = Number.MAX_SAFE_INTEGER;
	const sorted = results.sort((a, b) => a.used.length - b.used.length);
	for (let i = 0; i < sorted.length; i++) {
		const dist = Math.abs(sorted[i].value - target);
		if (dist < minDist) {
			minDist = dist;
		}
	}
	const close = sorted.find(({ value }) => Math.abs(value - target) === minDist)!;
	console.log('Got:', close.value);
	console.log('Way:', close.way.slice(1, -1));
	console.log('Using:', close.used);
	console.log(
		sorted.filter(({ value }) => Math.abs(value - target) === minDist).length,
		'possible ways'
	);
	console.log('Set', completed.size);
	// sorted
	// 	.filter(({ value }) => Math.abs(value - target) === minDist)
	// 	.forEach(({ way, used }) => {
	// 		console.log('  Way:', way);
	// 		console.log('  Using:', used, '\n');
	// 	});
}
