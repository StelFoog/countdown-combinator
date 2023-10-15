import { DetailedHTMLProps, InputHTMLAttributes, RefObject, useState } from 'react';

type FocusProps = Pick<
	DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
	'onFocus' | 'onBlur'
>;

export default function useFocusState(ref?: RefObject<HTMLInputElement>): [boolean, FocusProps] {
	const [isFocused, setIsFocused] = useState(
		typeof document !== 'undefined' && document.activeElement === ref?.current
	);

	const elementProps: FocusProps = {
		onFocus: () => setIsFocused(true),
		onBlur: () => setIsFocused(false),
	};

	return [isFocused, elementProps];
}
