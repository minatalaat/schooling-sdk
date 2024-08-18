import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyPictureField from '../skeletons/EmptyPictureField';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { setFieldValue } from '../../../utils/formHelpers';

export default function BarcodeInput({ formik, identifier, alertHandler, parentId, fileId, tableModel, mode = 'view' }) {
  const { downloadDocument } = useAxiosFunction();
  const { t } = useTranslation();

  const [thumb, setThumb] = useState(null);
  const [barcodeLoading, setBarcodeLoading] = useState(true);
  const [showBarcode, setShowBarcode] = useState(false);

  let reader = new FileReader();

  reader.onloadstart = () => {
    setBarcodeLoading(true);
  };

  reader.onloadend = () => {
    setThumb(reader.result);
    setShowBarcode(true);
    setBarcodeLoading(false);
  };

  reader.onerror = () => {
    setBarcodeLoading(false);
  };

  const getBarcode = () => {
    if (!parentId || !fileId || !tableModel) return setBarcodeLoading(false);
    downloadDocument(
      parentId,
      fileId,
      tableModel,
      data => {
        if (!data) return setBarcodeLoading(false);
        setFieldValue(formik, identifier, data);
      },
      () => {
        setBarcodeLoading(false);
        alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      }
    );
  };

  useEffect(() => {
    if (formik.values[identifier]) return reader.readAsDataURL(formik.values[identifier]);
  }, [formik.values[identifier]]);

  useEffect(() => {
    if (mode !== 'add') getBarcode();
  }, []);

  return (
    <div className="con-input-file">
      <div className="img-1">
        {!showBarcode && !barcodeLoading && <EmptyPictureField />}
        {!barcodeLoading && showBarcode && <img src={thumb} alt="Barcode" className="mt-2" style={{ width: '-webkit-fill-available' }} />}
        {barcodeLoading && <div>{t('LOADING')}</div>}
      </div>
    </div>
  );
}
