import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

const PlusIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </IconBase>
);

export default PlusIcon;
