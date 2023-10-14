import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Countdown Combinator',
	description: 'Find all possible solutions to number challanges from Countdown',
};

export default function RootLayout(props: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>{props.children}</body>
		</html>
	);
}
