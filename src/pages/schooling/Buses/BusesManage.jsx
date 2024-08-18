import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CanteenCategoriesForm from './BusesForm';
import { useBusesServices } from '../../../services/apis/useBusesServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import BusChangePasswordPopup from '../../../components/modals/BusChangePassword';

const BusesManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();
  const btnRef = useRef(null);
  const { fetchBus, updateBus } = useBusesServices();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [data, setData] = useState({});

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchBus(id, () => setLoading(false));
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

  const onClickHandler = values => {
    updateBus(data?.id, { ...values }, () => {
      setShowChangePassword(false);
    });
  };

  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row"></div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_ADD_BUSES') : data?.name ? data?.name : t('LBL_DETAILS_BUSES')}</h4>
              </div>

              <div className="reverse-page float-end">
                {(addNew || enableEdit) && <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />}
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
                {!addNew && !enableEdit && (
                  <>
                    <PrimaryButton
                      onClick={() => setShowChangePassword(true)}
                      disabled={false}
                      text={t('LBL_CHANGE_PASSWORD')}
                      className="bg-transparent border-2 border-primary text-primary"
                    />
                    <PrimaryButton
                      onClick={() => navigate(`/school/buses/student-list/${id}?page=0&size=10`)}
                      disabled={false}
                      text={t('LBL_STUDENT_LIST')}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup item={data?.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )}
              {showChangePassword && (
                <BusChangePasswordPopup
                  item={data}
                  onClickHandler={onClickHandler}
                  setShowChangePassword={setShowChangePassword}
                  setShowDelete={setShowDelete}
                />
              )}
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
              {/* {(Object.keys(data).length > 0 || addNew) && (
                <>
                  {!addNew && <CanteenCategoriesForm enableEdit={enableEdit} data={data} btnRef={btnRef} />}
                  {addNew && <CanteenCategoriesForm addNew={addNew} btnRef={btnRef} />}
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusesManage;
