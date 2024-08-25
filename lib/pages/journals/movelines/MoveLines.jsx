import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';

import InnerTable from '../../../components/InnerTable';
import MoveLineModal from './MoveLineModal';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { formatFloatNumber, checkFlashOrError } from '../../../utils/helpers';
import { getActionUrl } from '../../../services/getUrl';
import { analyticDistributionLinesActions } from '../../../store/analyticDistrbution';
import { alertsActions } from '../../../store/alerts';
import { setFieldValue } from '../../../utils/formHelpers';

let modalMode = '';

const MoveLines = ({ formik, mode = 'view', hidePartnerColumn, addFormikValuesToPayload, addTotalsToPayload, setTotalValues }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const alertHandler = message => {
    setIsLoading(false);
    dispatch(alertsActions.initiateAlert({ message }));
  };

  const [tempData, setTempData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDisabled, setAddDisabled] = useState(false);

  const lineHeaders = [
    t('LBL_ACCOUNT'),
    hidePartnerColumn ? undefined : t('LBL_CUSTOMER_SUPPLIER'),
    t('LBL_AMOUNT'),
    t('LBL_CURRENCY_RATE'),
    t('LBL_DEBIT'),
    t('LBL_CREDIT'),
    t('LBL_DESCRIPTION'),
  ];

  useEffect(() => {
    if (formik.values.moveLineList?.length > 0) {
      let tempLines = [...formik.values.moveLineList];
      let tempArr = [];
      tempLines.forEach(line => {
        tempArr.push({
          isDeleteable: mode !== 'view',
          isEditable: mode !== 'view',
          isViewable: true,
          tableData: [
            { value: line?.account?.label ?? '', type: 'text' },
            hidePartnerColumn ? undefined : { value: line?.partner?.fullName ?? '', type: 'text' },
            { value: formatFloatNumber(line?.currencyAmount ?? 0), type: 'number' },
            { value: formatFloatNumber(line?.currencyRate ?? 0), type: 'number' },
            { value: formatFloatNumber(line?.debit ?? 0), type: 'number', className: 'color-text-green' },
            { value: formatFloatNumber(line?.credit ?? 0), type: 'number', className: 'color-text-red' },
            { value: line?.description ?? '', type: 'text' },
          ],
          data: line,
          key: line.lineId,
          headData: formatFloatNumber(line?.currencyAmount ?? 0),
        });
        setTempData(tempArr);
      });
    } else {
      setTempData([]);
    }
  }, [formik.values.moveLineList]);

  const getMoveLinePayload = (model, action) => {
    let payload = {
      model: model,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: model,
          id: null,
          amountPaid: '0.0',
          counter: 0,
          credit: '0',
          currencyAmount: '0',
          currencyRate: '1',
          debit: '0',
          isOtherCurrency: false,
          selected: false,
          _form: true,
          _parent: {
            _isActivateSimulatedMoves: null,
            _id: null,
            statusSelect: 1,
            journalTechnicalTypeSelect: 5,
            moveLineList: formik.values.moveLineList,
            _model: MODELS.MOVE,
          },
        },
      },
    };
    payload.data.context['_parent'] = addFormikValuesToPayload(payload.data.context['_parent']);
    payload.data.context['_parent'] = addTotalsToPayload(payload.data.context['_parent']);
    return payload;
  };

  const getMovePayload = (model, action, lines) => {
    let payload = {
      model: model,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: model,
          _isActivateSimulatedMoves: null,
          _id: null,
          functionalOriginSelect: null,
          getInfoFromFirstMoveLineOk: true,
          statusSelect: 1,
          technicalOriginSelect: 1,
          moveLineList: lines,
          journalTechnicalTypeSelect: 5,
        },
      },
    };
    payload.data.context = addFormikValuesToPayload(payload.data.context);
    payload.data.context = addTotalsToPayload(payload.data.context);
    return payload;
  };

  const confirmMoveLine = async line => {
    let lines = [...formik.values.moveLineList];
    let index = lines.findIndex(l => l.lineId === line.lineId);
    if (index === -1) lines.push(line);
    else lines[index] = line;
    setFieldValue(formik, 'moveLineList', lines);

    if (modalMode === 'edit') {
      setShowEditModal(false);
    }

    if (modalMode === 'add') {
      setShowAddModal(false);
    }

    let model = MODELS.MOVE;
    let action = 'action-account-move-method-compute-totals,action-method-hide-axis-analytic-account-move-line';
    let payload = getMovePayload(model, action, lines);

    let response = await api('POST', getActionUrl(), payload);
    let status = response?.data?.status;
    let data = response?.data?.data;

    if (status !== 0 || !data || (data && checkFlashOrError(data))) {
      return alertHandler('LBL_ERROR_COMPUTING_TOTALS');
    }

    if (data) {
      let values = data.find(el => el.values).values;

      if (values) {
        setTotalValues(values);
      }

      setIsLoading(false);
    }
  };

  const getDeletePayload = line => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-account-move-method-compute-totals,action-method-hide-axis-analytic-account-move-line',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          reference: formik.values.reference || '',
          id: formik.values.id ?? null,
          functionalOriginSelect: 0,
          statusSelect: 1,
          moveLineList: formik.values.moveLineList.filter((item, id) => id !== line.id),
          technicalOriginSelect: 1,
          invoice: null,
          journalTechnicalTypeSelect: 5,
        },
      },
    };
    payload.data.context = addFormikValuesToPayload(payload.data.context);
    payload.data.context = addTotalsToPayload(payload.data.context);
    return payload;
  };

  const onDeleteLine = async line => {
    if (line.id) {
      let payload = getDeletePayload(line);
      let response = await api('POST', getActionUrl(), payload);
      let status = response?.data?.status;
      let data = response?.data?.data;
      if (status !== 0 || !data || (data && checkFlashOrError(data))) return alertHandler('LBL_ERROR_DELETING_MOVELINE');

      if (data) {
        let values = data.find(el => el.values).values;

        if (values) {
          setTotalValues(values);
        }
      }
    }

    deleteFormikMoveLineList(line);
  };

  const onEditLine = line => {
    dispatch(analyticDistributionLinesActions.resetAnalyticDistributionLines());
    setSelectedLine(line);
    modalMode = 'edit';
    setIsLoading(false);
    setShowEditModal(true);
  };

  const onViewLine = line => {
    dispatch(analyticDistributionLinesActions.resetAnalyticDistributionLines());
    setSelectedLine(line);
    modalMode = 'view';
    setIsLoading(false);
    setShowViewModal(true);
  };

  const onAddMoveLine = async () => {
    setAddDisabled(true);
    let model = MODELS.MOVELINE;
    let action = 'action-account-move-line-onnew-group';
    let source = 'form';
    let payload = getMoveLinePayload(model, action, source);
    const response = await api('POST', getActionUrl(), payload);
    setAddDisabled(false);
    let status = response?.data?.status;
    let data = response?.data?.data;
    if (status !== 0 || !data || (data && checkFlashOrError(data))) return alertHandler('LBL_ERROR_ADDING_MOVELINE');

    if (data) {
      let lineData = data.find(el => el.values && 'debit' in el.values).values;
      let defaultLine = {
        id: null,
        version: undefined,
        lineId: uuidv4(),
        account: null,
        partner: null,
        currencyAmount: lineData.currencyAmount ?? '0',
        currencyRate: lineData.currencyRate ?? '1',
        debit: lineData.debit ?? '0',
        credit: lineData.credit ?? '0',
        description: null,
        date: lineData.date ?? null,
        analyticMoveLineList: [],
      };
      dispatch(analyticDistributionLinesActions.resetAnalyticDistributionLines());
      setSelectedLine(defaultLine);
      modalMode = 'add';
      setIsLoading(false);
      setShowAddModal(true);
    }
  };

  const deleteFormikMoveLineList = tempLine => {
    let tempLines = [...formik.values.moveLineList];
    let index = tempLines.indexOf(line => line.lineId === tempLine.lineId);
    tempLines.splice(index, 1);
    setFieldValue(formik, 'moveLineList', tempLines);
  };

  const openMoreActionHandler = line => {
    setSelectedLine(line);
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <InnerTable
            title={t('LBL_MOVELINES')}
            pageMode={mode}
            onAddNewLine={onAddMoveLine}
            onEditLine={onEditLine}
            onViewLine={onViewLine}
            onDeleteLine={onDeleteLine}
            onOpenMoreAction={openMoreActionHandler}
            lineHeaders={lineHeaders}
            lineData={tempData}
            alternativeID="lineId"
            isAddDisabled={isAddDisabled}
            canSelectAll={false}
          />
        </div>
      </div>
      {showAddModal && (
        <MoveLineModal
          show={showAddModal}
          setShow={setShowAddModal}
          line={selectedLine}
          mode="add"
          confirmMoveLine={confirmMoveLine}
          formik={formik}
          addFormikValuesToPayload={addFormikValuesToPayload}
          addTotalsToPayload={addTotalsToPayload}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      {showEditModal && (
        <MoveLineModal
          show={showEditModal}
          setShow={setShowEditModal}
          line={selectedLine}
          mode="edit"
          confirmMoveLine={confirmMoveLine}
          formik={formik}
          addFormikValuesToPayload={addFormikValuesToPayload}
          addTotalsToPayload={addTotalsToPayload}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      {showViewModal && (
        <MoveLineModal
          show={showViewModal}
          setShow={setShowViewModal}
          line={selectedLine}
          mode="view"
          formik={formik}
          addFormikValuesToPayload={addFormikValuesToPayload}
          addTotalsToPayload={addTotalsToPayload}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          hidePartnerColumn={hidePartnerColumn}
        />
      )}
    </>
  );
};

export default MoveLines;
