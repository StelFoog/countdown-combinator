type IconProps = {
	className?: string;
};

export default function iconWrapper(
	svgIcon: React.JSX.Element
): ({ className }: IconProps) => JSX.Element {
	return ({ className }) => <div className={className}>{svgIcon}</div>;
}
