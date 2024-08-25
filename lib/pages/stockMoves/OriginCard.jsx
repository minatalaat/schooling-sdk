import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import TextInput from '../../components/ui/inputs/TextInput';
import InnerTable from '../../components/InnerTable';

import { getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';
import { formatFloatNumber } from '../../utils/helpers';
import { invoiceStatusEnum, invoiceOperationTypeSelectEnum } from '../../constants/enums/InvoicingEnums';
import { MODELS } from '../../constants/models';
import { INVOICES_SEARCH_FIELDS } from './StockMovesPayloadsFields';
import { setFieldValue } from '../../utils/formHelpers';
import { useFeatures } from '../../hooks/useFeatures';

const OriginCard = ({ formik, stockMove, isInternal = false }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  let originId = stockMove?.originId || null;
  let originTypeSelect = isInternal ? 'INTERNAL_MOVE' : stockMove?.originTypeSelect || null;
  let invoiceSet = stockMove?.invoiceSet || null;
  let stockMoveID = stockMove?.id || null;

  const [tempData, setTempData] = useState([]);

  const lineHeaders = [
    t('LBL_INVOICE_NUMBER'),
    t('LBL_INVOICE_TYPE'),
    t('LBL_CUSTOMER_SUPPLIER'),
    t('LBL_INVOICE_DATE'),
    t('LBL_TOTAL_WITHOUT_TAX'),
    t('LBL_TOTAL_WITH_TAX'),
    t('LBL_AMOUNT_REMAINING'),
    t('LBL_STATUS'),
  ];

  useEffect(() => {
    if (isInternal) {
      setFieldValue(formik, 'originFullName', stockMove?.reversionOriginStockMove?.stockMoveSeq);
    }

    if (!isInternal) {
      if (originId) {
        fetchOrigin();
      }

      if (invoiceSet?.length > 0) {
        getInvoices();
      }

      if (stockMove.statusSelect > 2) {
        getJournalEntry();
      }
    }
  }, [originId, invoiceSet]);

  const fetchOriginPayload = {
    fields: ['fullName', 'orderDate'],
  };

  const fetchOrigin = async () => {
    let originResponse = await api('POST', getFetchUrl(originTypeSelect, originId), fetchOriginPayload);
    if (!originResponse.data || originResponse.data.status !== 0 || !originResponse.data.data || !originResponse.data.data[0])
      return navigate('/error');
    let origin = originResponse.data.data[0];
    setFieldValue(formik, 'originType', originTypeEnum[originTypeSelect]);
    setFieldValue(formik, 'originFullName', origin?.fullName);
    setFieldValue(formik, 'orderDate', origin?.orderDate);
  };

  const invoicesPayload = {
    fields: INVOICES_SEARCH_FIELDS,
    sortBy: ['-invoiceDate'],
    data: {
      _domain: 'self.id in (:_field_ids)',
      _domainContext: {
        id: stockMoveID,
        _model: MODELS.STOCK_MOVE,
        _field: 'invoiceSet',
        _field_ids: invoiceSet.map(invoice => invoice.id),
      },
      _archived: true,
    },
    limit: -1,
    offset: 0,
    translate: true,
  };

  const getInvoices = async () => {
    let invoicesResponse = await api('POST', getSearchUrl(MODELS.INVOICE), invoicesPayload);
    let invoices = invoicesResponse.data.data;
    let tempArr = [];
    invoices.forEach(invoice => {
      tempArr.push({
        isDeleteable: false,
        isEditable: false,
        isViewable: true,
        tableData: [
          { value: invoice.invoiceId, type: 'text' },
          { value: invoiceOperationTypeSelectEnum[invoice.operationTypeSelect], type: 'text', translate: true },
          { value: invoice.partner?.fullName ?? '', type: 'text' },
          { value: invoice.invoiceDate ?? '', type: 'text' },
          { value: formatFloatNumber(invoice.exTaxTotal) ?? 0, type: 'number' },
          { value: formatFloatNumber(invoice.inTaxTotal) ?? 0, type: 'number' },
          { value: formatFloatNumber(invoice.amountRemaining) ?? 0, type: 'number' },
          { value: invoiceStatusEnum[invoice.statusSelect] ?? 0, type: 'text' },
        ],
        data: invoice,
        key: invoice.id,
        headData: invoice.invoiceId,
      });
      setTempData(tempArr);
    });
  };

  const originTypeEnum = {
    'com.axelor.apps.purchase.db.PurchaseOrder': 'LBL_PURCHASE_ORDER',
    'com.axelor.apps.sale.db.SaleOrder': 'LBL_SALE_ORDER',
    INTERNAL_MOVE: 'LBL_ORIGIN_STOCK_TRANSFER',
  };

  const getStockMoveAdditionalDataPayload = () => {
    let payload = {
      fields: ['stockMove', 'stockMoveDate', 'costMove'],
      sortBy: ['stockMove'],
      data: {
        _domain: 'self.stockMove.id = :_stockMove',
        _domainContext: {
          _stockMove: stockMove?.id,
        },
        operator: 'and',
        criteria: [],
      },
      limit: 1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getJournalEntry = async () => {
    const stockMoveDateResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), getStockMoveAdditionalDataPayload());
    let status = stockMoveDateResponse.data.status;
    let total = stockMoveDateResponse.data.total;
    let data = stockMoveDateResponse.data.data;

    if (status !== 0 || total === undefined || total === null || !data) {
      return;
    }

    setFieldValue(formik, 'journal', data?.[0]?.costMove?.reference);
  };

  const onViewInvoice = async line => {
    if (line.operationTypeSelect === 1) {
      navigate(getFeaturePath('SUPPLIERS_INVOICES', 'view', { id: line.id, status: invoiceStatusEnum[line.statusSelect] }));
    } else if (line.operationTypeSelect === 2) {
      navigate(getFeaturePath('SUPPLIERS_REFUNDS', 'view', { id: line.id, status: invoiceStatusEnum[line.statusSelect] }));
    } else if (line.operationTypeSelect === 3) {
      navigate(getFeaturePath('CUSTOMERS_INVOICES', 'view', { id: line.id, status: invoiceStatusEnum[line.statusSelect] }));
    } else if (line.operationTypeSelect === 4) {
      navigate(getFeaturePath('CUSTOMERS_REFUNDS', 'view', { id: line.id, status: invoiceStatusEnum[line.statusSelect] }));
    }
  };

  return (
    <div className="card ">
      <div className="row">
        <div className="col-md-3">
          <TextInput formik={formik} label="LBL_ORIGIN" accessor="originType" mode="view" translate={true} />
        </div>
        <div className="col-md-3">
          <TextInput formik={formik} label={originTypeEnum[originTypeSelect]} accessor="originFullName" mode="view" translate={true} />
        </div>
        {stockMove?.statusSelect > 2 && (
          <div className="col-md-3">
            <TextInput formik={formik} label="LBL_JOURNAL_ENTRY" accessor="journal" mode="view" />
          </div>
        )}
      </div>
      {tempData && tempData.length > 0 && (
        <InnerTable
          title="LBL_INVOICES"
          pageMode="view"
          lineHeaders={lineHeaders}
          lineData={tempData}
          withBorderSection={false}
          onViewLine={onViewInvoice}
        />
      )}
    </div>
  );
};

export default OriginCard;
