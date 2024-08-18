import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import StudentsForm from './PreOrdersForm';
import { usePreOrderServices } from '../../../services/apis/usePreOrderServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';

const PreOrdersManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();
  const { fetchPreOrder, collectPreorder } = usePreOrderServices();

  const [showDelete, setShowDelete] = useState(false);
  const [data, setData] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);

    const successHandler = () => {
      setLoading(false);
    };

    const data = await fetchPreOrder(id, successHandler);
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

  const handelCollect = async () => {
    setLoading(true);

    const successHandler = data => {
      // console.log(data);
      setShowDelete(false);
      setStatus(data?.data?.returnedObject?.cartStatusDisplay);
      setLoading(false);
      setData(data?.data?.returnedObject);
    };

    await collectPreorder(id, successHandler);
    // setStatus('SUCCESS');
    // setShowDelete(true);
  };

  return (
    <>
      <div className="page-body">
        {loading ? (
          <div style={{ marginTop: '20rem' }}>
            <CircleSkeleton height="200" isNoData={true} />
          </div>
        ) : (
          <div className="container-fluid">
            <div className="row"></div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{addNew ? t('LBL_NEW_RECORD') : data.name ? data.name : ''}</h4>
                </div>

                <div className="reverse-page float-end">
                  <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                  {data?.cartStatus != 'SUCCESS' && (
                    <PrimaryButton onClick={() => setShowDelete(true)} disabled={false} text="LBL_ORDER_PICKUP" />
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                {showDelete && <ConfirmationPopup mode="preOrder" onClickHandler={handelCollect} setConfirmationPopup={setShowDelete} />}

                {(Object.keys(data).length > 0 || addNew) && (
                  <>
                    {!addNew && <StudentsForm enableEdit={enableEdit} data={data} status={status} />}
                    {addNew && <StudentsForm addNew={addNew} status={status} />}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PreOrdersManage;
