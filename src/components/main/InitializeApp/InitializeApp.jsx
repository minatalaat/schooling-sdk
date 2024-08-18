import { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import { useInitializationServices } from '../../../services/apis/useInitializationServices';
import ProductsMain from '../../../pages/schooling/Products/ProductsMain';
import BusesMain from '../../../pages/schooling/Buses/BusesMain';
import StudentsMain from '../../../pages/schooling/Students/StudentsMain';
import CanteenCategoriesMain from '../../../pages/schooling/CanteenCategories/CanteenCategoriesMain';
import ClassesMain from '../../../pages/schooling/Classes/ClassesMain';
import PreOrdersMain from '../../../pages/schooling/PreOrders/PreOrdersMain';
import CartMain from '../../../pages/schooling/Cart/CartMain';
import SupervisorsMain from '../../../pages/schooling/Supervisors/SupervisorsMain';
import GradesMain from '../../../pages/schooling/Grades/GradesMain';

export default function InitializeApp() {
  const { initiateAppService, getPublicKeyService } = useInitializationServices();

  const { publicKey } = useSelector(state => state.userFeatures);

  const routes = {
    CANTEEN_PRODUCTS: [<Route path={featuresEnum['CANTEEN_PRODUCTS'].PATH + '/*'} element={<ProductsMain />} />],
    BUSES: [<Route path={featuresEnum['BUSES'].PATH + '/*'} element={<BusesMain />} />],
    STUDENTS: [<Route path={featuresEnum['STUDENTS'].PATH + '/*'} element={<StudentsMain />} />],
    CANTEEN_CATEGORIES: [<Route path={featuresEnum['CANTEEN_CATEGORIES'].PATH + '/*'} element={<CanteenCategoriesMain />} />],
    CLASSES: [<Route path={featuresEnum['CLASSES'].PATH + '/*'} element={<ClassesMain />} />],
    PRE_ORDERS: [<Route path={featuresEnum['PRE_ORDERS'].PATH + '/*'} element={<PreOrdersMain />} />],
    CART: [<Route path={featuresEnum['CART'].PATH + '/*'} element={<CartMain />} />],
    SUPERVISORS: [<Route path={featuresEnum['SUPERVISORS'].PATH + '/*'} element={<SupervisorsMain />} />],
    GRADES: [<Route path={featuresEnum['GRADES'].PATH + '/*'} element={<GradesMain />} />],
  };

  const initiateApp = () => {
    if (!publicKey) return getPublicKeyService();

    return initiateAppService(routes);
  };

  useEffect(() => {
    initiateApp();
  }, [publicKey]);

  return null;
}
