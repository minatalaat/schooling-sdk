import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Table from '../../../components/ListingTable/Table.jsx';
import TableRow from '../../../components/ListingTable/TableRow.jsx';
import CardsList from '../../../components/CardsList/CardsList.jsx';
import Card from '../../../components/CardsList/Card.jsx';
import Toolbar from '../../../components/Toolbar/Toolbar.jsx';
import MoreAction from '../../../components/ui/MoreAction/MoreAction.jsx';
import { usePreOrderServices } from '../../../services/apis/usePreOrderServices.js';
import AddButton from '../../../components/ui/buttons/AddButton.jsx';
import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum.js';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton.jsx';

const PreOrdersList = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'PRE_ORDERS';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchPreOrders } = usePreOrderServices();
  const [searchParams] = useSearchParams();

  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fields = [
    { accessor: 'id', Header: t('LBL_ORDER_NUMBER'), type: 'text', translate: true },
    { accessor: 'date', Header: t('LBL_ORDER_DATE'), type: 'text', translate: true },
    { accessor: 'studentName', Header: t('LBL_ORDER_STUDENT'), type: 'text', translate: true },
    { accessor: 'numberOfItems', Header: t('LBL_ORDER_ITEMS'), type: 'text', translate: true },
    { accessor: 'total', Header: t('LBL_ORDER_PRICE'), type: 'text', translate: true },
    {
      accessor: 'cartStatusDisplay',
      Header: t('LBL_STATUS'),
      type: 'text',
      translate: true,
    },
  ];

  const mappedData = fetchedData?.data?.map(data => {
    return {
      ...data,
      date: data?.purchaseDate?.join('-'),
      studentName: data?.student?.name,
    };
  });
  const subTitles = [
    { key: 'id', label: t('LBL_ORDER_NUMBER'), type: 'text' },
    { key: 'date', label: t('LBL_ORDER_DATE'), type: 'date' },
    { key: 'studentName', label: t('LBL_ORDER_STUDENT'), type: 'text', translate: true },
    { key: 'numberOfItems', label: t('LBL_ORDER_ITEMS'), type: 'text' },
    { key: 'total', label: t('LBL_ORDER_PRICE'), type: 'text' },
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
    const data = await fetchPreOrders(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize') || 10,
      },
      () => setLoading(false)
    );
    setFetchedData(data);
  };

  useEffect(() => {
    importData();
  }, [searchParams]);

  return (
    <>
      <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData.data || []}
      />

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
                  <h4>{t('LBL_PRE_ORDERS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <AddButton
                    text="LBL_CREATE_ORDER"
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
                  bulkActionConfig={{
                    canDelete: true,
                  }}
                />

                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={mappedData || []}
                    total={fetchedData.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {mappedData &&
                      mappedData.length > 0 &&
                      mappedData.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            checked={checked}
                            setChecked={setChecked}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={false}
                            isDeletable={false}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={fetchedData.total || 0}>
                    {mappedData &&
                      mappedData.length > 0 &&
                      mappedData.map(record => {
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
                            isDeletable={false}
                            isEditable={false}
                            label3={record.cartStatus ? { value: record.cartStatus } : null}
                          />
                        );
                      })}
                  </CardsList>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PreOrdersList;
