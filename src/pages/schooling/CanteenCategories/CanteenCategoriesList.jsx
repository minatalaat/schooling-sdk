import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Toolbar from '../../../components/Toolbar/Toolbar';
import MoreAction from '../../../components/ui/MoreAction/MoreAction';
import AddButton from '../../../components/ui/buttons/AddButton';
import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import { useCategoriesServices } from '../../../services/apis/useCategoriesServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
// import ImportData from '../../components/Toolbar/ImportData';

const CanteenCategoriesList = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'CANTEEN_CATEGORIES';
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchCategories, deleteCategory } = useCategoriesServices();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fields = [
    { accessor: 'id', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_CATEGORY_NAME_EN'), type: 'text' },
    { accessor: 'name_ar', Header: t('LBL_CATEGORY_NAME_AR'), type: 'text' },
  ];

  const subTitles = [
    { label: 'LBL_CATEGORY_NAME_EN', key: 'first_name' },
    { label: 'LBL_CATEGORY_NAME_AR', key: 'status' },
  ];

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  const importData = async () => {
    setLoading(true);
    const data = await fetchCategories(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize'),
      },
      () => setLoading(false)
    );
    setFetchedData(data);
  };

  useEffect(() => {
    importData();
  }, [searchParams]);
  const modifiedArray = checked?.map(obj => {
    return { id: obj.id };
  });

  const deleteHandler = id => {
    setLoading(true);

    const successHandler = () => {
      setLoading(false);
      importData();
    };

    if (checked?.length > 0) {
      deleteCategory(
        {
          records: modifiedArray,
        },
        successHandler
      );
    } else {
      deleteCategory(
        {
          records: [{ id }],
        },
        successHandler
      );
    }
  };

  return (
    <>
        {actionInProgress && <div className="lodingpage"></div>}

      <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData.data || []}
        setActionInProgress={setActionInProgress}

      />
      {loading ? (
        <div style={{ marginTop: '20rem' }}>
          <CircleSkeleton height="200" isNoData={true} />
        </div>
      ) : (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row"></div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_CANTEEN_CATEGORIES')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <AddButton
                    text="LBL_ADD_CATEGORRY"
                    id="buttonid"
                    onClick={() => {
                      navigate(featuresEnum[subFeature].PATH + '/add');
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={fetchedData.data || []}
                  filter={true}
                  refreshData={() => {}}
                  deleteHandler={deleteHandler}
                  bulkActionConfig={{
                    canDelete: true,
                  }}
                  setActionInProgress={setActionInProgress}

                />

                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={fetchedData.data || []}
                    total={fetchedData.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {fetchedData.data &&
                      fetchedData.data.length > 0 &&
                      fetchedData.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            checked={checked}
                            setChecked={setChecked}
                            feature={feature}
                            subFeature={subFeature}
                            deleteHandler={deleteHandler}
                            isDeletable={true}
                            setActionInProgress={setActionInProgress}

                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={fetchedData.total || 0}>
                    {fetchedData.data &&
                      fetchedData.data.length > 0 &&
                      fetchedData.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            checked={checked}
                            setChecked={setChecked}
                            deleteHandler={deleteHandler}
                            setActionInProgress={setActionInProgress}

                          />
                        );
                      })}
                  </CardsList>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CanteenCategoriesList;
