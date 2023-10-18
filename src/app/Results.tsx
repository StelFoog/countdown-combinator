import { CountdownClosestResult, Value } from '@/util/types';
import { useMemo } from 'react';

type ResultsProps = {
	results: CountdownClosestResult | undefined;
};

export default function Results({ results }: ResultsProps) {
	const bestResult = useMemo<Value>(() => {
		if (!results) return undefined!;
		let minDist = Number.MAX_SAFE_INTEGER;
		const sorted = results.results.sort((a, b) => a.used.length - b.used.length);
		for (let i = 0; i < sorted.length; i++) {
			const dist = Math.abs(sorted[i].value - results.target);
			if (dist < minDist) {
				minDist = dist;
			}
		}

		return sorted.find(({ value }) => Math.abs(value - results.target) === minDist)!;
	}, [results]);
	return results ? (
		<div className="flex flex-col mt-12">
			<p>
				Got: {bestResult.value}{' '}
				{bestResult.value !== results.target &&
					`(${Math.abs(bestResult.value - results.target)} away)`}
			</p>
			<p>Way: {bestResult.way}</p>
			<p>In: {results.timeTaken}ms</p>
			<p>Ways: {results.results.filter(({ value }) => bestResult.value === value).length}</p>
		</div>
	) : null;
}
