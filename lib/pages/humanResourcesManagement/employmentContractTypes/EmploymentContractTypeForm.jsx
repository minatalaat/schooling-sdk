import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';
import CheckboxInput from '../../../components/ui/inputs/CheckboxInput';
import InnerTable from '../../../components/InnerTable';

import ContractSubTypeModal from './ContractSubTypeModal';
import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';

const EmploymentContractTypeForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
  contractSubTypeList,
  setContractSubTypeList,
  isLoading,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  const initialValues = {
    name: data?.name || '',
    description: data?.description || '',
    isNoLongerUsed: addNew ? false : data?.isNoLongerUsed || false,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    description: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim(),
    isNoLongerUsed: Yup.boolean(t('LBL_INVALID_VALUE')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const saveRecord = () => {
    if (formik.isValid) {
      setActionInProgress(true);
      let payload = {
        data: {
          isNoLongerUsed: formik.values.isNoLongerUsed,
          name: formik.values.name,
          description: formik.values.description,
          employmentContractSubTypeList: contractSubTypeList,
        },
      };

      if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

      api('POST', getModelUrl(MODELS.EMPLOYMENT_CONTRACT_TYPE), payload, () => {
        setActionInProgress(false);
        finshedSaveHandler('success');
      });
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.EMPLOYMENT_CONTRACT_TYPE), payload, () => {
      setActionInProgress(false);
      finshedDeleteHandler('success');
    });
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }
  }, [isSave, isDelete, addNew, enableEdit]);

  // Inner Table Data
  const [lineData, setLineData] = useState([]);
  const [showNewLine, setShowNewLine] = useState(false);
  const [showEditLine, setShowEditLine] = useState(false);
  const [showViewLine, setShowViewLine] = useState(false);
  const [selectedLine, setSelectedLine] = useState({});

  const lineHeaders = [t('LBL_CODE'), t('LBL_DESCRIPTION')];

  const addLineHandler = () => {
    setSelectedLine(null);
    setShowNewLine(true);
  };

  const editLineHandler = line => {
    setSelectedLine(line);
    setShowEditLine(true);
  };

  const viewLineHandler = line => {
    setSelectedLine(line);
    setShowViewLine(true);
  };

  const deleteLineHandler = line => {
    let tempList = contractSubTypeList.filter(l => l.lineId !== line.lineId);
    setContractSubTypeList(tempList);
  };

  const openMoreActionHandler = line => {
    setSelectedLine(line);
  };

  useEffect(() => {
    let tempData = [];
    contractSubTypeList &&
      contractSubTypeList.length > 0 &&
      contractSubTypeList.forEach(line => {
        tempData.push({
          isDeleteable: true,
          isEditable: true,
          tableData: [
            { value: line.code, type: 'text' },
            { value: line.description, type: 'text' },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.code,
        });
      });
    setLineData(tempData);
  }, [contractSubTypeList]);

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_NAME" accessor="name" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_DESCRIPTION" accessor="description" mode={mode} />
          </div>
          <div className="col-md-6">
            <CheckboxInput formik={formik} label="LBL_NO_LONGER_USED" accessor="isNoLongerUsed" mode={mode} />
          </div>
        </div>
        <InnerTable
          title={t('LBL_CONTRACT_SUBTYPES')}
          pageMode={mode}
          onAddNewLine={addLineHandler}
          onViewLine={viewLineHandler}
          onEditLine={editLineHandler}
          onDeleteLine={deleteLineHandler}
          onOpenMoreAction={openMoreActionHandler}
          lineHeaders={lineHeaders}
          lineData={lineData}
          alternativeID="lineId"
          isLoading={isLoading}
        />
        {showNewLine && (
          <ContractSubTypeModal
            show={showNewLine}
            setShow={setShowNewLine}
            contractSubTypeList={contractSubTypeList}
            setContractSubTypeList={setContractSubTypeList}
            mode="add"
            line={selectedLine}
          />
        )}
        {showEditLine && (
          <ContractSubTypeModal
            show={showEditLine}
            setShow={setShowEditLine}
            contractSubTypeList={contractSubTypeList}
            setContractSubTypeList={setContractSubTypeList}
            mode="edit"
            line={selectedLine}
          />
        )}
        {showViewLine && (
          <ContractSubTypeModal
            show={showViewLine}
            setShow={setShowViewLine}
            contractSubTypeList={contractSubTypeList}
            setContractSubTypeList={setContractSubTypeList}
            mode="view"
            line={selectedLine}
          />
        )}
      </div>
    </>
  );
};

export default EmploymentContractTypeForm;
