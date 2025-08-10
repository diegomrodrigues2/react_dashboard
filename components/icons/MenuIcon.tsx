import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

const MenuIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </IconBase>
);

export default MenuIcon;
