export const onCountriesSuccess = (response, onError) => {
  if (response?.data?.status !== 0 || response?.data?.total === null || response?.data?.total === undefined) return onError();
  const data = response.data?.data || [];
  let tempCountries = [];

  if (data) {
    data.forEach(country => {
      tempCountries.push({
        id: country.id,
        name: country['$t:name'],
      });
    });
  }

  return { displayedData: [...tempCountries], total: response.data.total || 0 };
};

export const onCitiesSuccess = (response, onError) => {
  if (response?.data?.status !== 0 || response?.data?.total === null || response?.data?.total === undefined) return onError();
  const data = response.data?.data || [];
  let tempCities = [];

  if (data) {
    data.forEach(city => {
      tempCities.push({
        id: city.id,
        name: city['$t:name'],
      });
    });
  }

  return { displayedData: [...tempCities], total: response.data.total || 0 };
};
