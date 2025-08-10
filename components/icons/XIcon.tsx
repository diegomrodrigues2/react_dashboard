import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

const XIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </IconBase>
);

export default XIcon;
