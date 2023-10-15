import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Spinner from './Spinner';

type ButtonProps = {
	type?: 'submit' | 'reset' | 'button';
	onClick?: () => void;
	loading?: boolean;
	loadingComponent?: ReactNode;
	className?: string;
	children?: ReactNode;
};

export default function Button({
	type = 'button',
	onClick,
	loading = false,
	loadingComponent = <Spinner className="text-xl" />,
	className,
	children,
}: ButtonProps) {
	return (
		<button
			type={type}
			onClick={!loading ? onClick : undefined}
			className={twMerge(
				'h-12 px-4 rounded-lg transition leading-none',
				'border-white/90 border hover:bg-gray-900/10',
				'inline-flex items-center',
				loading ? 'justify-center' : 'justify-between',
				className
			)}
		>
			{!loading ? children : loadingComponent}
		</button>
	);
}
