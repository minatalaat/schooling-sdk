import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { PartnerAccountsActions } from '../../../store/partnerAccounts';
import { setFieldValue, setAllValues } from '../../../utils/formHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';
import { hasValue } from '../../../utils/helpers';

let companyObj;
let customerAccountObj;
let supplierAccountObj;

function AccountSituation({ show, setShow, edit, selectedLine, isSupplier, isCustomer }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  let company = useSelector(state => state.userFeatures.companyInfo.company);

  const commonPositionTypeEnum = {
    0: 'None',
    1: 'Credit',
    2: 'Debit',
  };
  const statusEnum = {
    0: 'Not Active',
    1: 'Active',
  };

  const initAccountingValues = {
    partnerTypeSelect: '',
    supplierAccount: null,
    customerAccount: null,
    defaultIncomeAccount: '',
    defaultExpenseAccount: '',
  };

  const valSchema2 = Yup.object().shape({
    partnerTypeSelect: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .required(t('COMPANY_NAME_VALIDATION_MESSAGE')),
    customerAccount: isCustomer ? Yup.object().required(t('CUSTOMER_ACCOUNT_VALIDATION_MESSAGE')).nullable() : Yup.object().nullable(),
    supplierAccount: isSupplier ? Yup.object().required(t('SUPPLIER_ACCOUNT_VALIDATION_MESSAGE')).nullable() : Yup.object().nullable(),
    defaultIncomeAccount: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim(),
    defaultExpenseAccount: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim(),
  });

  const formik2 = useFormik({
    initialValues: initAccountingValues,
    validationSchema: valSchema2,
    validateOnMount: true,
  });

  const onAccountsSuccess = response => {
    if (
      response?.data?.status !== 0 ||
      response?.data?.total === undefined ||
      response?.data?.total === null ||
      response?.data?.total === 0
    )
      return { displayedData: [], total: 0 };

    let data = response.data.data;
    let accounts = [];

    if (data) {
      data.forEach(account => {
        let obj = {
          id: account ? (account.id ? account.id : '') : '',
          label: account?.label ?? '',
          code: account?.code ?? '',
          name: account?.name ?? '',
          accountType: account?.accountType?.name ?? '',
          commonPosition: account?.commonPosition ? commonPositionTypeEnum[account.commonPosition] : '',
          reconcilable: account?.reconcileOk ? 'Yes' : 'No',
          parentAccount: account?.parentAccount?.label ?? '',
          status: account?.statusSelect ? statusEnum[account.statusSelect] : 'Not Active',
          company: company.name,
        };
        accounts.push(obj);
      });
    }

    return { displayedData: [...accounts], total: response.data.total || 0 };
  };

  const handleAddNewLine = () => {
    if (formik2.isValid) {
      companyObj = company;
      customerAccountObj = formik2.values.customerAccount;
      supplierAccountObj = formik2.values.supplierAccount;

      if (edit) {
        dispatch(
          PartnerAccountsActions.editLine({
            id: selectedLine.lineId,
            partnerAccount: {
              lineId: selectedLine.lineId,
              usedCredit: selectedLine.usedCredit.toString(),
              acceptedCredit: selectedLine.acceptedCredit.toString(),
              balanceDueCustAccount: selectedLine.balanceDueCustAccount.toString(),
              'debtRecovery.balanceDueDebtRecovery': selectedLine.balanceDueDebtRecoveryCustAccount.toString(),
              invoiceAutomaticMailOnValidate: false,
              'company.accountConfig.isManagePassedForPayment': false,
              balanceCustAccount: selectedLine.balanceCustAccount.toString(),
              invoiceAutomaticMail: false,
              balanceDueDebtRecoveryCustAccount: selectedLine.balanceDueDebtRecoveryCustAccount.toString(),
              company: companyObj
                ? {
                    id: companyObj ? (companyObj.id ? companyObj.id : -1) : -1,
                    name: companyObj ? (companyObj.name ? companyObj.name : '') : '',
                    code: companyObj ? (companyObj.code ? companyObj.code : '') : '',
                  }
                : null,
              customerAccount: customerAccountObj
                ? {
                    id: customerAccountObj ? (customerAccountObj.id ? customerAccountObj.id : -1) : -1,
                    code: customerAccountObj ? (customerAccountObj.code ? customerAccountObj.code : '') : '',
                    name: customerAccountObj ? (customerAccountObj.label ? customerAccountObj.label : '') : '',
                    label: customerAccountObj ? (customerAccountObj.label ? customerAccountObj.label : '') : '',
                  }
                : null,
              supplierAccount: supplierAccountObj
                ? {
                    id: supplierAccountObj ? (supplierAccountObj.id ? supplierAccountObj.id : -1) : -1,
                    code: supplierAccountObj ? (supplierAccountObj.code ? supplierAccountObj.code : '') : '',
                    name: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                    label: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                  }
                : null,
              selected: true,
              id: selectedLine && selectedLine.id && selectedLine.id !== -1 ? selectedLine.id : null,
              version: selectedLine && selectedLine.version && selectedLine.version !== -1 ? selectedLine.version : null,
            },
          })
        );
        setShow(false);
      } else {
        dispatch(
          PartnerAccountsActions.addLine({
            partnerAccount: {
              lineId: Math.floor(Math.random() * 100).toString(),
              usedCredit: '0',
              acceptedCredit: '0',
              balanceDueCustAccount: '0',
              'debtRecovery.balanceDueDebtRecovery': '0',
              invoiceAutomaticMailOnValidate: false,
              'company.accountConfig.isManagePassedForPayment': false,
              balanceCustAccount: '0',
              invoiceAutomaticMail: false,
              balanceDueDebtRecoveryCustAccount: '0',
              company: {
                id: companyObj.id,
                name: companyObj.name,
                code: companyObj.code,
              },
              customerAccount:
                customerAccountObj && customerAccountObj.id && customerAccountObj.id !== -1
                  ? {
                      id: customerAccountObj.id,
                      code: customerAccountObj.code ? customerAccountObj.code : '',
                      name: customerAccountObj.label ? customerAccountObj.label : '',
                      label: customerAccountObj.label ? customerAccountObj.label : '',
                    }
                  : null,
              supplierAccount:
                supplierAccountObj && supplierAccountObj.id && supplierAccountObj.id !== -1
                  ? {
                      id: supplierAccountObj ? (supplierAccountObj.id ? supplierAccountObj.id : -1) : -1,
                      code: supplierAccountObj ? (supplierAccountObj.code ? supplierAccountObj.code : '') : '',
                      name: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                      label: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                    }
                  : null,
              selected: true,
              id: selectedLine && selectedLine.id && selectedLine.id !== -1 ? selectedLine.id : null,
              version: selectedLine && selectedLine.version && selectedLine.version !== -1 ? selectedLine.version : null,
            },
          })
        );
        setShow(false);
      }
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
    }
  };

  const handleEditLine = () => {
    if (formik2.isValid) {
      companyObj = company;
      customerAccountObj = formik2.values.customerAccount;
      supplierAccountObj = formik2.values.supplierAccount;

      if (edit) {
        dispatch(
          PartnerAccountsActions.editLine({
            id: selectedLine.lineId,
            partnerAccount: {
              lineId: selectedLine.lineId,
              usedCredit: selectedLine.usedCredit.toString(),
              acceptedCredit: selectedLine.acceptedCredit.toString(),
              balanceDueCustAccount: selectedLine.balanceDueCustAccount.toString(),
              'debtRecovery.balanceDueDebtRecovery': selectedLine.balanceDueDebtRecoveryCustAccount.toString(),
              invoiceAutomaticMailOnValidate: false,
              'company.accountConfig.isManagePassedForPayment': false,
              balanceCustAccount: selectedLine.balanceCustAccount.toString(),
              invoiceAutomaticMail: false,
              balanceDueDebtRecoveryCustAccount: selectedLine.balanceDueDebtRecoveryCustAccount.toString(),
              company: companyObj
                ? {
                    id: companyObj ? (companyObj.id ? companyObj.id : -1) : -1,
                    name: companyObj ? (companyObj.name ? companyObj.name : '') : '',
                    code: companyObj ? (companyObj.code ? companyObj.code : '') : '',
                  }
                : null,
              customerAccount: customerAccountObj
                ? {
                    id: customerAccountObj ? (customerAccountObj.id ? customerAccountObj.id : -1) : -1,
                    code: customerAccountObj ? (customerAccountObj.code ? customerAccountObj.code : '') : '',
                    name: customerAccountObj ? (customerAccountObj.label ? customerAccountObj.label : '') : '',
                    label: customerAccountObj ? (customerAccountObj.label ? customerAccountObj.label : '') : '',
                  }
                : null,
              supplierAccount: supplierAccountObj
                ? {
                    id: supplierAccountObj ? (supplierAccountObj.id ? supplierAccountObj.id : -1) : -1,
                    code: supplierAccountObj ? (supplierAccountObj.code ? supplierAccountObj.code : '') : '',
                    name: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                    label: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                  }
                : null,
              selected: true,
              id: selectedLine.id && selectedLine.id !== -1 ? selectedLine.id : null,
              version: selectedLine.version && selectedLine.version !== -1 ? selectedLine.version : null,
            },
          })
        );
        setShow(false);
      } else {
        dispatch(
          PartnerAccountsActions.addLine({
            partnerAccount: {
              lineId: Math.floor(Math.random() * 100).toString(),
              usedCredit: '0',
              acceptedCredit: '0',
              balanceDueCustAccount: '0',
              'debtRecovery.balanceDueDebtRecovery': '0',
              invoiceAutomaticMailOnValidate: false,
              'company.accountConfig.isManagePassedForPayment': false,
              balanceCustAccount: '0',
              invoiceAutomaticMail: false,
              balanceDueDebtRecoveryCustAccount: '0',
              company: {
                id: companyObj.id,
                name: companyObj.name,
                code: companyObj.code,
              },
              customerAccount:
                customerAccountObj && customerAccountObj.id && customerAccountObj.id !== -1
                  ? {
                      id: customerAccountObj.id,
                      code: customerAccountObj.code ? customerAccountObj.code : '',
                      name: customerAccountObj.label ? customerAccountObj.label : '',
                      label: customerAccountObj.label ? customerAccountObj.label : '',
                    }
                  : null,
              supplierAccount:
                supplierAccountObj && supplierAccountObj.id && supplierAccountObj.id !== -1
                  ? {
                      id: supplierAccountObj ? (supplierAccountObj.id ? supplierAccountObj.id : -1) : -1,
                      code: supplierAccountObj ? (supplierAccountObj.code ? supplierAccountObj.code : '') : '',
                      name: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                      label: supplierAccountObj ? (supplierAccountObj.label ? supplierAccountObj.label : '') : '',
                    }
                  : null,
              selected: true,
              id: selectedLine && selectedLine.id && selectedLine.id !== -1 ? selectedLine.id : null,
              version: selectedLine && selectedLine.version && selectedLine.version !== -1 ? selectedLine.version : null,
            },
          })
        );
        setShow(false);
      }
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
    }
  };

  useEffect(() => {
    if (edit) {
      setAllValues(formik2, {
        partnerTypeSelect: selectedLine?.company?.id ? parseInt(selectedLine.company.id) : '',
        customerAccount: isCustomer ? selectedLine.customerAccount || null : null,
        supplierAccount: isSupplier ? selectedLine.supplierAccount || null : null,
        defaultIncomeAccount: selectedLine?.defaultIncomeAccount
          ? selectedLine['defaultIncomeAccount.name'] ?? selectedLine['defaultIncomeAccount']['name'] ?? ''
          : '',
        defaultExpenseAccount: selectedLine?.defaultExpenseAccount
          ? selectedLine['defaultExpenseAccount.name'] ?? selectedLine['defaultExpenseAccount']['name'] ?? ''
          : '',
      });
    }
  }, []);

  useEffect(() => {
    setFieldValue(formik2, 'partnerTypeSelect', company.id);
  }, []);

  return (
    <Modal
      id="add-new-line"
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <h5 className="modal-title" id="add-new-line">
          {t('LBL_ACCOUNTING_CONFIGURATION')}
        </h5>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <form onSubmit={formik2.handleSubmit}>
          <div className="row">
            {isCustomer && hasValue(formik2.values.partnerTypeSelect) && (
              <div className="col-md-12">
                <SearchModalAxelor
                  formik={formik2}
                  modelKey="CUSTOMER_ACCOUNTS"
                  mode="add"
                  isRequired={true}
                  onSuccess={onAccountsSuccess}
                  tooltip="customerAccount"
                  payloadDomain={`self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect ='receivable'`}
                  selectIdentifier="label"
                />
              </div>
            )}
          </div>
          {isSupplier && hasValue(formik2.values.partnerTypeSelect) && (
            <div className="row">
              <div className="col-md-12">
                <SearchModalAxelor
                  formik={formik2}
                  modelKey="SUPPLIER_ACCOUNTS"
                  mode="add"
                  isRequired={true}
                  onSuccess={onAccountsSuccess}
                  tooltip="supplierAccount"
                  payloadDomain={`self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect ='payable'`}
                  selectIdentifier="label"
                />
              </div>
            </div>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <Button className="btn cancel-act" onClick={() => setShow(false)}>
            {t('LBL_CLOSE')}
          </Button>

          <Button
            className="btn add-btn"
            onClick={
              edit
                ? () => {
                    handleEditLine();
                  }
                : () => {
                    handleAddNewLine();
                  }
            }
            type="submit"
          >
            {t('LBL_OK')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AccountSituation;
