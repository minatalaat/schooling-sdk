import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CanteenCategoriesForm from './CanteenCategoriesForm';
import { useCategoriesServices } from '../../../services/apis/useCategoriesServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';

const CanteenCategoriesManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();
  const btnRef = useRef(null);
  const { fetchCategory } = useCategoriesServices();
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [data, setData] = useState({});

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchCategory(id, () => setLoading(false));
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

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
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {/* {showDelete && (
                <ConfirmationPopup item={data.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )} */}

              {loading ? (
                <div style={{ marginTop: '20rem' }}>
                  <CircleSkeleton height="200" isNoData={true} />
                </div>
              ) : (
                (Object.keys(data).length > 0 || addNew) && (
                  <>
                    {!addNew && <CanteenCategoriesForm enableEdit={enableEdit} data={data} btnRef={btnRef} />}
                    {addNew && <CanteenCategoriesForm addNew={addNew} btnRef={btnRef} />}
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CanteenCategoriesManage;
