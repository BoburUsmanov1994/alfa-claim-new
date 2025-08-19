import React from 'react';
import InputMask from 'react-input-mask';
import { Input } from 'antd';

const Index = ({ mask, ...props }) => (
   <div>
       <InputMask mask={mask} maskChar={null} {...props}>
           {(inputProps) => <Input {...inputProps} />}
       </InputMask>
   </div>
);

export default Index;
