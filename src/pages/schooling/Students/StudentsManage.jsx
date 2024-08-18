import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import StudentsForm from './StudentsForm';
import { useStudentsServices } from '../../../services/apis/useStudentsServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';

const StudentsManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();
  const { fetchStudent } = useStudentsServices();
  const ref = useRef();
  const [showDelete, setShowDelete] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchStudent(id, () => setLoading(false));
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
                <h4>{addNew ? t('LBL_NEW_RECORD') : data?.name ? `${data?.name} ${t('LBL_DETAILS')}` : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && (
                  <PrimaryButton
                    btnOptions={{
                      type: 'submit',
                    }}
                    disabled={false}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup item={data?.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )}

              {loading ? (
                <div style={{ marginTop: '20rem' }}>
                  <CircleSkeleton height="200" isNoData={true} />
                </div>
              ) : (
                ((data && Object.keys(data).length > 0) || addNew) && (
                  <>
                    {!addNew && <StudentsForm enableEdit={enableEdit} data={data} submitBtn={ref} />}
                    {addNew && <StudentsForm addNew={addNew} submitBtn={ref} />}
                  </>
                )
              )}

              {/* {((data && Object.keys(data).length > 0) || addNew) && (
                <>
                  {!addNew && <StudentsForm enableEdit={enableEdit} data={data} submitBtn={ref} />}
                  {addNew && <StudentsForm addNew={addNew} submitBtn={ref} />}
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentsManage;
