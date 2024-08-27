import NavigationContext from './SchoolingContext';

export const SchoolingProvider = ({ baseRoute, children }) => {
  const value = { baseRoute };
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};
