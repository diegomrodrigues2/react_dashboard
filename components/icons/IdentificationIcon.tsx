import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

const IdentificationIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 9a7.5 7.5 0 007.5-7.5h-15a7.5 7.5 0 007.5 7.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25" />
  </IconBase>
);

export default IdentificationIcon;
