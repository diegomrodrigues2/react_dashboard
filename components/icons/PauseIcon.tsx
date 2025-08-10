import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

const PauseIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </IconBase>
);

export default PauseIcon;
