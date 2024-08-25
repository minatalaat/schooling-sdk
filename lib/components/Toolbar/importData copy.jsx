import moment from 'moment';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAxiosFunction } from '../../hooks/useAxios';
import AddButton from '../ui/buttons/AddButton';

const ImportData = ({ title, setData }) => {
  const dropdownSelectHandler = () => {
    uploadInputRef.current.click();
  };

  const { axiosFetch } = useAxiosFunction();
  const uploadInputRef = useRef();
  moment.locale('en');

  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <>
      <AddButton text={title} id="buttonid" onClick={dropdownSelectHandler} />

      <input
        ref={uploadInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={event => {
          if (event.currentTarget.files[0]) {
            setUploadedFile(event.currentTarget.files[0]);
            setData(event.currentTarget.files[0]);
            event.currentTarget.value = '';
          }
        }}
      />
    </>
  );
};

export default ImportData;
