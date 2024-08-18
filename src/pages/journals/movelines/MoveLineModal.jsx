import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { SpinnerCircular } from 'spinners-react';

import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import Tabs from '../../../components/ui/inputs/Tabs';
import AnalyticLines from '../../invoices/components/AnalyticLines';
import LineContent from './LineContent';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { checkFlashOrError, parseFloatFixedTwo } from '../../../utils/helpers';
import { getActionUrl, getSearchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { VALID_FLOAT } from '../../../constants/regex/Regex';
import { useTabs } from '../../../hooks/useTabs';
import { analyticDistributionLinesActions } from '../../../store/analyticDistrbution';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { setFieldValue } from '../../../utils/formHelpers';
import { alertsActions } from '../../../store/alerts';

const MoveLineModal = ({
  show,
  setShow,
  line,
  mode,
  formik,
  addFormikValuesToPayload,
  addTotalsToPayload,
  confirmMoveLine,
  onCancel,
  isLoading,
  setIsLoading,
  hidePartnerColumn,
}) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const tabsProps = useTabs();

  let analyticMoveLineList = useSelector(state => state.analyticDistributionLines.analyticDistributionLines);

  const alertHandler = message => {
    setIsLoading(false);
    setSubmitDisabled(false);
    dispatch(alertsActions.initiateAlert({ message }));
  };

  const [validateError, setValidateError] = useState(false);
  const [isSubmitDisabled, setSubmitDisabled] = useState(false);

  const initialValues = {
    partner: line?.partner ?? null,
    account: line?.account ?? null,
    currencyAmount: parseFloatFixedTwo(line?.currencyAmount ?? 0),
    currencyRate: parseFloatFixedTwo(line?.currencyRate ?? 0),
    debit: parseFloatFixedTwo(line?.debit ?? 0),
    credit: parseFloatFixedTwo(line?.credit ?? 0),
    description: line?.description || '',
    tax: line?.taxLine?.name || '',
    analyticMoveLineList: line?.analyticMoveLineList || [],
  };

  const validationSchema = Yup.object({
    account: Yup.object().nullable().required(t('LBL_ACCOUNT_REQUIRED')),
    partner: Yup.object().nullable(),
    currencyAmount: Yup.number(),
    currencyRate: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
    debit: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
    credit: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
    description: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
  });

  const lineFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: mode === 'add' ? true : false,
  });

  const isSumEqualHundred = () => {
    let percent = 0;
    analyticMoveLineList.map(line => (percent = percent + parseFloat(line.percentage)));
    return !(percent > 100 || percent < 100);
  };

  const submit = () => {
    setIsLoading(true);
    isSumEqualHundred();

    if (lineFormik.values.account?.analyticDistributionAuthorized) {
      if (analyticMoveLineList.length === 0) {
        return alertHandler('LBL_ANALYTICS_REQUIRED');
      }

      if (analyticMoveLineList.length === 0 && validateError) {
        return alertHandler('LBL_ANALYTICS_REQUIRED');
      }

      if (!isSumEqualHundred()) {
        return alertHandler('LBL_ANALYTICS_MUST_BE_EQUAL_HUNDRED');
      }
    }

    if (lineFormik.isValid && (parseFloat(lineFormik.values.debit) > 0 || parseFloat(lineFormik.values.credit) > 0)) {
      let tempLine = { ...line };
      tempLine.partner = lineFormik.values.partner;
      tempLine.account = lineFormik.values.account;
      tempLine.currencyAmount = lineFormik.values.currencyAmount;
      tempLine.currencyRate = lineFormik.values.currencyRate;
      tempLine.debit = lineFormik.values.debit;
      tempLine.credit = lineFormik.values.credit;
      tempLine.description = lineFormik.values.description;
      tempLine.analyticMoveLineList = analyticMoveLineList;

      confirmMoveLine(tempLine);
    } else {
      return alertHandler('LBL_REQUIRED_FIELDS');
    }
  };

  useEffect(() => {
    fetchAnalyticLines();
    tabsProps.setShowTabsContent(true);
  }, []);

  const getCreditDebitPayload = (model, action, creditValue, debitValue) => {
    let payload = {
      model: model,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: model,
          id: line.id ?? null,
          account: lineFormik.values.account,
          partner: lineFormik.values.partner,
          amountPaid: '0.0',
          counter: 0,
          credit: creditValue ?? lineFormik.values.credit,
          currencyAmount: lineFormik.values.currencyAmount,
          currencyRate: lineFormik.values.currencyRate,
          debit: debitValue ?? lineFormik.values.debit,
          isOtherCurrency: false,
          date: line.date,
          description: lineFormik.values.description,
          _form: true,
          _parent: {
            _isActivateSimulatedMoves: null,
            _id: null,
            statusSelect: 1,
            technicalOriginSelect: 1,
            moveLineList: formik.values.moveLineList,
            paymentMode: formik.values.paymentMode,
            id: formik.values.id ?? null,
            reference: formik.values.reference ?? null,
            journalTechnicalTypeSelect: 5,
            validatePeriod: false,
            companyCurrencyCodeIso: 'SAR',
            _model: MODELS.MOVE,
          },
        },
      },
    };
    payload.data.context['_parent'] = addFormikValuesToPayload(payload.data.context['_parent']);
    payload.data.context['_parent'] = addTotalsToPayload(payload.data.context['_parent']);
    return payload;
  };

  const onDebitChange = async debit => {
    let model = MODELS.MOVELINE;
    let action = 'action-record-account-moveline-debit-onchange,action-group-account-moveline-debitcredit-onchange';
    let payload = getCreditDebitPayload(model, action, null, debit);
    setFieldValue(lineFormik, 'debit', debit);
    setSubmitDisabled(true);
    const response = await api('POST', getActionUrl(), payload);
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('LBL_ERROR_ADDING_DEBIT');

    if (data && checkFlashOrError(data)) {
      return alertHandler('LBL_ERROR_ADDING_DEBIT');
    }

    if (data) {
      let tempData = data.find(el => el.values && 'currencyAmount' in el.values);
      setFieldValue(lineFormik, 'currencyAmount', tempData?.values?.currencyAmount ?? 0);
      let tempCredit = data.find(el => el.values && 'credit' in el.values);
      setFieldValue(lineFormik, 'credit', tempCredit?.values?.credit ?? 0);
      setSubmitDisabled(false);
    }
  };

  const onCreditChange = async credit => {
    let model = MODELS.MOVELINE;
    let action = 'action-record-account-moveline-credit-onchange,action-group-account-moveline-debitcredit-onchange';
    let payload = getCreditDebitPayload(model, action, credit, null);
    setFieldValue(lineFormik, 'credit', credit);
    setSubmitDisabled(true);
    const response = await api('POST', getActionUrl(), payload);
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('LBL_ERROR_ADDING_CREDIT');

    if (data && checkFlashOrError(data)) {
      return alertHandler('LBL_ERROR_ADDING_CREDIT');
    }

    if (data) {
      let tempData = data.find(el => el.values && 'currencyAmount' in el.values);
      setFieldValue(lineFormik, 'currencyAmount', tempData?.values?.currencyAmount ?? 0);
      let tempDebit = data.find(el => el.values && 'debit' in el.values);
      setFieldValue(lineFormik, 'debit', tempDebit?.values?.debit ?? 0);
      setSubmitDisabled(false);
    }
  };

  const analyticLinesSearchPayload = () => {
    let payload = {
      fields: [
        'analyticJournal',
        'originalPieceAmount',
        'date',
        'amount',
        'accountType',
        'percentage',
        'analyticAccount',
        'analyticAxis',
        'project',
        'typeSelect',
      ],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: line.id,
          _model: MODELS.MOVELINE,
          _field: 'analyticMoveLineList',
          _field_ids: line.analyticMoveLineList.map(line => line.id),
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const fetchAnalyticLines = async () => {
    if (!line.id && line?.analyticMoveLineList?.length > 0) {
      dispatch(
        analyticDistributionLinesActions.setLines({
          analyticDistributionLines: line.analyticMoveLineList,
        })
      );
    }

    if (line.id && line.analyticMoveLineList && line.analyticMoveLineList.length > 0) {
      let response = await api('POST', getSearchUrl(MODELS.ANALYTICMOVELINE), analyticLinesSearchPayload());
      let status = response?.data?.status;
      let data = response?.data?.data;
      let total = response?.data?.total;

      if (status !== 0 || total === undefined || total === null) {
        return alertHandler('LBL_ERROR_LOADING_ANALYTIC_MOVE_LINES');
      }

      if (!data) {
        dispatch(
          analyticDistributionLinesActions.setLines({
            analyticDistributionLines: [],
          })
        );
        return;
      }

      if (data) {
        let tempAnalyticLines = [];
        data.forEach(line => {
          let tempLine = {
            lineId: uuidv4(),
            ...line,
          };
          tempAnalyticLines.push(tempLine);
        });
        dispatch(
          analyticDistributionLinesActions.setLines({
            analyticDistributionLines: tempAnalyticLines,
          })
        );
        let tempMoveLine = { ...line };
        tempMoveLine.analyticMoveLineList = tempAnalyticLines;
        setFieldValue(lineFormik, 'analyticMoveLineList', tempAnalyticLines);
      }
    }
  };

  const isFormikValid = () => {
    return lineFormik.isValid && (parseFloat(lineFormik.values.debit) > 0 || parseFloat(lineFormik.values.credit) > 0);
  };

  const changeAnalyticAmount = () => {
    let amount =
      parseFloat(lineFormik.values.credit) >= parseFloat(lineFormik.values.debit) ? lineFormik.values.credit : lineFormik.values.debit;

    if (analyticMoveLineList && analyticMoveLineList.length > 0) {
      analyticMoveLineList.forEach(line => {
        if (line?.lineId) {
          dispatch(
            analyticDistributionLinesActions.editLine({
              id: line.lineId,
              analyticDistributionLine: {
                ...line,
                amount: ((line.percentage / 100.0) * amount).toFixed(2).toString(),
              },
            })
          );
        }
      });
    }
  };

  useEffect(() => {
    changeAnalyticAmount();
  }, [lineFormik.values.debit, lineFormik.values.credit]);

  return (
    <>
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
            {t('LBL_MOVE_LINE')}
          </h5>
        </Modal.Header>
        <Modal.Body>
          {isLoading && (
            <div className="text-center">
              <SpinnerCircular
                size={70}
                thickness={120}
                speed={100}
                color="rgba(31, 79, 222, 1)"
                secondaryColor="rgba(153, 107, 229, 0.19)"
              />
            </div>
          )}
          {!isLoading && (
            <Tabs
              {...tabsProps}
              tabsList={[
                { accessor: 'content', label: 'LBL_CONTENT' },
                {
                  accessor: 'analytics',
                  label: 'LBL_ANALYTICS',
                  isHidden: !lineFormik.values.account || (mode !== 'view' && !lineFormik.values.account?.analyticDistributionAuthorized),
                  isConditional: mode !== 'view',
                  isEnabled: isFormikValid(),
                  isDisabledFn: () => {
                    if (parseFloat(lineFormik.values.debit) === 0 && parseFloat(lineFormik.values.credit) === 0)
                      alertHandler('LBL_CREDIT_DEBIT_REQUIRED');
                    else alertHandler('LBL_REQUIRED_FIELDS');
                  },
                },
              ]}
              isModal={true}
            >
              <LineContent
                accessor="content"
                lineFormik={lineFormik}
                mode={mode}
                line={line}
                onCreditChange={onCreditChange}
                onDebitChange={onDebitChange}
                hidePartnerColumn={hidePartnerColumn}
              />
              <AnalyticLines
                accessor="analytics"
                mode={mode}
                hasOriginal={mode === 'view'}
                lineAmount={
                  parseFloat(lineFormik.values.credit) >= parseFloat(lineFormik.values.debit)
                    ? lineFormik.values.credit
                    : lineFormik.values.debit
                }
                type="journal"
                setValidateError={setValidateError}
                showDistrubuteByQty={false}
                qty={null}
                alertHandler={alertHandler}
              />
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="float-end">
            <PrimaryButton
              theme="white"
              disabled={isLoading}
              onClick={() => {
                if (onCancel) {
                  onCancel(line);
                }

                setShow(false);
              }}
            />
            {mode !== 'view' && <PrimaryButton theme="purple" disabled={isLoading || isSubmitDisabled} onClick={submit} />}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MoveLineModal;
