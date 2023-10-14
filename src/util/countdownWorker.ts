import countdownClosest from './countdownClosest';

onmessage = (event: MessageEvent<{ target: number; numbers: number[] }>) => {
	const { target, numbers } = event.data;

	const solutions = countdownClosest(target, numbers);

	postMessage(solutions);
};
