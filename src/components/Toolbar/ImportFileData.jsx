import moment from 'moment';
import { useRef, useState } from 'react';
import AddButton from '../ui/buttons/AddButton';

const ImportData = ({ title, setData }) => {
  const dropdownSelectHandler = () => {
    uploadInputRef.current.click();
  };

  const uploadInputRef = useRef();
  moment.locale('en');

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
