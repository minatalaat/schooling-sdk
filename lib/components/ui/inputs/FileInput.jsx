// import { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';

// import closeIcon from '../../../assets/images/close.svg';

// import EmptyPictureField from '../skeletons/EmptyPictureField';
// import { useAxiosFunction } from '../../../hooks/useAxios';
// import { setFieldValue } from '../../../utils/formHelpers';
// import { removePictureVisible, removePictureInvisible } from '../../../utils/styles';

// export default function FileInput({ formik, identifier, alertHandler, parentId, fileId, tableModel, label, mode = 'view' }) {
//   const { downloadDocument } = useAxiosFunction();
//   const { t } = useTranslation();

//   const [showRemoveLogo, setShowRemoveLogo] = useState(false);
//   const [thumb, setThumb] = useState(null);
//   const [imgLoading, setImgLoading] = useState(true);
//   const [showLogo, setShowLogo] = useState(false);

//   let reader = new FileReader();

//   reader.onloadstart = () => {
//     setImgLoading(true);
//   };

//   reader.onloadend = () => {
//     setThumb(reader.result);
//     setShowLogo(true);
//     setImgLoading(false);
//   };

//   reader.onerror = () => {
//     setImgLoading(false);
//   };

//   const getLogo = () => {
//     if (!parentId || !fileId || !tableModel) return setImgLoading(false);
//     downloadDocument(
//       parentId,
//       fileId,
//       tableModel,
//       data => {
//         if (!data) return setImgLoading(false);
//         setFieldValue(formik, identifier, data);
//       },
//       () => {
//         setImgLoading(false);
//         alertHandler('Error', t('SOMETHING_WENT_WRONG'));
//       }
//     );
//   };

//   // console.log(formik.values[identifier]);
//   // useEffect(() => {
//   //   if (formik.values[identifier]) return reader?.readAsDataURL(formik.values[identifier]);
//   // }, [formik.values[identifier]]);

//   //Check for type before calling? readAsDataURL
//   useEffect(() => {
//     if (formik.values[identifier] && (formik.values[identifier] instanceof Blob || formik.values[identifier] instanceof File)) {
//       reader?.readAsDataURL(formik.values[identifier]);
//     }
//   }, [formik.values[identifier]]);

//   useEffect(() => {
//     if (mode !== 'add') getLogo();
//     else setImgLoading(false);
//   }, []);

//   return (
//     <div className="vew-tabcontent">
//       <label className="form-label" htmlFor="full-name">
//         {label && t(label)}
//       </label>
//       {mode !== 'view' && (
//         <div
//           className="con-input-file"
//           onMouseOver={() => {
//             setShowRemoveLogo(true);
//           }}
//           onMouseLeave={() => {
//             setShowRemoveLogo(false);
//           }}
//         >
//           {thumb && (
//             <button
//               className="remove-image"
//               style={showRemoveLogo ? removePictureVisible : removePictureInvisible}
//               onClick={() => {
//                 setFieldValue(formik, identifier, null);
//                 setThumb(null);
//                 setShowLogo(false);
//               }}
//             >
//               <img src={closeIcon} alt="close-icon" />
//             </button>
//           )}
//           <div className="img-1">
//             {!showLogo && !imgLoading && <EmptyPictureField />}

//             {!imgLoading && showLogo && <img src={thumb} alt="Company Logo" className="img-thumbnail mt-2" />}
//             {imgLoading && <div>{t('LOADING')}</div>}
//           </div>
//           <input
//             id={identifier}
//             name={identifier}
//             type="file"
//             title=""
//             onChange={event => {
//               if (event.currentTarget.files[0]) {
//                 setFieldValue(formik, identifier, event.currentTarget.files[0]);
//                 setShowLogo(true);
//                 event.currentTarget.value = '';
//               }
//             }}
//             className="input"
//             style={{ cursor: 'pointer' }}
//           />
//         </div>
//       )}
//       {mode === 'view' && (
//         <div className="con-input-file">
//           <div className="img-1">
//             {!showLogo && !imgLoading && <EmptyPictureField />}
//             {!imgLoading && showLogo && <img src={thumb} alt="Company Logo" className="img-thumbnail mt-2" />}
//             {imgLoading && <div>{t('LOADING')}</div>}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import trashIcon from '../../../assets/images/trash.svg';
import editIcon from '../../../assets/images/pencil-square.svg';

import CloudUploadIcon from '../../../assets/svgs/CloudUploadIcon';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { setFieldValue } from '../../../utils/formHelpers';
// import { useAxiosFunction } from '../../../../hooks/useAxios';
// import { setFieldValue } from '../../../../utils/formHelpers';
// import { removePictureVisible, removePictureInvisible } from '../../../../utils/styles';
import { userDefaultImgs } from '../../../pages/users/constants';

export default function FileInput({
  formik,
  identifier,
  alertHandler,
  parentId,
  fileId,
  tableModel,
  mode = 'view',
  imagePlaceholder = <CloudUploadIcon />, // Default to CloudUploadIcon if imagePlaceholder is not provided
  isUserProfile = false,
}) {
  const { downloadDocument, downloadDocumentWithFileId } = useAxiosFunction();
  const { t } = useTranslation();

  const editfileInputRef = useRef();
  const imagePlaceholderRef = useRef(imagePlaceholder);
  const fileInputRef = useRef();

  const [showRemoveLogo, setShowRemoveLogo] = useState(false);
  const [thumb, setThumb] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [isDefaultImage, setIsDefaultImage] = useState(false);

  let reader = new FileReader();

  reader.onloadstart = () => {
    setImgLoading(true);
  };

  reader.onloadend = () => {
    setThumb(reader?.result);
    setShowLogo(true);
    setImgLoading(false);
  };

  reader.onerror = () => {
    setImgLoading(false);
  };

  const getLogo = () => {
    if (!isUserProfile) {
      setIsDefaultImage(false);
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
    }

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

  const handleDragOver = event => {
    event.preventDefault();
  };

  const handleDrop = event => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      setFieldValue(formik, identifier, file);
      setShowLogo(true);
      event.currentTarget.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = event => {
    const file = event.currentTarget.files[0];

    if (file) {
      const validExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!validExtensions.includes(fileExtension) || !event.currentTarget.files[0]?.type.includes('image')) {
        alertHandler('Error', t('NOT_ACCEPTED_FILE_TYPE'));
        event.currentTarget.value = '';
        return;
      }

      setFieldValue(formik, identifier, file);
      if (isUserProfile) setFieldValue(formik, 'picture', '');
      setShowLogo(true);
      setIsDefaultImage(false);
      event.currentTarget.value = '';
    }
  };

  const handleRemoveClick = () => {
    if (isUserProfile) setIsDefaultImage(true);
    setFieldValue(formik, identifier, null);
    setThumb(null);
    setShowLogo(false);
  };

  const handleEditClick = () => {
    editfileInputRef.current.click();
  };

  const getBlobField = async () => {
    const base64ResponseMale = await fetch(userDefaultImgs['MALE']);
    const base64ResponseFemale = await fetch(userDefaultImgs['FEMALE']);
    const blobMale = await base64ResponseMale.blob();
    const blobFemale = await base64ResponseFemale.blob();
    const maleFile = new File([blobMale], 'maleProfilePlaceholder', { type: 'image/jpeg' });
    const femaleFile = new File([blobFemale], 'femaleProfilePlaceholder', { type: 'image/jpeg' });

    return { maleFile, femaleFile };
  };

  const changeImagePlaceholder = () => {
    if (parseInt(formik.values.titleSelect) === 1) {
      setFieldValue(formik, 'picture', userDefaultImgs['MALE']);

      getBlobField().then(value => {
        setFieldValue(formik, 'img', value.maleFile);
      });
    } else {
      setFieldValue(formik, 'picture', userDefaultImgs['FEMALE']);

      getBlobField().then(value => {
        setFieldValue(formik, 'img', value.femaleFile);
      });
    }
  };
  

  useEffect(() => {
    if (isUserProfile) {
      if (mode !== 'add') {
        if (!formik.values.img) {
          changeImagePlaceholder();
          setIsDefaultImage(true);
        } else {
          if (typeof formik.values.img === 'object' && formik.values.img?.id) {
            getLogo();
          } else {
            reader?.readAsDataURL(formik.values.img);
          }
        }
      } else {
        if (!formik.values.img) {
          if (parseInt(formik.values.titleSelect) === 1) {
            setFieldValue(formik, 'picture', userDefaultImgs['MALE']);
            setIsDefaultImage(true);
          } else {
            setFieldValue(formik, 'picture', userDefaultImgs['FEMALE']);
            setIsDefaultImage(true);
          }
        } else {
          if (typeof formik.values.img === 'string') {
            setFieldValue(formik, 'picture', formik.values.img);
          } else {
            reader?.readAsDataURL(formik.values.img);
          }
        }
      }
    }
  }, [formik.values.titleSelect, formik.values.img, isDefaultImage]);

  useEffect(() => {
    if (isUserProfile) changeImagePlaceholder();
  }, [formik.values.titleSelect]);

  useEffect(() => {
    if (formik.values.picture) {
      setImgLoading(false);
      setShowLogo(true);
      setThumb(formik.values.picture);
    }
  }, [formik.values.picture]);

  useEffect(() => {
    // if (formik.values[identifier] && !isUserProfile) return reader?.readAsDataURL(formik.values[identifier]);
  }, [formik.values[identifier]]);

  useEffect(() => {
    if (mode !== 'add') getLogo();
    else setImgLoading(false);
  }, []);

  return (
    <>
      <div className="vew-tabcontent">
        {!imgLoading && showLogo && (
          <div
            className="file-input-image-wrapper"
            onMouseOver={() => {
              setShowRemoveLogo(true);
            }}
            onMouseLeave={() => {
              setShowRemoveLogo(false);
            }}
          >
            {mode !== 'view' && (
              <>
                {((isUserProfile && !isDefaultImage) || !isUserProfile) && (
                  <button
                    className="remove-image"
                    // style={showRemoveLogo ? removePictureVisible : removePictureInvisible}
                    onClick={handleRemoveClick}
                  >
                    <img src={trashIcon} alt="trash-icon" />
                  </button>
                )}
                {isUserProfile && (
                  <>
                    <button
                      className="edit-image"
                      // style={showRemoveLogo ? removePictureVisible : removePictureInvisible}
                      onClick={handleEditClick}
                    >
                      <img src={editIcon} alt="edit-icon" />
                    </button>
                    <input
                      style={{ display: 'none' }}
                      type="file"
                      id={identifier}
                      accept="image/*"
                      onChange={handleFileChange}
                      name={identifier}
                      ref={editfileInputRef}
                      data-testid="hidden-input-image"
                    />
                  </>
                )}
              </>
            )}

            <img src={thumb} alt="Company Logo" data-testid="uploaded-input-image" />
          </div>
        )}

        {mode !== 'view' && !thumb && (
          <>
            <div className="file-input" onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}>
              <label htmlFor="image-upload">
                {imagePlaceholderRef.current}
                <span>
                  {t('DROP_IMAGE_OR')}
                  <br />
                  <span className="text2">{t('LBL_BROWSE')}</span>
                </span>
                <input
                  type="file"
                  id={identifier}
                  accept="image/*"
                  onChange={handleFileChange}
                  name={identifier}
                  ref={fileInputRef}
                  data-testid="editable-input-img"
                />
              </label>
            </div>
          </>
        )}
        {mode === 'view' && !thumb && (
          <div className="file-input">
            <label htmlFor="image-upload">
              {imagePlaceholderRef.current}
              <span>{t(imgLoading ? 'LOADING' : 'NO_IMG_UPLOADED')}</span>
              <input type="file" id={identifier} accept="image/*" name={identifier} disabled={true} data-testid="view-input-img" />
            </label>
          </div>
        )}
      </div>
    </>
  );
}
