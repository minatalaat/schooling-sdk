import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

import Products from './Products';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import ViewProduct from './ViewProduct';

import { useFeatures } from '../../hooks/useFeatures';

const MainProducts = () => {
  const feature = 'PRODUCT_MASTER_DATA';
  const subFeature = 'PRODUCTS';
  const { t } = useTranslation();

  const productConfig = useMemo(() => {
    return {
      tourConfig: {
        listSteps: [
          {
            target: `.step-add-product`,
            title: <strong>{t('LBL_ADD_PRODUCT')}</strong>,
            content: t('LBL_ADD_PRODUCT_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-dummy`,
            title: <strong>{t('LBL_ADD_PRODUCT')}</strong>,
            content: t('LBL_ADD_PRODUCT_DESC'),
            disableBeacon: true,
          },
        ],
        addSteps: [
          {
            target: `.step-add-product-1`,
            title: <strong>{t('LBL_ADD_PRODUCT_1')}</strong>,
            content: t('LBL_ADD_PRODUCT_1_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-add-product-2`,
            title: <strong>{t('LBL_ADD_PRODUCT_2')}</strong>,
            content: t('LBL_ADD_PRODUCT_2_DESC'),
            disableBeacon: true,
          },

          {
            target: `.step-add-product-3`,
            title: <strong>{t('LBL_ADD_PRODUCT_3')}</strong>,
            content: t('LBL_ADD_PRODUCT_3_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-add-product-submit`,
            title: <strong>{t('LBL_ADD_PRODUCT_4')}</strong>,
            content: t('LBL_ADD_PRODUCT_4_DESC'),
            disableBeacon: true,
          },
        ],
      },
    };
  }, []);

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<Products feature={feature} subFeature={subFeature} productConfig={productConfig} />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditProduct feature={feature} subFeature={subFeature} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewProduct feature={feature} subFeature={subFeature} />} />}
      {canAdd && (
        <Route
          path={featuresEnum[subFeature].ADD_ONLY}
          element={<AddProduct feature={feature} subFeature={subFeature} productConfig={productConfig} />}
        />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainProducts;
