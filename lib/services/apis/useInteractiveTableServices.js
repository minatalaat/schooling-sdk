import { useCallback } from 'react';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { handleChange, setFieldValue } from '../../utils/formHelpers';
import { debounce } from '../../utils/helpers';

export const useInteractiveTableServices = ({
  row,
  rowFormik,
  primaryIndex,
  tableInputs,
  isRowValidCondition,
  onSaveClick,
  onSaveCopy,
  isDefault,
  setIsDefault,
  onAddNewLine = async () => {},
  parentFormik,
  parentAccessor,
  timeoutId,
  setTimeoutId,
}) => {
  const { validateFormForSubmit } = useFormikSubmit(rowFormik, () => {});
  let primaryAccessor = tableInputs[primaryIndex].accessor;
  let primaryType = tableInputs[primaryIndex]?.type;

  const isPrimaryInputValid = value => {
    if (!value) value = rowFormik.values[primaryAccessor];

    if (primaryType === 'text' || primaryType === 'textarea' || primaryType === 'dropdown') {
      if (value === '' || value?.length === 0) return false;
    } else if (primaryType === 'number') {
      if (value === '' || value.toString()?.length === 0) return false;
    } else if (primaryType === 'searchdrop') {
      if (value === null || value === undefined) return false;
    }

    return true;
  };

  const debouncedAddNewLine = useCallback(
    debounce(
      async value => {
        await onAddNewLine({ rowFormik, value });
        setIsDefault(false);
      },
      1000,
      timeoutId,
      setTimeoutId
    ),
    [onAddNewLine, rowFormik, setIsDefault]
  );

  const debouncedOnChangeValue = useCallback(
    debounce(
      async ({ e, columnIndex }) => {
        await tableInputs[columnIndex].props?.onChange({ e, value: e.target.value, rowData: row, rowFormik });
      },
      1000,
      timeoutId,
      setTimeoutId
    ),
    [row, rowFormik, tableInputs]
  );

  const handleInputChange = async ({ e, columnIndex }) => {
    if (columnIndex === 0 && isDefault) {
      return debouncedAddNewLine(e.target.value);
    }

    if (tableInputs[columnIndex].props?.onChange) {
      debouncedOnChangeValue({ e, columnIndex });
    }

    let currentParentValue = [...parentFormik.values[parentAccessor]];
    let selectedIndex = currentParentValue.findIndex(el => el?.lineId === row?.lineId);
    if (selectedIndex === -1) return null;

    currentParentValue[selectedIndex][tableInputs[columnIndex].accessor] = e.target.value;

    setFieldValue(parentFormik, parentAccessor, currentParentValue);

    handleChange(rowFormik, e, e.target.value);
  };

  const handleInputBlur = async ({ e, columnIndex }) => {
    if (columnIndex === 0 && isDefault) {
      await onAddNewLine({ rowFormik, value: e.target.value });
      return setIsDefault(false);
    }

    if (tableInputs[columnIndex].props?.onBlur)
      await tableInputs[columnIndex].props?.onBlur({ e, value: e.target.value, rowData: row, rowFormik, row });
    // await rowFormik.handleBlur;

    // if (isDefault && columnIndex === primaryIndex) {
    //   await handlePrimaryInputSave({ value: e.target.value });
    // }
  };

  const handleSelectCallback = async ({ value, columnIndex }) => {
    if (columnIndex === 0 && isDefault) {
      await onAddNewLine({ rowFormik, value });
      return setIsDefault(false);
    }

    let currentParentValue = [...parentFormik.values[parentAccessor]];
    let selectedIndex = currentParentValue.findIndex(el => el?.lineId === row?.lineId);
    if (selectedIndex === -1) return null;

    currentParentValue[selectedIndex][tableInputs[columnIndex].accessor] = value;

    setFieldValue(parentFormik, parentAccessor, currentParentValue);

    if (tableInputs[columnIndex].props?.selectCallback)
      await tableInputs[columnIndex].props?.selectCallback({ value, rowData: row, rowFormik, row });

    // if (!isDefault || columnIndex !== primaryIndex) {
    //   await handleSave({ row, rowFormik });
    // }
  };

  const handleRemoveCallback = async ({ value, columnIndex }) => {
    let currentParentValue = [...parentFormik.values[parentAccessor]];
    let selectedIndex = currentParentValue.findIndex(el => el?.lineId === row?.lineId);
    if (selectedIndex === -1) return null;

    currentParentValue[selectedIndex][tableInputs[columnIndex].accessor] = null;
    
    setFieldValue(parentFormik, parentAccessor, currentParentValue);

    if (tableInputs[columnIndex].props?.removeCallback)
      await tableInputs[columnIndex].props?.removeCallback({ value, rowData: row, rowFormik, row });

    parentFormik.validateForm();

    // if (!isDefault || columnIndex !== primaryIndex) {
    //   await handleSave({ row, rowFormik });
    // }
  };

  const handlePrimaryInputSave = async ({ value }) => {
    if (isPrimaryInputValid(value)) {
      let isValid = await validateRow();
      // setFieldValue(rowFormik, primaryAccessor, value);
      // await onAddNewLine({ row, rowFormik });
      // await saveFormikInParent({ row, rowFormik, isValid });
      let mergedObj = Object.assign({}, row, rowFormik.values);
      row.data = { ...mergedObj };
      row.data[primaryAccessor] = value;

      if (isValid) {
        await onSaveClick({ rowData: mergedObj, rowFormik });
      } else {
        await onSaveCopy({ rowData: mergedObj, rowFormik });
      }
    }
  };

  const validateRow = async () => {
    const isValid = await validateFormForSubmit();
    let condition = isRowValidCondition(rowFormik);
    if (!isValid || !condition) return null;
    if (isValid && condition) return true;
  };

  return {
    isPrimaryInputValid,
    handleInputChange,
    handleInputBlur,
    handleSelectCallback,
    handlePrimaryInputSave,
    handleRemoveCallback,
  };
};
