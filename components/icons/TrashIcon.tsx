import React from 'react';
import IconBase, { IconBaseProps } from './IconBase';

const TrashIcon: React.FC<IconBaseProps> = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.02 3.22.055m9.34 0c-.091.026-.18.052-.27.077m-13.086 0c.091.026.18.052.27.077M4.772 5.79L4.772 4.744a2.25 2.25 0 012.25-2.25h8.956a2.25 2.25 0 012.25 2.25v1.05M4.772 5.79l-.238.192A2.25 2.25 0 003 7.705V19.255a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.255V7.705a2.25 2.25 0 00-1.534-2.103l-.238-.192" />
  </IconBase>
);

export default TrashIcon;
