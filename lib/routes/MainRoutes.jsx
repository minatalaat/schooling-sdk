import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SchoolingProvider } from '../context/SchoolingProvider';
import ProductsMain from '../pages/schooling/Products/ProductsMain';
import BusesMain from '../pages/schooling/Buses/BusesMain';
import { featuresEnum } from '../constants/featuresEnum/featuresEnum';
import CanteenCategoriesMain from '../pages/schooling/CanteenCategories/CanteenCategoriesMain';
import StudentsMain from '../pages/schooling/Students/StudentsMain';
import ClassesMain from '../pages/schooling/Classes/ClassesMain';
import PreOrdersMain from '../pages/schooling/PreOrders/PreOrdersMain';
import CartMain from '../pages/schooling/Cart/CartMain';
import SupervisorsMain from '../pages/schooling/Supervisors/SupervisorsMain';
import GradesMain from '../pages/schooling/Grades/GradesMain';

export  function SchoolingMainRoutes({ key, baseRoute }) {

  useEffect(() => {
    // Handle route change or trigger a re-render
  }, [key]);

  return (
    <>
     <Router>
      <SchoolingProvider baseRoute={baseRoute ?? ''}>
        <Routes>
          
          <Route path={`${featuresEnum['CANTEEN_PRODUCTS'].PATH}/*`} element={<ProductsMain />} />
          <Route path={`${featuresEnum['BUSES'].PATH}/*`} element={<BusesMain />} />
          <Route path={`${featuresEnum['CANTEEN_CATEGORIES'].PATH}/*`} element={<CanteenCategoriesMain />} />
          <Route path={`${featuresEnum['STUDENTS'].PATH}/*`} element={<StudentsMain />} />
          <Route path={`${featuresEnum['CLASSES'].PATH}/*`} element={<ClassesMain />} />
          <Route path={`${featuresEnum['PRE_ORDERS'].PATH}/*`} element={<PreOrdersMain />} />
          <Route path={`${featuresEnum['CART'].PATH}/*`} element={<CartMain />} />
          <Route path={`${featuresEnum['SUPERVISORS'].PATH}/*`} element={<SupervisorsMain />} />
          <Route path={`${featuresEnum['GRADES'].PATH}/*`} element={<GradesMain />} />
        
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SchoolingProvider>
    </Router>
    </>
  );
}
