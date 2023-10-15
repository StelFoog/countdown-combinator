import countdownClosest from './countdownClosest';

onmessage = (
	event: MessageEvent<{ target: number; numbers: number[]; getSolutionsCertainly?: boolean }>
) => {
	const { target, numbers, getSolutionsCertainly = false } = event.data;

	const solutions = countdownClosest(target, numbers, getSolutionsCertainly);

	postMessage(solutions);
};
