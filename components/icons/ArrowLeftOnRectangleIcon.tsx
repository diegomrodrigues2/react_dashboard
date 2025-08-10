import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

// Heroicons: arrow-left-on-rectangle (for Logout)
const ArrowLeftOnRectangleIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15.75" />
  </IconBase>
);

export default ArrowLeftOnRectangleIcon;
