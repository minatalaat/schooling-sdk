import TextInput from '../ui/inputs/TextInput';
import NumberInput from '../ui/inputs/NumberInput';
import TextArea from '../ui/inputs/TextArea';
import DropDown from '../ui/inputs/DropDown';
import SearchModalAxelor from '../ui/inputs/SearchModal/SearchModalAxelor';
import CheckboxInput from '../ui/inputs/CheckboxInput';
import ClickableInput from '../ui/inputs/ClickableInput';

import { formatFloatNumber } from '../../utils/helpers';
import { useInteractiveTableServices } from '../../services/apis/useInteractiveTableServices';

const InterActiveTableCell = ({
  isDefault = false,
  mode,
  row,
  rowFormik,
  tableInputs,
  columnIndex,
  primaryIndex,
  onSaveClick,
  onSaveCopy,
  isRowValidCondition,
  onAddNewLine,
  inputData,
  setIsDefault,
  parentFormik,
  parentAccessor,
  timeoutId,
  setTimeoutId,
  index,
}) => {
  const {
    handleInputChange,
    handleInputBlur,
    handleSelectCallback,
    handleRemoveCallback /*  handlePrimaryInputSave, handleSave, isPrimaryInputValid */,
  } = useInteractiveTableServices({
    row,
    rowFormik,
    onSaveClick,
    onSaveCopy,
    primaryIndex,
    columnIndex,
    tableInputs,
    isDefault,
    isRowValidCondition,
    onAddNewLine,
    setIsDefault,
    parentFormik,
    parentAccessor,
    timeoutId,
    setTimeoutId,
  });

  // useEffect(() => {
  //   setAllValues(rowFormik, row.data);
  // }, [row.data]);

  // useEffect(() => {
  //   if (isPrimaryInputValid()) {
  //     if (columnIndex === primaryIndex) handlePrimaryInputSave({ value: rowFormik.values[tableInputs[primaryIndex].accessor] });
  //     else handleSave({ row, rowFormik });
  //   }
  // }, [rowFormik.values[tableInputs[primaryIndex].accessor]]);

  if (inputData.isHidden && inputData.isHidden(row)) return <td key={columnIndex}></td>;

  return (
    <>
      <td key={columnIndex}>
        {/* {(columnIndex === primaryIndex || (columnIndex !== primaryIndex && isPrimaryInputValid())) && ( */}
        <>
          {inputData?.type === 'text' ? (
            <TextInput
              formik={rowFormik}
              label={inputData.label}
              accessor={inputData.accessor}
              mode={mode}
              {...inputData.props}
              onChange={async e => await handleInputChange({ e, columnIndex })}
              onBlur={async e => await handleInputBlur({ e, columnIndex })}
              isInteractiveTable={true}
              parentFormik={parentFormik}
              parentAccessor={parentAccessor}
              index={index}
            />
          ) : inputData?.type === 'number' ? (
            <NumberInput
              formik={rowFormik}
              label={inputData.label}
              accessor={inputData.accessor}
              mode={mode}
              {...inputData.props}
              onChange={async e => await handleInputChange({ e, columnIndex })}
              onBlur={async e => await handleInputBlur({ e, columnIndex })}
              isInteractiveTable={true}
              parentFormik={parentFormik}
              parentAccessor={parentAccessor}
              index={index}
              disabled={(inputData?.isDisabled && inputData?.isDisabled(row)) ?? inputData.props?.disabled ?? undefined}
            />
          ) : inputData?.type === 'textarea' ? (
            <TextArea
              formik={rowFormik}
              label={inputData.label}
              accessor={inputData.accessor}
              mode={mode}
              {...inputData.props}
              onChange={async e => await handleInputChange({ e, columnIndex })}
              onBlur={async e => await handleInputBlur({ e, columnIndex })}
              isInteractiveTable={true}
              parentFormik={parentFormik}
              parentAccessor={parentAccessor}
              index={index}
            />
          ) : inputData?.type === 'dropdown' ? (
            <DropDown
              formik={rowFormik}
              label={inputData.label}
              accessor={inputData.accessor}
              mode={mode}
              {...inputData.props}
              isInteractiveTable={true}
            />
          ) : inputData?.type === 'searchdrop' ? (
            <SearchModalAxelor
              formik={rowFormik}
              mode={mode}
              {...inputData.props}
              selectCallback={async value => await handleSelectCallback({ value, columnIndex, ...inputData.props })}
              removeCallback={value => handleRemoveCallback({ value, columnIndex, ...inputData.props })}
              isInteractiveTable={true}
              parentFormik={parentFormik}
              parentAccessor={parentAccessor}
              index={index}
            />
          ) : inputData?.type === 'p' ? (
            <p>
              {inputData.props?.isFloatNumber
                ? formatFloatNumber(rowFormik.values[inputData.accessor])
                : rowFormik.values[inputData.accessor]}
            </p>
          ) : inputData?.type === 'checkbox' ? (
            <CheckboxInput
              formik={rowFormik}
              accessor={inputData.accessor}
              mode={mode}
              label={inputData.label}
              {...inputData.props}
              onChange={async e => await handleInputChange({ e, columnIndex })}
            />
          ) : inputData?.type === 'extraValues' ? (
            <ClickableInput
              rowFormik={rowFormik}
              label={inputData?.label}
              accessor={inputData?.accessor}
              selectCallback={inputData?.selectCallback}
              FormComponent={inputData?.FormComponent}
              mode={mode}
              additionalProps={inputData?.additionalProps}
              isInteractiveTable={true}
            />
          ) : (
            <p></p>
          )}
        </>
        {/* )} */}
      </td>
    </>
  );
};

export default InterActiveTableCell;
