import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import { useProductsServices } from '../../../services/apis/useProductsServices';
import BackButton from '../../../components/ui/buttons/BackButton';
import ProductsForm from './ProductForm';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';

const ProductManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();
  const btnRef = useRef();
  const { fetchProduct } = useProductsServices();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchProduct(id, () => setLoading(false));
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
                <h4>{addNew ? t('LBL_ADD_PRODUCT') : enableEdit ? t('LBL_EDIT_PRODUCT') : t('LBL_VIEW_PRODUCT')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {/* {!addNew && <ProductsForm mode={enableEdit ? 'edit' : 'view'} btnRef={btnRef} data={data} />}
              {addNew && <ProductsForm mode="add" btnRef={btnRef} />} */}

              {loading ? (
                <div style={{ marginTop: '20rem' }}>
                  <CircleSkeleton height="200" isNoData={true} />
                </div>
              ) : (
                (Object.keys(data).length > 0 || addNew) && (
                  <>
                    {!addNew && <ProductsForm mode={enableEdit ? 'edit' : 'view'} btnRef={btnRef} data={data} />}
                    {addNew && <ProductsForm mode="add" btnRef={btnRef} />}
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

export default ProductManage;
