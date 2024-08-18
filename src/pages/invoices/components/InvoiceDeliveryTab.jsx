import StockMoves from '../../stockMoves/StockMoves';
import TextArea from '../../../components/ui/inputs/TextArea';

const InvoiceDeliveryTab = ({ formik, fetchedObject, isTabRequired = false, mode, isDisabled, isPurchase = true, isInvoice = false }) => {
  return (
    <div className="row d-contents">
      <div className="row">
        <div className="col-md-6">
          <TextArea formik={formik} label="LBL_DELIVERY_ADDRESS" accessor="deliveryAddressStr" mode={mode} disabled={isDisabled} />
        </div>
      </div>
      {mode !== 'add' && <StockMoves data={fetchedObject} isPurchase={isPurchase} isInvoice={isInvoice} />}
    </div>
  );
};

export default InvoiceDeliveryTab;
