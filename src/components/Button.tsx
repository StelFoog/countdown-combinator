import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Spinner from './Spinner';

type ButtonProps = {
	type?: 'submit' | 'reset' | 'button';
	onClick?: () => void;
	loading?: boolean;
	loadingComponent?: ReactNode;
	disabled?: boolean;
	className?: string;
	children?: ReactNode;
};

export default function Button({
	type = 'button',
	onClick,
	loading = false,
	loadingComponent = <Spinner className="text-xl" />,
	disabled = false,
	className,
	children,
}: ButtonProps) {
	return (
		<button
			type={type}
			onClick={!loading ? onClick : undefined}
			disabled={disabled}
			className={twMerge(
				'h-12 px-4 rounded-lg transition duration-200 leading-none',
				'border border-white/90 hover:border-white hover:bg-gray-900/10',
				'disabled:border-gray-400 disabled:text-gray-400 disabled:bg-transparent',
				'inline-flex items-center',
				loading ? 'justify-center' : 'justify-between',
				className
			)}
		>
			{!loading ? children : loadingComponent}
		</button>
	);
}
