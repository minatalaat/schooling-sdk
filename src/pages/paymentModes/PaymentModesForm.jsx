import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import ConfirmationPopup from '../../components/ConfirmationPopup';
import InnerTable from '../../components/InnerTable';
import AccountConfigurations from './AccountConfigurations';
import TextInput from '../../components/ui/inputs/TextInput';
import DropDown from '../../components/ui/inputs/DropDown';
import CheckboxInput from '../../components/ui/inputs/CheckboxInput';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';

const PaymentModesForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
  configurationList,
  setConfigurationList,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();

  // const typeSelect = useMetaFields('iaccount.payment.mode.type.select');
  const inOutSelect = useMetaFields('iaccount.payment.mode.in.out.select');

  const initialValues = {
    name: addNew ? '' : data.name,
    code: addNew ? '' : data.code,
    typeSelect: addNew || !data.typeSelect ? 1 : data.typeSelect,
    inOutSelect: addNew || !data.inOutSelect ? 1 : data.inOutSelect,
    isBankTransactions: false,
  };
  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    // typeSelect: Yup.number().min(1, t('REQUIRED')),
    inOutSelect: Yup.number().min(1, t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (formik.values.isBankTransactions && (!configurationList || (configurationList && configurationList.length === 0)))
      return alertHandler('Error', 'MISSING_ACCOUNT_SITUATIONS');
    setActionInProgress(true);
    let savePayload = {
      data: {
        name: formik.values.name,
        code: formik.values.code,
        typeSelect: Number(formik.values.typeSelect),
        inOutSelect: Number(formik.values.inOutSelect),
        accountManagementList: configurationList,
      },
    };
    if (enableEdit)
      savePayload = {
        data: { ...savePayload.data, id: data.id, version: data.version },
      };
    api('POST', getModelUrl(MODELS.PAYMENTMODES), savePayload, res => {
      setActionInProgress(false);
      if (!res.data || res.data.status !== 0) return finshedSaveHandler('error');
      finshedSaveHandler('success');
    });
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.PAYMENTMODES), payload, res => {
      setActionInProgress(false);
      if (!res.data || res.data.status !== 0) return finshedDeleteHandler('error');
      finshedDeleteHandler('success');
    });
  };

  useEffect(() => {
    if (isSave) saveRecord();
    if (isDelete) deleteRecord();
  }, [isSave, isDelete, addNew, enableEdit]);

  // useEffect(() => {
  //   formik.resetForm({
  //     values: {
  //       ...initialValues,
  //     },
  //   });
  // }, [typeSelect.data]);

  // Inner Table Data
  const [lineData, setLineData] = useState([]);
  const [showNewLine, setShowNewLine] = useState(false);
  const [showEditLine, setShowEditLine] = useState(false);
  const [selectedLine, setSelectedLine] = useState({});
  const [showDeleteConfiguration, setShowDeleteConfiguration] = useState(false);

  const lineHeaders = [t('LBL_BANK_DETAILS'), t('LBL_JOURNAL'), t('LBL_PAYMENT_ACCOUNT')];

  const addLineHandler = () => {
    setSelectedLine(null);
    setShowNewLine(true);
  };

  const editLineHandler = line => {
    setSelectedLine(line);
    setShowEditLine(true);
  };

  const deleteLineHandler = line => {
    setSelectedLine(line);
    setShowDeleteConfiguration(true);
  };

  const openMoreActionHandler = line => {
    setSelectedLine(line);
  };

  useEffect(() => {
    let tempData = [];
    configurationList &&
      configurationList.length > 0 &&
      configurationList.forEach(line => {
        tempData.push({
          isDeleteable: true,
          isEditable: true,
          tableData: [
            { value: line.bankDetails && line.bankDetails.fullName, type: 'text' },
            { value: line.journal && line.journal.name, type: 'text' },
            { value: line.cashAccount && line.cashAccount.label, type: 'text' },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.company && line.company.name,
        });
      });
    if (configurationList && configurationList.length > 0 && !formik.values.isBankTransactions)
      formik.setFieldValue('isBankTransactions', true);
    setLineData(tempData);
  }, [configurationList]);

  return (
    <>
      <div className="col-md-6">
        <TextInput
          formik={formik}
          label="LBL_NAME"
          accessor="name"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-6">
        <TextInput
          formik={formik}
          label="LBL_CODE"
          accessor="code"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      {/* <div className="col-md-6">
        <DropDown
          formik={formik}
          accessor="typeSelect"
          label="LBL_PAYMENT_MODE_TYPE"
          keys={{ valueKey: 'value', titleKey: 'label' }}
          options={typeSelect.list}
          translate={typeSelect.mode === 'enum'}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
          isRequired={true}
          tooltip="paymentModeType"
        />
      </div> */}
      <div className="col-md-6">
        <DropDown
          formik={formik}
          accessor="inOutSelect"
          label="LBL_IN_OUT"
          keys={{ valueKey: 'value', titleKey: 'label' }}
          options={inOutSelect.list}
          translate={inOutSelect.mode === 'enum'}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
          isRequired={true}
          tooltip="inOut"
        />
      </div>
      <div className="col-md-6">
        <CheckboxInput
          formik={formik}
          accessor="isBankTransactions"
          label="CHECK_BANK_TRANSACTIONS"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>
      <InnerTable
        title={t('LBL_ACCOUNTING_CONFIGURATION')}
        pageMode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        onAddNewLine={addLineHandler}
        onEditLine={editLineHandler}
        onDeleteLine={deleteLineHandler}
        onOpenMoreAction={openMoreActionHandler}
        lineHeaders={lineHeaders}
        lineData={lineData}
        alternativeID="lineId"
        isRequired={formik.values.isBankTransactions}
        fieldKey="paymentModeAccountingConfig"
      />
      {showEditLine && (
        <AccountConfigurations
          showConfiguration={showEditLine}
          setShowConfiguration={setShowEditLine}
          checked={selectedLine}
          setChecked={setSelectedLine}
          configurationList={configurationList}
          setConfigurationList={setConfigurationList}
          edit
          data={data}
        />
      )}
      {showNewLine && (
        <AccountConfigurations
          showConfiguration={showNewLine}
          setShowConfiguration={setShowNewLine}
          configurationList={configurationList}
          setConfigurationList={setConfigurationList}
          data={data}
        />
      )}
      {showDeleteConfiguration && (
        <ConfirmationPopup
          onClickHandler={() => {
            let index = configurationList.findIndex(config =>
              config.lineId ? config.lineId === selectedLine.lineId : config.id === selectedLine.id
            );

            if (index !== -1) {
              if (configurationList.length === 1) setSelectedLine(null);
              let tempArr = [...configurationList];
              tempArr.splice(index, 1);
              setSelectedLine(null);
              setConfigurationList([...tempArr]);
            }
          }}
          setConfirmationPopup={setShowDeleteConfiguration}
          item={`1 ${t('DELETE_ONE_ACCOUNTING_CONFIGURATION')}`}
        />
      )}
    </>
  );
};

export default PaymentModesForm;
