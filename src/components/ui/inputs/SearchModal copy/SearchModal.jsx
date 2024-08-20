import { Modal } from 'react-bootstrap';

import SearchTable from './SearchTable';
import PrimaryButton from '../../buttons/PrimaryButton';

const SearchModal = ({
  show,
  setShow,
  title,
  data,
  payloadDomain,
  payloadDomainContext,
  MODEL_NAME,
  columns,
  successFunction,
  paginationProps,
  select,
  selectHandler,
  closeHandler,
  extraFields,
  currentValue,
  checked,
  setChecked,
  isLoading,
  setIsLoading = () => {},
}) => {
  return (
    <Modal
      show={show}
      onHide={() => {
        setShow(false);
        closeHandler();
      }}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      id="add-new-line"
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <h5 className="modal-title" id="add-new-line">
          {title}
        </h5>
      </Modal.Header>
      <Modal.Body>
        <SearchTable
          className="dataTable"
          DATA={data}
          COLUMNS={columns}
          select={select}
          MODEL_NAME={MODEL_NAME}
          successFunction={successFunction}
          paginationProps={paginationProps}
          payloadDomain={payloadDomain}
          payloadDomainContext={payloadDomainContext}
          extraFields={extraFields}
          currentValue={currentValue}
          checked={checked}
          setChecked={setChecked}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton
            theme="tertiary"
            onClick={() => {
              setShow(false);
              closeHandler();
            }}
          />
          <PrimaryButton
            theme="secondary"
            disabled={checked.length === 0}
            onClick={() => {
              selectHandler();
              setShow(false);
              closeHandler();
            }}
            text="LBL_SELECT"
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SearchModal;
