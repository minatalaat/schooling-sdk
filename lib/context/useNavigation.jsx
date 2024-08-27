import { useContext } from 'react';
import SchoolingContext from './SchoolingContext';

const useSchoolingContext= () => {
  return useContext(SchoolingContext);
};

export default useSchoolingContext;
