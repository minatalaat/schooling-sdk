// import { useState } from 'react';
// import * as Yup from 'yup';
// import { useFormik } from 'formik';
// import { Toast, ToastContainer } from 'react-bootstrap';
// import { useTranslation } from 'react-i18next';
// import { useDispatch, useSelector } from 'react-redux';

// import Spinner from '../../components/Spinner/Spinner';
// import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

// import qaemaLogo from '../../assets/images/logo/full-logo.svg';
// import { setItem } from '../../utils/localStorage';

// import { VALID_PASSWORD_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
// import useChangePasswordServices from '../../services/apis/useChangePasswordServices';
// import { alertsActions } from '../../store/alerts';
// import PasswordInput from '../../components/ui/inputs/PasswordInput';
// import i18next from 'i18next';

// function ChangeUserPassword() {
//   const dispatch = useDispatch();

//   const { t } = useTranslation();
//   const { saveFirstLoginChangesService, changePasswordService } = useChangePasswordServices();

//   const { firstLogin } = useSelector(state => state.auth);
//   const [showToast, setShowToast] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [passwordChanged, setPasswordChanged] = useState(false);

//   const initVals = {
//     password: '',
//     confirmPassword: '',
//   };
//   const valSchema = Yup.object({
//     password: Yup.string()
//       .required(t('PASSWORD_VALIDATION_MESSAGE'))
//       .matches(VALID_PASSWORD_WITH_SPECIAL_CHARS, t('VALID_PASSWORD_VALIDATION_MESSAGE')),
//     confirmPassword: Yup.string()
//       .required(t('RETYPE_PASSWORD_VALIDATION_MESSAGE'))
//       .oneOf([Yup.ref('password'), null], t('VALID_RETYPE_PASSWORD_VALIDATION_MESSAGE')),
//   });

//   const submit = async () => {
//     setIsLoading(true);

//     try {
//       if (firstLogin) {
//         const res = await saveFirstLoginChangesService(formik.values);
//         if (!res) return dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
//         setPasswordChanged(true);
//       } else {
//         const res = await changePasswordService(formik.values);
//         if (!res) return null;
//         setPasswordChanged(true);
//       }
//     } catch (err) {
//       return null;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formik = useFormik({
//     initialValues: initVals,
//     validationSchema: valSchema,
//     onSubmit: submit,
//     validateOnMount: true,
//   });

//   const onChangeLanguageClick = () => {
//     setItem('code', i18next.language === 'en' ? 'ar' : 'en');
//     window.location.reload(true);
//   };

//   return (
//     <>
//       {isLoading && <Spinner />}
//       <div className="container-fluid zoom-one">
//         <div className="row">
//           <div className="col-xl-6 order-1 p-0">
//             <div className="login-bg">
//               <div className="login-welcome">
//                 <h1 className="hero-title">
//                   {t('WE_BRING_SUCCESS')} <br /> {t('TO_YOUR_BUISNESS')}
//                 </h1>
//                 <p className="hero-subtitle">{t('MANAGE_YOUR_FINANCE')}</p>
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-6">
//             <div className="row">
//               <div className="col-md-8 mx-auto">
//                 <div className="login-card">
//                   <nav className="navbar">
//                     <div className="container-fluid">
//                       <a className="navbar-brand">
//                         <img src={qaemaLogo} alt="qaema logo" className="login-card-logo" />
//                       </a>
//                       <div className="dropdown-center">
//                         <ul className={`   justify-content-end  `}>
//                           <li
//                             className="nav-item    d-flex align-items-center mx-3  mt-3 lang-btn "
//                             onClick={() => onChangeLanguageClick()}
//                           >
//                             <p> {t('LANGUAGE') === 'English' ? 'العربية' : 'English'}</p>
//                           </li>
//                         </ul>
//                       </div>
//                     </div>
//                   </nav>
//                   <div className="login-main">
//                     <form className="login-form-floating-style needs-validation" onSubmit={formik.handleSubmit}>
//                       <h4>{t('LBL_ENTER_NEW_PASSWORD')}</h4>
//                       {showToast && (
//                         <ToastContainer
//                           position="top-center"
//                           containerPosition="relative"
//                           className="mb-3"
//                           style={{
//                             width: '300px',
//                           }}
//                         >
//                           <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide bg="danger">
//                             <Toast.Body className="text-white">{t('UN_AUTHORIZED')}</Toast.Body>
//                           </Toast>
//                         </ToastContainer>
//                       )}

//                       <PasswordInput formik={formik} mode="add" accessor="password" label="LBL_NEW_PASSWORD" />
//                       <PasswordInput formik={formik} mode="add" accessor="confirmPassword" label="LBL_RETYPE_NEW_PASSWORD" />

//                       <div className="form-group mb-0">
//                         <PrimaryButton theme="submitBlue" type="submit" text="LBL_CONTINUE" disabled={passwordChanged} />
//                       </div>
//                     </form>
//                   </div>
//                   <div className="copyright">
//                     <p>{t('Footer_Copyright')}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default ChangeUserPassword;
