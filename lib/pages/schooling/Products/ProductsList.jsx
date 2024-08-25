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
import { useProductsServices } from '../../../services/apis/useProductsServices';
import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';

const DempPage1List = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'CANTEEN_PRODUCTS';
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { t } = useTranslation();
  const { fetchProducts, deleteProduct } = useProductsServices();

  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fields = [
    { accessor: 'code', Header: t('LBL_PRODUCT_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_PRODUCT_NAME'), type: 'text' },
    { accessor: 'product_type', Header: t('LBL_PRODUCT_TYPE'), type: 'text', translate: true },

    { accessor: 'unit', Header: t('LBL_UNIT'), type: 'text' },
    { accessor: 'sale_price', Header: t('LBL_SALE_PRICE'), type: 'text' },
    {
      accessor: 'purchase_price',
      Header: t('LBL_PURCHASE_PRICE'),
      type: 'text',
    },
  ];

  const subTitles = [
    { label: 'LBL_SALE_PRICE', key: 'sale_price' },
    { label: 'LBL_PURCHASE_PRICE', key: 'purchase_price' },
    {
      key: 'sale_price',
      label: t('LBL_SALE_PRICE'),
    },
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

    const data = await fetchProducts(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize'),
      },
      () => {
        setLoading(false);
      }
    );
    setFetchedData(data);
  };

  useEffect(() => {
    importData();
  }, [searchParams]);

  const deleteHandler = id => {
    setLoading(true);

    const successHandler = () => {
      setLoading(false);
      importData();
    };

    deleteProduct(id, successHandler);
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
                  <h4>{t('LBL_PRODUCTS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <AddButton
                    text="LBL_ADD_PRODUCT"
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
                            setActionInProgress={setActionInProgress}
                            setChecked={setChecked}
                            label1={record.sellable ? { value: 'LBL_SELLABLE' } : null}
                            label2={record.purchasable ? { value: 'LBL_PURCHASABLE' } : null}
                            deleteHandler={deleteHandler}
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

export default DempPage1List;
