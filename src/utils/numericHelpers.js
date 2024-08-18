export const convertNumberToString = (value, noOfDecimals = 0) => {
  let zero = 0;
  return value?.toFixed(noOfDecimals)?.toString() || zero.toFixed(noOfDecimals).toString();
};
