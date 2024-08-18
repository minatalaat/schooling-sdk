export const defaultSAPayloadDomain = "self.name = 'Country.saudi_arabia'";

export const getAddressL6 = values => {
  let addressL6 = '';
  if (values.streetNumber && values.streetNumber !== '') addressL6 = addressL6.concat(values.streetNumber);
  if (values.district && values.district !== '') addressL6 = addressL6.concat('-', values.district);
  if (values.cityObj && values?.cityObj?.name !== '') addressL6 = addressL6.concat('-', values?.cityObj?.name);
  if (values.postalCode && values.postalCode !== '') addressL6 = addressL6.concat('-', values.postalCode);
  return addressL6;
};
