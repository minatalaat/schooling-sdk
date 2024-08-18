import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ConfirmationPopup from '../../components/modals/ConfirmationPopup';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import { recordsData } from '../../constants/dummyData/dummyData';
import CanteenCategoriesForm from './CartForm';

const CartManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();

  const [showDelete, setShowDelete] = useState(false);

  const { id } = useParams();

  const data = useMemo(() => recordsData.data.find(rec => +rec.id === +id) || [], [id]);
  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row"></div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_RECORD') : data.name ? data.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton onClick={() => {}} disabled={false} />}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup item={data.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )}

              {(Object.keys(data).length > 0 || addNew) && (
                <>
                  {!addNew && <CanteenCategoriesForm enableEdit={enableEdit} data={data} />}
                  {addNew && <CanteenCategoriesForm addNew={addNew} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartManage;
