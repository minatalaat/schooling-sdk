import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import InteractiveTableRow from './InteractiveTableRow';
import CreateNewButton from '../ui/createNewButton/CreateNewButton';
import Card from '../ui/Card/Card';
import FormModal from '../ui/modals/FormModal';

import { setFieldValue } from '../../utils/formHelpers';

const InteractiveTable = ({
  title,
  pageMode,
  lineHeaders,
  tableInputs,
  lineValidationSchema,
  onAddNewLine,
  onDeleteLine,
  onSaveCopy,
  addConfig,
  primaryIndex,
  canAdd = true,
  hasActions = true,
  defaultRow,
  isRowValidCondition = () => {
    return true;
  },
  parentFormik,
  parentAccessor,
  tooltip,
}) => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  let mode = pageMode === 'edit' ? 'edit' : pageMode === 'add' ? 'add' : 'view';

  const addCallback = async addedData => {
    if (addConfig?.selectCallback) addConfig.selectCallback(addedData);

    let returnedLine = { ...defaultRow };
    if (addConfig?.returnNewLine) returnedLine = await addConfig.returnNewLine(addedData);

    if (parentFormik && parentAccessor && addConfig.accessor) {
      let lines = [...parentFormik.values[parentAccessor]];
      returnedLine[addConfig.accessor] = addedData;
      lines.push(returnedLine);
      setFieldValue(parentFormik, parentAccessor, lines);
    }
  };

  const modifiedValues =
    pageMode !== 'view' ? [...(parentFormik?.values?.[parentAccessor] ?? []), {}] : parentFormik?.values?.[parentAccessor] ?? [];

  return (
    <>
      {showAddModal && (
        <FormModal
          FormComponent={addConfig.FormComponent}
          title={addConfig.modalTitle}
          show={showAddModal}
          setShow={setShowAddModal}
          selectCallback={addCallback}
          additionalProps={addConfig.additionalProps}
        />
      )}
      <Card
        title={title}
        tooltip={tooltip}
        ActionComponent={
          addConfig
            ? addConfig?.actionComponent
              ? () => {
                  let ActionComponent = addConfig?.actionComponent;
                  return (
                    <ActionComponent
                      label={t('LBL_UPLOAD_INVENTORY')}
                      onClick={() => {
                        setShowAddModal(true);
                      }}
                    />
                  );
                }
              : () => (
                  <div className="col">
                    <CreateNewButton
                      label={addConfig.title}
                      onClick={() => {
                        setShowAddModal(true);
                      }}
                    />
                  </div>
                )
            : null
        }
      >
        <div className="table-responsive-md table-interactive w-100 d-flex">
          <table className="table table-main table-borderless table-sm align-middle" id="tableOne">
            <thead>
              <tr>
                {lineHeaders.map(header => {
                  if (!header) return null;
                  return <th key={header}>{t(header)}</th>;
                })}
                {hasActions && mode !== 'view' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {modifiedValues &&
                modifiedValues.map((line, index) => {
                  return (
                    <InteractiveTableRow
                      key={line.lineId ?? uuidv4()}
                      row={line}
                      rowIndex={index}
                      onAddNewLine={onAddNewLine}
                      tableInputs={tableInputs}
                      validationSchema={lineValidationSchema}
                      hasActions={hasActions}
                      pageMode={pageMode}
                      onDeleteClick={onDeleteLine}
                      onSaveCopy={onSaveCopy}
                      isRowValidCondition={isRowValidCondition}
                      primaryIndex={primaryIndex}
                      canAdd={canAdd}
                      defaultRow={defaultRow}
                      parentFormik={parentFormik}
                      parentAccessor={parentAccessor}
                    />
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default InteractiveTable;
