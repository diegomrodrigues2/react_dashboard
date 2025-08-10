import React from 'react';

export interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
  'aria-label'?: string;
}

const IconBase: React.FC<IconBaseProps> = ({
  className,
  stroke = 'currentColor',
  fill = 'none',
  'aria-label': ariaLabel,
  children,
  ...rest
}) => (
  <svg
    className={className}
    stroke={stroke}
    fill={fill}
    aria-label={ariaLabel}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    {...rest}
  >
    {children}
  </svg>
);

export default IconBase;
