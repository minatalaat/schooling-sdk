import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { useSelector } from 'react-redux';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../components/ui/inputs/TextInput';
import BorderSection from '../../components/ui/inputs/BorderSection';
import ValueCard from '../../components/ui/inputs/ValueCard';
import FormNotes from '../../components/ui/FormNotes';
import ToggleSwitch from '../../components/ui/inputs/ToggleSwitch';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getRemoveAllUrl } from '../../services/getUrl';
import { NUMBERS_ONLY, VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { setFieldValue } from '../../utils/formHelpers';
import { useFinancialAccountsServices } from '../../services/apis/useFinancialAccountsServices';
import { checkFlashOrError, formatFloatNumber } from '../../utils/helpers';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { useFeatures } from '../../hooks/useFeatures';

const FinancialAccountForm = ({
  enableEdit,
  data,
  balance,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { fetchAccountBalanceService, fetchFinancialAccountService, saveFinancialAccountService } = useFinancialAccountsServices();
  const { isFeatureAvailable } = useFeatures();
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  const company = useSelector(state => state.userFeatures.companyInfo.company);
  const isCostCenterFeatureAvailable = isFeatureAvailable({ featureCode: '13' });

  const initialValues = {
    name: addNew ? '' : data.name,
    code: addNew ? '' : data.code,
    accountType: data?.accountType || null,
    commonPosition: 0 ,
    parentAccount: data?.parentAccount || null,
    useForPartnerBalance: addNew ? false : data.useForPartnerBalance,
    reconcileOk: false,
    isTaxAuthorizedOnMoveLine: addNew ? false : data.isTaxAuthorizedOnMoveLine,
    statusSelect: addNew ? 0 : Number(data.statusSelect),
    isTaxRequiredOnMoveLine: addNew ? false : data.isTaxAuthorizedOnMoveLine,
    defaultTax: data?.defaultTax || null,
    analyticDistributionAuthorized: addNew ? false : data.analyticDistributionAuthorized,
    parentAccountStatus: 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    code: Yup.string().matches(NUMBERS_ONLY, t('BUILDING_NUMBER_VALIDATION')).required(t('REQUIRED')).trim(),
    accountType: Yup.object().nullable().required(t('REQUIRED')),
  });

  const saveRecord = async () => {
    if (!formik.isValid) return alertHandler('Error', t('INVALID_FORM'));

    setActionInProgress(true);

    if (formik.values.parentAccount?.id && formik.values.parentAccountStatus === 1) {
      const accountResponseData = await fetchFinancialAccountService(formik.values.parentAccount.id);

      const balanceResponse = await fetchAccountBalanceService(accountResponseData.data[0]);

      if (!balanceResponse || balanceResponse.status !== 0 || !balanceResponse.data) {
        setActionInProgress(false);
        return finshedSaveHandler('error');
      }

      if (checkFlashOrError(balanceResponse.data)) {
        setActionInProgress(false);
        return finshedSaveHandler('error');
      }

      let balance = balanceResponse?.data?.accountOpeningBalance;

      if (!(Number(balance) === 0)) {
        setActionInProgress(false);
        return finshedSaveHandler('error', 'ERROR_PARENT_ACCOUNT_HAVE_BALANCE');
      }

      const parentResponse = await saveFinancialAccountService({
        data: { id: accountResponseData.data[0].id, version: accountResponseData.data[0].version, statusSelect: 0 },
      });

      if (!(parentResponse?.status === 0)) {
        setActionInProgress(false);
        return finshedSaveHandler('error');
      }
    }

    let payload = { ...formik.values };

    payload.accountType = formik.values.accountType
      ? formik.values.accountType
      : formik.values.accountType === null
        ? data?.accountType || null
        : null;

    payload.company = company;

    payload.defaultTax = formik.values.defaultTax
      ? formik.values.defaultTax
      : formik.values.defaultTax === null
        ? data?.defaultTax || null
        : null;

    if (!payload.isTaxAuthorizedOnMoveLine) payload.isTaxRequiredOnMoveLine = false;

    payload.parentAccount = formik.values.parentAccount || null;

    payload.commonPosition = Number(payload.commonPosition);
    payload.statusSelect = Number(payload.statusSelect);

    payload.analyticDistributionAuthorized = formik.values.analyticDistributionAuthorized;
    payload.analyticDistributionRequiredOnMoveLines = false;
    payload.analyticDistributionRequiredOnInvoiceLines = false;
    let savePayload = { data: { ...payload } };
    if (enableEdit)
      savePayload = {
        data: { ...payload, id: data.id, version: data.version },
      };

    const accountResponse = await saveFinancialAccountService(savePayload);

    setActionInProgress(false);
    if (!(accountResponse?.status === 0)) return finshedSaveHandler('error');
    finshedSaveHandler('success');
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
    onSubmit: saveRecord,
  });

  const { handleFormikSubmit } = useFormikSubmit(formik, alertHandler);

  const parentAccountCheckHandler = value => {
    if (value?.statusSelect === 1) {
      alertHandler('Warning', t('WARNING_PARENT_ACCOUNT_ACTIVE'));
    }

    setFieldValue(formik, 'parentAccountStatus', value?.statusSelect || 0);
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.ACCOUNT), payload, res => {
      setActionInProgress(false);
      if (res.data.status !== 0) return finshedDeleteHandler('error');
      finshedDeleteHandler('success');
    });
  };

  useEffect(() => {
    if (addNew) {
      if (formik.values.parentAccount && formik.values.parentAccount !== '') {
        setFieldValue(formik, 'statusSelect', 1);
      } else {
        setFieldValue(formik, 'statusSelect', 0);
      }
    }

    if (isSave) handleFormikSubmit();
    if (isDelete) deleteRecord();
  }, [isSave, isDelete, addNew, enableEdit, formik.values.parentAccount]);

  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <ButtonGroup className="w-75 mb-5">
            <ToggleButton
              key="radio1"
              id="radio-1"
              type="radio"
              variant={formik.values.statusSelect === 1 ? 'primary' : 'light'}
              className={formik.values.statusSelect === 1 ? 'text-light' : 'text-primary'}
              name="radio"
              value={1}
              disabled={true}
              checked={formik.values.statusSelect === 1}
              onChange={() => setFieldValue(formik, 'statusSelect', 1)}
            >
              {t('ACTIVE')}
            </ToggleButton>
            <ToggleButton
              key="radio2"
              id="radio-2"
              type="radio"
              variant={formik.values.statusSelect === 0 ? 'primary' : 'light'}
              className={formik.values.statusSelect === 0 ? 'text-light' : 'text-primary'}
              name="radio"
              value={0}
              disabled={true}
              checked={formik.values.statusSelect === 0}
              onChange={() => setFieldValue(formik, 'statusSelect', 0)}
            >
              {t('INACTIVE')}
            </ToggleButton>
          </ButtonGroup>
        </div>
        <div className="col-md-6 d-flex justify-content-end">
          {balance && !addNew && !enableEdit && (
            <ValueCard linkTo={`/transactions/${data.id}/account`} title="LBL_BALANCE" content={formatFloatNumber(balance)} />
          )}
        </div>
      </div>
      <div className="col-md-4">
        <TextInput formik={formik} label="LBL_CODE" accessor="code" mode={mode} isRequired={true} />
      </div>

      <div className="col-md-4">
        <TextInput formik={formik} label="LBL_NAME" accessor="name" mode={mode} isRequired={true} />
      </div>

      <BorderSection title="LBL_SETTINGS" />

      <div className="col-md-3">
        <SearchModalAxelor
          formik={formik}
          modelKey="ACCOUNT_TYPES"
          mode={mode}
          tooltip="accountType"
          isRequired={true}
          defaultValueConfig={null}
          extraFields={['technicalTypeSelect']}
        />
      </div>

      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="PARENT_ACCOUNTS"
          mode={mode}
          tooltip="parentAccount"
          selectIdentifier="label"
          defaultValueConfig={null}
          selectCallback={parentAccountCheckHandler}
          extraFields={['statusSelect']}
        />
      </div>
      <div className="col-md-4">
        <ToggleSwitch formik={formik} label="ACCOUNT.USE_FOR_PARTNER_BALANCE" accessor="useForPartnerBalance" mode={mode} />
      </div>

      {isCostCenterFeatureAvailable && !!+formik.values.statusSelect && (
        <>
          <BorderSection title="LBL_COST_ACCOUNTING_SETTINGS" />
          <div className="col-md-6">
            <ToggleSwitch
              formik={formik}
              label="LBL_REQUIRED_ON_MOVELINES_AND_INVOICE_LINES"
              accessor="analyticDistributionAuthorized"
              mode={mode}
            />
          </div>
        </>
      )}
      {(addNew || enableEdit) && (
        <FormNotes
          notes={[
            {
              title: 'LBL_REQUIRED_NOTIFY',
              type: 3,
            },
          ]}
        />
      )}
    </>
  );
};

export default FinancialAccountForm;
