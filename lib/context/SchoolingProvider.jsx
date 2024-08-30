import NavigationContext from './SchoolingContext';

export const SchoolingProvider = ({ baseRoute, env, children }) => {
  const value = { baseRoute, env };
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};
