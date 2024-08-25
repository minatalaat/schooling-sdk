export const addObjectToChanges = (accessor, changesObj, fetchedObj, selectedState) => {
  // if it wasn't existing before & not now too
  if (!fetchedObj && !selectedState) return;
  // if it wasn't existing before
  else if (!fetchedObj && selectedState) changesObj[accessor] = { ...selectedState };
  // if it existed before but got deleted now
  else if (fetchedObj && !selectedState) changesObj[accessor] = null;
  // if it existed before but got diff value now
  else if (fetchedObj && selectedState && fetchedObj.id !== selectedState.id) changesObj[accessor] = { ...selectedState };
};

export const addFormikValueToChanges = (accessor, changesObj, fetchedString, formik) => {
  // if it wasn't existing before & not now too
  // if it wasn't existing before
  // if it existed before but got deleted now
  // if it existed before but got diff value now
  if (formik.values[accessor] !== fetchedString) changesObj[accessor] = formik.values[accessor];
};

export const addFloatToChanges = (accessor, changesObj, fetchedString, formik) => {
  // if it wasn't existing before & not now too
  // if it wasn't existing before
  // if it existed before but got deleted now
  // if it existed before but got diff value now
  if (parseFloat(formik.values[accessor]) !== parseFloat(fetchedString)) changesObj[accessor] = formik.values[accessor];
};
