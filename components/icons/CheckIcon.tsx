import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

const CheckIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </IconBase>
);

export default CheckIcon;
