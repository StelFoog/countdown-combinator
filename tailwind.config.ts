import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			colors: {
				base: {
					'50': '#f0f7fe',
					'100': '#ddedfc',
					'200': '#c2e0fb',
					'300': '#99cdf7',
					'400': '#68b2f2',
					'500': '#4592ec',
					'600': '#3076e0',
					'700': '#265ec7', // origin
					'800': '#264fa7',
					'900': '#244584',
					'950': '#1a2c51',
				},
			},
		},
	},
	plugins: [],
};
export default config;
