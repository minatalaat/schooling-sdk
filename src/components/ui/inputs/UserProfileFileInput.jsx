import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyPictureField from '../skeletons/EmptyPictureField';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { setFieldValue } from '../../../utils/formHelpers';
import { userDefaultImgs } from '../../../pages/users/constants';

export default function UserProfileFileInput({ formik, alertHandler, parentId, fileId, tableModel, label, mode = 'view' }) {
  const { downloadDocumentWithFileId } = useAxiosFunction();
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
    if (!fileId) return setImgLoading(false);
    downloadDocumentWithFileId(
      fileId,
      data => {
        if (!data) return setImgLoading(false);
        setFieldValue(formik, 'img', data);
      },
      () => {
        setImgLoading(false);
        alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      }
    );
  };

  useEffect(() => {
    if (mode !== 'add') {
      if (!formik.values.img) {
        if (parseInt(formik.values.titleSelect) === 1) {
          setFieldValue(formik, 'picture', userDefaultImgs['MALE']);
        } else {
          setFieldValue(formik, 'picture', userDefaultImgs['FEMALE']);
        }
      } else {
        if (typeof formik.values.img === 'object' && formik.values.img?.id) {
          getLogo();
        } else {
          reader.readAsDataURL(formik.values.img);
        }
      }
    } else {
      if (!formik.values.img) {
        if (parseInt(formik.values.titleSelect) === 1) {
          setFieldValue(formik, 'picture', userDefaultImgs['MALE']);
        } else {
          setFieldValue(formik, 'picture', userDefaultImgs['FEMALE']);
        }
      } else {
        if (typeof formik.values.img === 'string') {
          setFieldValue(formik, 'picture', formik.values.img);
        } else {
          reader.readAsDataURL(formik.values.img);
        }
      }
    }
  }, [formik.values.titleSelect, formik.values.img]);

  useEffect(() => {
    if (formik.values.picture) {
      setImgLoading(false);
      setShowLogo(true);
      setThumb(formik.values.picture);
    }
  }, [formik.values.picture]);

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
          {/* {thumb && (
                <button
                className="remove-image"
                style={showRemoveLogo ? removePictureVisible : removePictureInvisible}
                onClick={() => {
                    setFieldValue(formik, 'img', null);
                    setThumb(null);
                    setShowLogo(false);
                }}
                >
                <img src={closeIcon} alt="close-icon" />
                </button>
            )} */}
          <div className="img-1">
            {!showLogo && !imgLoading && <EmptyPictureField />}

            {!imgLoading && showLogo && <img src={thumb} alt="Company Logo" className="img-thumbnail mt-2" />}
            {imgLoading && <div>{t('LOADING')}</div>}
          </div>
          <input
            id="img"
            name="img"
            type="file"
            title=""
            onChange={event => {
              if (event.currentTarget.files[0]) {
                if (event.currentTarget.files[0]?.type.includes('image')) {
                  setFieldValue(formik, 'img', event.currentTarget.files[0]);
                  setShowLogo(true);
                  event.currentTarget.value = '';
                } else {
                  alertHandler('Error', t('NOT_ACCEPTED_FILE_TYPE'));
                }
              }
            }}
            className="input"
            style={{ cursor: 'pointer' }}
            accept="image/*"
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
