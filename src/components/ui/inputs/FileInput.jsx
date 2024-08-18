import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import closeIcon from '../../../assets/images/close.svg';

import EmptyPictureField from '../skeletons/EmptyPictureField';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { setFieldValue } from '../../../utils/formHelpers';
import { removePictureVisible, removePictureInvisible } from '../../../utils/styles';

export default function FileInput({ formik, identifier, alertHandler, parentId, fileId, tableModel, label, mode = 'view' }) {
  const { downloadDocument } = useAxiosFunction();
  const { t } = useTranslation();

  const [showRemoveLogo, setShowRemoveLogo] = useState(false);
  const [thumb, setThumb] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);
  const [showLogo, setShowLogo] = useState(false);

  let reader = new FileReader();

  reader.onloadstart = () => {
    setImgLoading(true);
  };

  reader.onloadend = () => {
    setThumb(reader.result);
    setShowLogo(true);
    setImgLoading(false);
  };

  reader.onerror = () => {
    setImgLoading(false);
  };

  const getLogo = () => {
    if (!parentId || !fileId || !tableModel) return setImgLoading(false);
    downloadDocument(
      parentId,
      fileId,
      tableModel,
      data => {
        if (!data) return setImgLoading(false);
        setFieldValue(formik, identifier, data);
      },
      () => {
        setImgLoading(false);
        alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      }
    );
  };

  // console.log(formik.values[identifier]);
  // useEffect(() => {
  //   if (formik.values[identifier]) return reader?.readAsDataURL(formik.values[identifier]);
  // }, [formik.values[identifier]]);

  //Check for type before calling readAsDataURL
  useEffect(() => {
    if (formik.values[identifier] && (formik.values[identifier] instanceof Blob || formik.values[identifier] instanceof File)) {
      reader.readAsDataURL(formik.values[identifier]);
    }
  }, [formik.values[identifier]]);

  useEffect(() => {
    if (mode !== 'add') getLogo();
    else setImgLoading(false);
  }, []);

  return (
    <div className="vew-tabcontent">
      <label className="form-label" htmlFor="full-name">
        {label && t(label)}
      </label>
      {mode !== 'view' && (
        <div
          className="con-input-file"
          onMouseOver={() => {
            setShowRemoveLogo(true);
          }}
          onMouseLeave={() => {
            setShowRemoveLogo(false);
          }}
        >
          {thumb && (
            <button
              className="remove-image"
              style={showRemoveLogo ? removePictureVisible : removePictureInvisible}
              onClick={() => {
                setFieldValue(formik, identifier, null);
                setThumb(null);
                setShowLogo(false);
              }}
            >
              <img src={closeIcon} alt="close-icon" />
            </button>
          )}
          <div className="img-1">
            {!showLogo && !imgLoading && <EmptyPictureField />}

            {!imgLoading && showLogo && <img src={thumb} alt="Company Logo" className="img-thumbnail mt-2" />}
            {imgLoading && <div>{t('LOADING')}</div>}
          </div>
          <input
            id={identifier}
            name={identifier}
            type="file"
            title=""
            onChange={event => {
              if (event.currentTarget.files[0]) {
                setFieldValue(formik, identifier, event.currentTarget.files[0]);
                setShowLogo(true);
                event.currentTarget.value = '';
              }
            }}
            className="input"
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
      {mode === 'view' && (
        <div className="con-input-file">
          <div className="img-1">
            {!showLogo && !imgLoading && <EmptyPictureField />}
            {!imgLoading && showLogo && <img src={thumb} alt="Company Logo" className="img-thumbnail mt-2" />}
            {imgLoading && <div>{t('LOADING')}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
