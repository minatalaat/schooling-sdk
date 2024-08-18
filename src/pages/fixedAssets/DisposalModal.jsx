import { useEffect, useState, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { SpinnerCircular } from 'spinners-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import DateInput from '../../components/ui/inputs/DateInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import ErrorMessage from '../../components/ui/inputs/ErrorMessage';
import CloseButton from '../../components/ui/buttons/CloseButton';
import PurpleSaveButton from '../../components/ui/buttons/PurpleSaveButton';
import NumberInput from '../../components/ui/inputs/NumberInput';
import CheckboxInput from '../../components/ui/inputs/CheckboxInput';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getSearchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { checkFlashOrError } from '../../utils/helpers';
import { useFeatures } from '../../hooks/useFeatures';
import { setFieldValue } from '../../utils/formHelpers';
import { useDepreciationServices } from '../../services/apis/useDepreciationServices';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

function DisposalModal({ mode = 'edit', show, setShow, header, parentContext, fetchFixedAsset }) {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSETS';

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [disposalReasonsOptions, setDisposalReasonsOptions] = useState(null);
  const [minDisposalDate, setMinDisposalDate] = useState(moment(new Date()));

  const alertHandler = (title, message) => {
    setIsLoading(false);
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const { getFeaturePath } = useFeatures(feature, subFeature);
  const depreciationLines = useSelector(state => state.depreciationLines.depreciationLines);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { api } = useAxiosFunction();
  const { bulkRealizeService } = useDepreciationServices(alertHandler);

  const depreciationDates = useMemo(() => {
    return depreciationLines?.map(line => moment(line.depreciationDate).locale('en').format('YYYY-MM-DD')) || null;
  }, [depreciationLines]);

  const disposalTypesOptions = [
    {
      name: 'Scrap',
      value: '1',
    },
    {
      name: 'Sales',
      value: '2',
    },
  ];
  const initVals = {
    disposalDate: '',
    disposalType: '',
    disposalReason: '',
    salePriceWithoutTax: 0.0,
    saleMove: false,
    tax: null,
  };

  const valSchema = Yup.object({
    disposalDate: Yup.date(t('VALID_DATE_FORMAT'))
      .required(t('REQUIRED'))
      .min(minDisposalDate, t('DISPOSAL_MIN_DATE_VALIDATION'))
      .test('not-in-array', t('LBL_DISPOSAL_DATE_NOT_EQUAL_DEPRECIATION_DATE'), function (value) {
        return !depreciationDates.includes(moment(value).locale('en').format('YYYY-MM-DD'));
      }),
    disposalType: Yup.string().trim().required(t('REQUIRED')),
    disposalReason: Yup.string().trim().required(t('REQUIRED')),
    salePriceWithoutTax: Yup.number().when('disposalType', {
      is: '2',
      then: Yup.number().required(t('REQUIRED')).min(0.01, t('LOGIN_PASSWORD_LIMIT_VALIDATION_MESSAGE')),
    }),
    tax: Yup.object()
      .nullable()
      .when('saleMove', {
        is: true,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler, 'modal');

  const getDisposalReasonsPayload = () => {
    return {
      data: {
        _domain: `self.disposalTypeSelect = ${parseInt(formik.values.disposalType)}`,
        _domainContext: {
          _fixedAsset: parentContext,
          _id: parentContext?.id || null,
          qty: '1.00',
          disposalTypeSelect: parseInt(formik.values.disposalType),
          disposalQtySelect: 1,
          disposalDate: moment(formik.values.disposalDate).locale('en').format('YYYY-MM-DD'),
          originalQty: '1.00',
          _model: MODELS.FIXED_ASSET,
        },
      },
    };
  };

  const getDisposalReasons = async () => {
    const getDisposalReasonsResponse = await api('POST', getSearchUrl(MODELS.ASSET_DISPOSAL_REASON), getDisposalReasonsPayload());

    if (getDisposalReasonsResponse.data.status === 0) {
      let data = getDisposalReasonsResponse.data.data;
      let tempData = [];

      if (data) {
        data.forEach(item => {
          tempData.push({
            name: item.name,
            value: item.id,
          });
        });
      }

      setDisposalReasonsOptions(tempData);
    } else {
    }
  };

  useEffect(() => {
    if (formik.values.disposalType !== '') {
      getDisposalReasons();
    }
  }, [formik.values.disposalType]);

  useEffect(() => {
    if (!formik.values.saleMove) {
      setFieldValue(formik, 'tax', null);
    }
  }, [formik.values.saleMove]);

  const getOnAccountClickPayload = (action, move) => {
    let payload = {
      model: MODELS.MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          id: move.id,
        },
      },
    };
    return payload;
  };

  const getDisposalFirstActionPayload = action => {
    let payload = {
      model: MODELS.FIXED_ASSET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET,
          _fixedAsset: {
            acquisitionDate: parentContext?.acquisitionDate || null,
            ifrsDegressiveCoef: parentContext && parentContext.ifrsDegressiveCoef !== null ? parentContext.ifrsDegressiveCoef : null,
            depreciationPlanSelect: '2',
            ifrsNbrOfPastDepreciations:
              parentContext && parentContext.ifrsNbrOfPastDepreciations !== null ? parentContext.ifrsNbrOfPastDepreciations : null,
            periodicityTypeSelect: parentContext?.periodicityTypeSelect || null,
            fixedAssetDerogatoryLineList: [],
            fiscalFixedAssetLineList: [],
            reference: parentContext?.reference || null,
            durationInMonth: parentContext && parentContext.durationInMonth !== null ? parentContext.durationInMonth : null,
            computationMethodSelect: parentContext?.computationMethodSelect || null,
            barcodeTypeConfig: null,
            firstDepreciationDateInitSelect:
              parentContext && parentContext.firstDepreciationDateInitSelect !== null
                ? parentContext.firstDepreciationDateInitSelect
                : null,
            id: parentContext?.id || null,
            barcode: null,
            trackingNumber: null,
            firstServiceDate: parentContext?.firstServiceDate || null,
            ifrsPeriodicityInMonth:
              parentContext && parentContext.ifrsPeriodicityInMonth !== null ? parentContext.ifrsPeriodicityInMonth : null,
            firstDepreciationDate: parentContext?.firstDepreciationDate || null,
            serialNumber: null,
            fiscalNbrOfPastDepreciations:
              parentContext && parentContext.fiscalNbrOfPastDepreciations !== null ? parentContext.fiscalNbrOfPastDepreciations : null,
            fiscalAlreadyDepreciatedAmount:
              parentContext && parentContext.fiscalAlreadyDepreciatedAmount !== null ? parentContext.fiscalAlreadyDepreciatedAmount : null,
            nbrOfPastDepreciations:
              parentContext && parentContext.nbrOfPastDepreciations !== null ? parentContext.nbrOfPastDepreciations : null,
            purchaseAccount: parentContext?.purchaseAccount || null,
            saleAccountMove: null,
            ifrsFirstDepreciationDate: null,
            version: parentContext && parentContext.version !== null ? parentContext.version : null,
            failoverDate: null,
            ifrsComputationMethodSelect: null,
            grossValue: parentContext?.grossValue || null,
            ifrsPeriodicityTypeSelect:
              parentContext && parentContext.ifrsPeriodicityTypeSelect !== null ? parentContext.ifrsPeriodicityTypeSelect : null,
            purchaseAccountMove: null,
            qty: '1.00',
            disposalDate: null,
            name: parentContext?.name || null,
            fiscalFirstDepreciationDateInitSelect:
              parentContext && parentContext.fiscalFirstDepreciationDateInitSelect !== null
                ? parentContext.fiscalFirstDepreciationDateInitSelect
                : null,
            numberOfDepreciation: parentContext && parentContext.numberOfDepreciation !== null ? parentContext.numberOfDepreciation : null,
            stockLocation: parentContext?.stockLocation || null,
            correctedAccountingValue: '0.00',
            associatedFixedAssetsSet: [],
            residualValue: '0.00',
            fiscalFirstDepreciationDate: null,
            ifrsAlreadyDepreciatedAmount: '0.00',
            isIfrsEqualToFiscalDepreciation: false,
            journal: parentContext?.journal || null,
            company: parentContext?.company || null,
            ifrsFirstDepreciationDateInitSelect: parentContext?.ifrsFirstDepreciationDateInitSelect || null,
            invoiceLine: null,
            fiscalDegressiveCoef: '0.00',
            isEqualToFiscalDepreciation: false,
            fiscalNumberOfDepreciation:
              parentContext && parentContext.fiscalNumberOfDepreciation !== null ? parentContext.fiscalNumberOfDepreciation : null,
            ifrsDurationInMonth: parentContext && parentContext.ifrsDurationInMonth !== null ? parentContext.ifrsDurationInMonth : null,
            alreadyDepreciatedAmount: '0.00',
            comments: null,
            periodicityInMonth: parentContext && parentContext.periodicityInMonth !== null ? parentContext.periodicityInMonth : null,
            ifrsFixedAssetLineList: [],
            ifrsNumberOfDepreciation:
              parentContext && parentContext.ifrsNumberOfDepreciation !== null ? parentContext.ifrsNumberOfDepreciation : null,
            disposalValue: parentContext?.disposalValue || null,
            disposalMove: null,
            assetDisposalReason: { id: parseInt(formik.values.disposalReason) },
            fiscalPeriodicityInMonth:
              parentContext && parentContext.fiscalPeriodicityInMonth !== null ? parentContext.fiscalPeriodicityInMonth : null,
            statusSelect: parentContext && parentContext.statusSelect !== null ? parentContext.statusSelect : null,
            degressiveCoef: '0.00',
            originSelect: parentContext?.originSelect || null,
            transferredReasonSelect: parentContext?.transferredReasonSelect || null,
            fixedAssetLineList: parentContext?.fixedAssetLineList || null,
            partner: parentContext?.partner || null,
            fixedAssetSeq: parentContext?.fixedAssetSeq || null,
            accountingValue: parentContext?.accountingValue || null,
            fiscalPeriodicityTypeSelect:
              parentContext && parentContext.fiscalPeriodicityTypeSelect !== null ? parentContext.fiscalPeriodicityTypeSelect : null,
            analyticDistributionTemplate: parentContext?.analyticDistributionTemplate || null,
            fixedAssetCategory: parentContext?.fixedAssetCategory || null,
            fiscalComputationMethodSelect: null,
            fiscalDurationInMonth:
              parentContext && parentContext.fiscalDurationInMonth !== null ? parentContext.fiscalDurationInMonth : null,
          },
          _id: parentContext?.id || null,
          qty: '1.00',
          disposalTypeSelect: parseInt(formik.values.disposalType),
          disposalQtySelect: 1,
          disposalDate: moment(formik.values.disposalDate).locale('en').format('YYYY-MM-DD'),
          disposalAmount: formik.values.salePriceWithoutTax
            ? parseFloat(formik.values.salePriceWithoutTax).toFixed(2).toString()
            : parseFloat(parentContext.accountingValue).toFixed(2).toString(),
          assetDisposalReason: { id: parseInt(formik.values.disposalReason) },
          originalQty: '1.00',
          _viewType: 'form',
          _viewName: 'fixed-asset-disposal-wizard-form',
          _views: [{ type: 'form', name: 'fixed-asset-disposal-wizard-form' }],
          _signal: 'disposalBtn',
          _source: 'disposalBtn',
        },
      },
    };

    if (formik.values.disposalType === '2') {
      payload.data.context = {
        ...payload.data.context,
        generateSaleMove: formik.values.saleMove,
        saleTaxLine: formik.values.tax,
      };
    }

    return payload;
  };

  const disposalHandler = async () => {
    const linesToBeDepreciated = depreciationLines.filter(
      line =>
        line.statusSelect === 1 &&
        (moment(line.depreciationDate).isBefore(formik.values.disposalDate) ||
          moment(line.depreciationDate).isSame(formik.values.disposalDate))
    );

    if (linesToBeDepreciated.length > 0) {
      const { successfulCount, total } = await bulkRealizeService({ total: linesToBeDepreciated.length, data: linesToBeDepreciated });
      if (successfulCount !== total) return alertHandler('Error', t('ERROR_DEPRECIATION'));
    }

    let action = 'action-fixed-asset-group-disposal-asset';
    const disposalFirstActionResponse = await api('POST', getActionUrl(), getDisposalFirstActionPayload(action));
    if (disposalFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = disposalFirstActionResponse.data.data;
    if (data && checkFlashOrError(data) && data[0].flash === 'Disposal date can not be before the first service date of the fixed asset')
      return alertHandler('Error', t('DISPOSAL_DATE_MUST_BE_NOT_BEFORE_DEPRECIATION_DATE'));

    if (data && checkFlashOrError(data) && data[0].flash === 'Disposal date must be after the date of the last depreciation.')
      return alertHandler('Error', t('DISPOSAL_DATE_MUST_BE_AFTER_DEPRECIATION_DATE'));
    if (
      data &&
      checkFlashOrError(data) &&
      data[0].flash === 'The disposal of the asset cannot be executed while depreciation has already been accounted.'
    )
      return alertHandler('Error', t('DISPOSAL_CANNOT_BE_EXECUTED_WHILE_DEPRECIATION_ACCOUNTED'));
    if (
      data &&
      checkFlashOrError(data) &&
      data[0].flash ===
        'Fixed asset: disposal move could not be generated because fixed  category is missing one of theses account Realised Assets Value Account'
    )
      return alertHandler('Error', t('MISSING_FIXED_ASSET_CATEGORY_REALIZED_ASSETS_VALUE_ACCOUNT'));
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    const fetchedFixedAsset = await fetchFixedAsset(parentContext.id);

    if (fetchedFixedAsset && fetchedFixedAsset.disposalMove) {
      let move = fetchedFixedAsset.disposalMove;
      action = 'action-account-move-group-accounting-click[1]';
      let deprecitaionMovePostFirstActionResponse = await api('POST', getActionUrl(), getOnAccountClickPayload(action, move));
      if (deprecitaionMovePostFirstActionResponse.data.status !== 0) return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));
      if (deprecitaionMovePostFirstActionResponse.data.data && checkFlashOrError(deprecitaionMovePostFirstActionResponse.data.data))
        return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));
      action = 'action-account-move-group-accounting-click[2]';
      let deprecitaionMovePostSecondActionResponse = await api('POST', getActionUrl(), getOnAccountClickPayload(action, move));
      if (deprecitaionMovePostSecondActionResponse.data.status !== 0) return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));

      if (deprecitaionMovePostSecondActionResponse.data.data && checkFlashOrError(deprecitaionMovePostSecondActionResponse.data.data)) {
        return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));
      }
    } else {
      return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));
    }

    if (fetchedFixedAsset && fetchedFixedAsset.saleAccountMove) {
      let move = fetchedFixedAsset.saleAccountMove;
      action = 'action-account-move-group-accounting-click[1]';
      let deprecitaionMovePostFirstActionResponse = await api('POST', getActionUrl(), getOnAccountClickPayload(action, move));
      if (deprecitaionMovePostFirstActionResponse.data.status !== 0) return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));
      if (deprecitaionMovePostFirstActionResponse.data.data && checkFlashOrError(deprecitaionMovePostFirstActionResponse.data.data))
        return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));
      action = 'action-account-move-group-accounting-click[2]';
      let deprecitaionMovePostSecondActionResponse = await api('POST', getActionUrl(), getOnAccountClickPayload(action, move));
      if (deprecitaionMovePostSecondActionResponse.data.status !== 0) return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));

      if (deprecitaionMovePostSecondActionResponse.data.data && checkFlashOrError(deprecitaionMovePostSecondActionResponse.data.data)) {
        return alertHandler('Error', t('DISPOSAL_MOVE_POSTED_ERROR'));
      }
    }

    return finishedDisposalHandler('Success', t('FIXED_ASSET_DISPOSED_SUCCESSFULLY'));
  };

  const finishedDisposalHandler = (title, message) => {
    // setIsLoading(false);
    alertHandler(title, message);
    setTimeout(() => {
      navigate(getFeaturePath(subFeature));
    }, [3000]);
  };

  const setDefaultDisposalDate = () => {
    if (depreciationLines && depreciationLines.length > 0) {
      const lastPlannedDate = [...depreciationLines].reverse().find(line => line.statusSelect === 2)?.depreciationDate;

      const newDefaultDate = lastPlannedDate
        ? moment(lastPlannedDate).add(1, 'd').locale('en').format('YYYY-MM-DD')
        : moment(new Date()).locale('en').format('YYYY-MM-DD');

      setFieldValue(formik, 'disposalDate', newDefaultDate);

      setMinDisposalDate(newDefaultDate);
    }
  };

  const saveLine = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setIsLoading(true);
    disposalHandler();
  };

  useEffect(() => {
    setDefaultDisposalDate();
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
          {t(header)}
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
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <DateInput
                  formik={formik}
                  label="LBL_DISPOSAL_DATE"
                  accessor="disposalDate"
                  mode={mode}
                  isRequired={true}
                  min={minDisposalDate}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label htmlFor="exampleDataList" className="form-label">
                  {t('LBL_DISPOSAL_TYPE')}
                  <span>*</span>
                </label>
                <select
                  className="form-select placeholder-shown edit"
                  name="disposalType"
                  value={formik.values.disposalType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">{t('LBL_PLEASE_SELECT')}</option>;
                  {disposalTypesOptions.map(option => {
                    return <option value={option.value}>{option.name}</option>;
                  })}
                </select>
                <ErrorMessage formik={formik} mode="add" identifier="disposalType" />
              </div>
              {disposalReasonsOptions && (
                <div className="col-md-6">
                  <label htmlFor="exampleDataList" className="form-label">
                    {t('LBL_DISPOSAL_REASON')}
                    <span>*</span>
                  </label>
                  <select
                    className="form-select placeholder-shown edit"
                    name="disposalReason"
                    value={formik.values.disposalReason}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">{t('LBL_PLEASE_SELECT')}</option>;
                    {disposalReasonsOptions.map(option => {
                      return <option value={option.value}>{option.name}</option>;
                    })}
                  </select>
                  <ErrorMessage formik={formik} mode="add" identifier="disposalReason" />
                </div>
              )}
              {formik.values.disposalType === '2' && (
                <>
                  <div className="col-md-6">
                    <NumberInput
                      formik={formik}
                      label="LBL_SALE_PRICE_WITH_TAX"
                      accessor="salePriceWithoutTax"
                      mode={mode}
                      isRequired={mode !== 'view'}
                      disabled={mode === 'view'}
                    />
                  </div>
                  <div className="col-md-6">
                    <CheckboxInput formik={formik} label="LBL_GENERATE_SALE_MOVE" accessor="saleMove" isOnlyCheckboxesInRow={false} />
                  </div>
                  {formik.values.saleMove && (
                    <div className="col-md-6">
                      <SearchModalAxelor
                        formik={formik}
                        modelKey="TAX_LINES"
                        mode="add"
                        isRequired={formik.values.saleMove}
                        payloadDomain="(self.endDate > :disposalDate OR self.endDate IS NULL) AND self.startDate < :disposalDate AND self.tax.typeSelect in (1)"
                        payloadDomainContext={{
                          _fixedAsset: parentContext,
                          _id: parentContext?.id || null,
                          disposalTypeSelect: parseInt(formik.values.disposalType),
                          disposalQtySelect: 1,
                          disposalDate: moment(formik.values.disposalDate).locale('en').format('YYYY-MM-DD'),
                          generateSaleMove: true,
                          originalQty: '1.00',
                          _model: MODELS.FIXED_ASSET,
                        }}
                        defaultValueConfig={null}
                        extraFields={['name']}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <FormNotes
              notes={[
                {
                  title: 'LBL_REQUIRED_NOTIFY',
                  type: 3,
                },
              ]}
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <CloseButton onClick={() => setShow(false)} />
          {mode !== 'view' && (
            <PurpleSaveButton
              onClick={() => {
                saveLine();
              }}
            />
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default DisposalModal;
