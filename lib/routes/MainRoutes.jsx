import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SchoolingProvider } from '../context/SchoolingProvider';
import ProductsMain from '../pages/schooling/Products/ProductsMain';
import BusesMain from '../pages/schooling/Buses/BusesMain';
import CanteenCategoriesMain from '../pages/schooling/CanteenCategories/CanteenCategoriesMain';
import StudentsMain from '../pages/schooling/Students/StudentsMain';
import ClassesMain from '../pages/schooling/Classes/ClassesMain';
import PreOrdersMain from '../pages/schooling/PreOrders/PreOrdersMain';
import CartMain from '../pages/schooling/Cart/CartMain';
import SupervisorsMain from '../pages/schooling/Supervisors/SupervisorsMain';
import GradesMain from '../pages/schooling/Grades/GradesMain';
import { i18nInit } from '../i18n/i18n';
import { FEATURES } from '../constants/Features/features';

export function SchoolRoutes({ lang, baseRoute, env }) {
  useEffect(() => {
    // Handle route change or trigger a re-render
  }, [lang]);

  i18nInit(lang);

  return (
    <>
      <Router>
        <SchoolingProvider baseRoute={baseRoute ?? ''} env={env ?? 'production'}>
          <Routes>
            <Route path={`${baseRoute}${FEATURES['CANTEEN_PRODUCTS'].BASE_PATH}/*`} element={<ProductsMain baseRoute={baseRoute} />} />
            <Route path={`${baseRoute}${FEATURES['BUSES'].BASE_PATH}/*`} element={<BusesMain />} />
            <Route path={`${baseRoute}${FEATURES['CANTEEN_CATEGORIES'].BASE_PATH}/*`} element={<CanteenCategoriesMain />} />
            <Route path={`${baseRoute}${FEATURES['STUDENTS'].BASE_PATH}/*`} element={<StudentsMain />} />
            <Route path={`${baseRoute}${FEATURES['CLASSES'].BASE_PATH}/*`} element={<ClassesMain />} />
            <Route path={`${baseRoute}${FEATURES['PRE_ORDERS'].BASE_PATH}/*`} element={<PreOrdersMain />} />
            <Route path={`${baseRoute}${FEATURES['CART'].BASE_PATH}/*`} element={<CartMain />} />
            <Route path={`${baseRoute}${FEATURES['SUPERVISORS'].BASE_PATH}/*`} element={<SupervisorsMain />} />
            <Route path={`${baseRoute}${FEATURES['GRADES'].BASE_PATH}/*`} element={<GradesMain />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SchoolingProvider>
      </Router>
    </>
  );
}
