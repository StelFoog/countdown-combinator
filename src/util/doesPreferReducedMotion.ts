export default function doesPreferReducedMotion() {
	return (
		typeof window !== 'undefined' && window.matchMedia(`(prefers-reduced-motion: reduce)`).matches
	);
}
