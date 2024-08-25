import { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const BarcodeReaderPopup = props => {
  let setBarcodeReaderPopup = props.setBarcodeReaderPopup;
  let handelBarcodeReaderRequest = props.handelBarcodeReaderRequest;

  const [data, setData] = useState('No result');

  return (
    <div
      className="modal fade show"
      id="delete-row"
      aria-labelledby="exampleModalToggleLabel2"
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
      style={{ display: 'block' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => setBarcodeReaderPopup(false)}
            ></button>
          </div>
          <div className="modal-body">
            <BarcodeScannerComponent
              onUpdate={(err, result) => {
                if (result) {
                  handelBarcodeReaderRequest(result.text);
                  setData(result.text);
                  setBarcodeReaderPopup(false);
                } else {
                  setData('Not Found');
                }
              }}
              width={400}
              height={500}
              constraints={{ audio: false, video: { facingMode: 'environment' } }}
            />{' '}
            <p>{data}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeReaderPopup;
