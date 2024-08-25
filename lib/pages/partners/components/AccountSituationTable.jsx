import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import InnerTable from '../../../components/InnerTable';
import AccountSituation from './AccountSituation';
import { PartnerAccountsActions } from '../../../store/partnerAccounts';

const AccountSituationTable = ({ formik, mode }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  let accountingLines = useSelector(state => state.partnerAccounts.partnerAccounts);
  let isCustomer = formik.values.checked.includes('customer');
  let isSupplier = formik.values.checked.includes('supplier');

  const [tempData, setTempData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  let lineHeaders = [];

  if (isCustomer) lineHeaders.push(t('LBL_CUSTOMER_ACCOUNT'));
  if (isSupplier) lineHeaders.push(t('LBL_SUPPLIER_ACCOUNT'));
  lineHeaders = [...lineHeaders, t('LBL_TOTAL_BALANCE'), t('LBL_DUE_BALANCE'), t('LBL_DUE_BALANCE_RECOVERY')];
  useEffect(() => {
    setIsLoading(true);

    if (accountingLines?.length > 0) {
      let tempLines = [...accountingLines];
      let tempArr = [];
      tempLines.forEach(line => {
        tempArr.push({
          isDeleteable: mode !== 'view',
          isEditable: mode !== 'view',
          isViewable: false,
          tableData: [
            isCustomer ? { value: line?.['customerAccount']?.['label'] ?? line?.['customerAccount.label'] ?? '', type: 'text' } : '',
            isSupplier ? { value: line?.['supplierAccount']?.['label'] ?? line?.['supplierAccount.label'] ?? '', type: 'text' } : '',
            { value: line?.balanceCustAccount, type: 'number' },
            { value: line?.balanceDueCustAccount, type: 'number' },
            { value: line?.balanceDueDebtRecoveryCustAccount, type: 'number' },
          ],
          data: line,
          key: line.lineId,
          headData: isCustomer
            ? line?.['customerAccount']?.['label'] ?? line?.['customerAccount.label'] ?? ''
            : line?.['supplierAccount']?.['label'] ?? line?.['supplierAccount.label'] ?? '',
        });
        setTempData(tempArr);
        setIsLoading(false);
      });
    } else {
      setTempData([]);
      setIsLoading(false);
    }
  }, [accountingLines, formik.values.checked]);

  const onAddLine = () => {
    setShowAddModal(true);
  };

  const onEditLine = line => {
    setSelectedLine(line);
    setShowEditModal(true);
  };

  const onViewLine = () => {};

  const onDeleteLine = line => {
    dispatch(PartnerAccountsActions.deleteLine({ id: line.lineId }));
  };

  const openMoreActionHandler = () => {};

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <InnerTable
            title={t('LBL_ACCOUNTING_CONFIGURATION')}
            pageMode={mode}
            onAddNewLine={onAddLine}
            onEditLine={onEditLine}
            onViewLine={onViewLine}
            onDeleteLine={onDeleteLine}
            onOpenMoreAction={openMoreActionHandler}
            lineHeaders={lineHeaders}
            lineData={tempData}
            alternativeID="lineId"
            canSelectAll={false}
            fieldKey="accountingConfig"
            isLoading={isLoading}
            canAdd={formik.values.checked?.length > 0}
          />
        </div>
      </div>
      {showAddModal && (
        <AccountSituation
          show={showAddModal}
          setShow={setShowAddModal}
          mode={mode}
          edit={false}
          isSupplier={isSupplier}
          isCustomer={isCustomer}
        />
      )}
      {showEditModal && (
        <AccountSituation
          show={showEditModal}
          setShow={setShowEditModal}
          edit={true}
          selectedLine={selectedLine}
          isSupplier={isSupplier}
          isCustomer={isCustomer}
        />
      )}
    </>
  );
};

export default AccountSituationTable;
