import { useEffect } from 'react';
import { useFormik } from 'formik';

import InterActiveTableCell from './InterActiveTableCell';

import { setAllValues } from '../../utils/formHelpers';

const InteractiveTableDefaultRow = ({
  row,
  onAddNewLine,
  tableInputs,
  primaryIndex = 0,
  validationSchema,
  hasActions,
  onSaveClick = () => {},
  onSaveCopy = () => {},
  isRowValidCondition = () => {
    return true;
  },
}) => {
  let mode = 'edit';

  const defaultRowFormik = useFormik({
    initialValues: row?.data,
    validationSchema: validationSchema,
    validateOnMount: true,
  });

  // useEffect(() => {
  //   setAllValues(defaultRowFormik, row.data);
  // }, [row.data]);

  return (
    <>
      <tr key={row.key}>
        <InterActiveTableCell
          isDefault={true}
          mode={mode}
          row={row}
          rowFormik={defaultRowFormik}
          tableInputs={tableInputs}
          columnIndex={0}
          primaryIndex={primaryIndex}
          onSaveClick={onSaveClick}
          onSaveCopy={onSaveCopy}
          isRowValidCondition={isRowValidCondition}
          onAddNewLine={onAddNewLine}
          inputData={tableInputs[0]}
        />
        {hasActions && mode !== 'view' && row.isDeleteable && <td></td>}
      </tr>
    </>
  );
};

export default InteractiveTableDefaultRow;
