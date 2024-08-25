import { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const QrcodeReader = props => {
  let setQrcodeReaderPopup = props.setQrcodeReaderPopup;
  let handelQrCodeRequest = props.handelQrCodeRequest;
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
              onClick={() => setQrcodeReaderPopup(false)}
            ></button>
          </div>
          <div className="modal-body">
            <QrReader
              delay={300}
              onResult={(result, error) => {
                if (result) {
                  setData(result?.text);
                  handelQrCodeRequest(result?.text);
                  setQrcodeReaderPopup(false);
                }

                if (error) {
                  console.info(error);
                }
              }}
              style={{ width: '100%' }}
            />
            <p>{data}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrcodeReader;
