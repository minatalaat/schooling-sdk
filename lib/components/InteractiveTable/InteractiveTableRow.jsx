import { useState } from 'react';
import { useFormik } from 'formik';

import PrimaryButton from '../ui/buttons/PrimaryButton';
import InterActiveTableCell from './InterActiveTableCell';

const InteractiveTableRow = ({
  row,
  tableInputs,
  onAddNewLine,
  primaryIndex = 0,
  validationSchema,
  hasActions,
  pageMode,
  onDeleteClick = () => {},
  onSaveCopy = () => {},
  isRowValidCondition = () => {
    return true;
  },
  canAdd,
  defaultRow,
  parentFormik,
  parentAccessor,
  rowIndex,
}) => {
  let mode = pageMode === 'edit' ? 'edit' : pageMode === 'add' ? 'add' : 'view';

  const [isDefault, setIsDefault] = useState(Object.keys(row ?? {}).length > 0 ? false : true);
  const [timeoutId, setTimeoutId] = useState(null);

  const rowFormik = useFormik({
    initialValues: Object.keys(row ?? {}).length > 0 ? row : defaultRow,
    validationSchema: validationSchema,
    validateOnMount: true,
  });

  const handleDeleteClick = ({ row, rowFormik }) => {
    onDeleteClick({ rowData: row, rowFormik });
  };

  return (
    <>
      <tr key={row.key}>
        {!isDefault &&
          tableInputs?.map((inputData, columnIndex) => {
            return (
              <InterActiveTableCell
                key={columnIndex}
                mode={mode}
                row={row}
                rowFormik={rowFormik}
                tableInputs={tableInputs}
                columnIndex={isDefault ? 0 : columnIndex}
                primaryIndex={primaryIndex}
                onSaveCopy={onSaveCopy}
                isRowValidCondition={isRowValidCondition}
                onAddNewLine={onAddNewLine}
                inputData={inputData}
                setIsDefault={setIsDefault}
                parentFormik={parentFormik}
                parentAccessor={parentAccessor}
                timeoutId={timeoutId}
                setTimeoutId={setTimeoutId}
                index={rowIndex}
              />
            );
          })}
        {isDefault && mode !== 'view' && canAdd && (
          <InterActiveTableCell
            isDefault={true}
            mode={mode}
            row={row}
            rowFormik={rowFormik}
            tableInputs={tableInputs}
            columnIndex={0}
            primaryIndex={primaryIndex}
            onSaveCopy={onSaveCopy}
            isRowValidCondition={isRowValidCondition}
            onAddNewLine={onAddNewLine}
            inputData={tableInputs[0]}
            setIsDefault={setIsDefault}
            parentFormik={parentFormik}
            parentAccessor={parentAccessor}
            timeoutId={timeoutId}
            setTimeoutId={setTimeoutId}
          />
        )}
        {!isDefault && hasActions && mode !== 'view' && (
          <td>
            {!isDefault && (
              <div className="table-action-button float-end">
                <PrimaryButton theme="clickableIconDanger" icon="delete" onClick={() => handleDeleteClick({ row, rowFormik })} />
              </div>
            )}
          </td>
        )}
      </tr>
    </>
  );
};

export default InteractiveTableRow;
