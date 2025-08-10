
import React from 'react';

const FilterSlashIcon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> = ({ title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {title ? <title>{title}</title> : null}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.044 1.887l-2.25 1.125a2.25 2.25 0 01-2.706 0l-2.25-1.125a2.25 2.25 0 01-1.044-1.887v-2.927a2.25 2.25 0 00-.659-1.591L2.659 6.818A2.25 2.25 0 012 5.227V4.182c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3zM3 3l18 18" />
  </svg>
);

export default FilterSlashIcon;
