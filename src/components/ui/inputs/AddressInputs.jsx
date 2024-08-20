// import { useEffect, useState } from 'react';
// import * as Yup from 'yup';
// import { useFormik } from 'formik';
// import { useTranslation } from 'react-i18next';
// import { SpinnerCircular } from 'spinners-react';

// import SearchModalAxelor from './SearchModal/SearchModalAxelor';
// import TextInput from './TextInput';

// import { useAxiosFunction } from '../../../hooks/useAxios';
// import { getModelUrl } from '../../../services/getUrl';
// import { MODELS } from '../../../constants/models';
// import { VALID_TEXT_WITH_SPECIAL_CHARS, VALID_POSTAL_CODE, NOT_MORE_THAN_FOUR_DIGITS, NUMBERS_ONLY } from '../../../constants/regex/Regex';
// import { onCountriesSuccess, onCitiesSuccess } from '../../../utils/successFnHelpers';
// import { setFieldValue } from '../../../utils/formHelpers';
// import { defaultSAPayloadDomain, getAddressL6 } from '../../../utils/addressHelpers';

// export default function AddressInputs({ onValidate, isSave, finshedSaveHandler, closeModalHandler }) {
//   const { t } = useTranslation();
//   const { api } = useAxiosFunction();

//   const [isLoading, setIsLoading] = useState(false);

//   const initialValues = {
//     country: null,
//     city: null,
//     district: '',
//     buildingNumber: '',
//     streetNumber: '',
//     postalCode: '',
//   };

//   const validationSchema = Yup.object().shape({
//     country: Yup.object().required(t('REQUIRED')).nullable(),
//     city: Yup.object().required(t('REQUIRED')).nullable(),
//     district: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
//     buildingNumber: Yup.string()
//       .matches(NUMBERS_ONLY, t('BUILDING_NUMBER_VALIDATION'))
//       .matches(NOT_MORE_THAN_FOUR_DIGITS, t('BUILDING_NUMBER_LENGTH_VALIDATION'))
//       .required(t('REQUIRED'))
//       .trim(),
//     postalCode: Yup.string().matches(VALID_POSTAL_CODE, t('POSTAL_CODE_VALIDATION_MESSAGE_2')).required(t('REQUIRED')).trim(),
//     streetNumber: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
//   });

//   const formik = useFormik({
//     initialValues,
//     validationSchema,
//     validateOnMount: true,
//     validateOnChange: true,
//   });

//   const saveAddress = () => {
//     setIsLoading(true);
//     let payload = {
//       data: {
//         addressL7Country: formik.values.country ? { id: formik.values.country?.id } : null,
//         city: formik.values.city ? { id: formik.values.city?.id } : null,
//         zip: formik.values.postalCode || '',
//         streetNumber: formik.values.streetNumber || '',
//         street: null,
//         addressL4: formik.values.buildingNumber || '',
//         addressL3: formik.values.district || '',
//         addressL6: getAddressL6(formik.values),
//       },
//     };
//     api('POST', getModelUrl(MODELS.ADDRESS), payload, res => {
//       if (res.data.status === 0) {
//         if (res.data?.data?.length > 0) {
//           setIsLoading(false);
//           finshedSaveHandler(res.data.data[0]);
//           closeModalHandler();
//         }
//       } else {
//         setIsLoading(false);
//       }
//     });
//   };

//   useEffect(() => {
//     if (onValidate) onValidate(formik.isValid);
//   }, [formik.isValid]);

//   useEffect(() => {
//     if (isSave) saveAddress();
//   }, [isSave]);

//   const customDefaultSuccess = async response => {
//     if (
//       response?.data?.status !== 0 ||
//       response?.data?.total === null ||
//       response?.data?.total === undefined ||
//       response?.data?.total === 0 ||
//       response?.data?.data?.length === 0
//     )
//       return;
//     let country = response.data.data[0];
//     country.name = country['$t:name'];
//     setFieldValue(formik, 'country', country || null);
//   };

//   return (
//     <>
//       {isLoading && (
//         <div className="text-center">
//           <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
//         </div>
//       )}
//       {!isLoading && (
//         <div className="row">
//           <div className="col-md-6" key="country">
//             <SearchModalAxelor
//               formik={formik}
//               modelKey="COUNTRIES"
//               mode="add"
//               isRequired={true}
//               defaultValueConfig={{
//                 payloadDomain: defaultSAPayloadDomain,
//                 customDefaultSuccess: customDefaultSuccess,
//               }}
//               onSuccess={onCountriesSuccess}
//               selectCallback={() => {
//                 setFieldValue(formik, 'city', null);
//               }}
//               removeCallback={() => {
//                 setFieldValue(formik, 'city', null);
//               }}
//             />
//           </div>
//           <div className="col-md-6" key="city">
//             <SearchModalAxelor
//               formik={formik}
//               modelKey="CITY"
//               mode="add"
//               isRequired={true}
//               defaultValueConfig={formik.values.country?.id ? { payloadDomain: `self.country.id = ${formik.values.country?.id}` } : null}
//               payloadDomain={`self.country.id = ${formik.values.country?.id}`}
//               onSuccess={onCitiesSuccess}
//             />
//           </div>
//           <div className="col-md-6" key="district">
//             <TextInput formik={formik} label="LBL_DISTRICT" accessor="district" mode="add" isRequired={true} />
//           </div>
//           <div className="col-md-6" key="buildingNumber">
//             <TextInput formik={formik} label="LBL_BUILDING_NUMBER" accessor="buildingNumber" mode="add" isRequired={true} />
//           </div>
//           <div className="col-md-6" key="streetNumber">
//             <TextInput formik={formik} label="LBL_STREET_NUMBER" accessor="streetNumber" mode="add" isRequired={true} />
//           </div>
//           <div className="col-md-6" key="postalCode">
//             <TextInput formik={formik} label="LBL_POSTAL_CODE" accessor="postalCode" mode="add" isRequired={true} />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';

import SearchModalAxelor from './SearchModal/SearchModalAxelor';
import TextInput from './TextInput';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { VALID_TEXT_WITH_SPECIAL_CHARS, VALID_POSTAL_CODE, NOT_MORE_THAN_FOUR_DIGITS, NUMBERS_ONLY } from '../../../constants/regex/Regex';
import { onCountriesSuccess, onCitiesSuccess } from '../../../utils/successFnHelpers';
import { setFieldValue } from '../../../utils/formHelpers';
import { defaultSAPayloadDomain, getAddressL6 } from '../../../utils/addressHelpers';

export default function AddressInputs({ onValidate, isSave, finshedSaveHandler, closeModalHandler }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    country: null,
    city: null,
    district: '',
    buildingNumber: '',
    streetNumber: '',
    postalCode: '',
  };

  const validationSchema = Yup.object().shape({
    country: Yup.object().required(t('REQUIRED')).nullable(),
    city: Yup.object().required(t('REQUIRED')).nullable(),
    district: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    buildingNumber: Yup.string()
      .matches(NUMBERS_ONLY, t('BUILDING_NUMBER_VALIDATION'))
      .matches(NOT_MORE_THAN_FOUR_DIGITS, t('BUILDING_NUMBER_LENGTH_VALIDATION'))
      .required(t('REQUIRED'))
      .trim(),
    postalCode: Yup.string().matches(VALID_POSTAL_CODE, t('POSTAL_CODE_VALIDATION_MESSAGE_2')).required(t('REQUIRED')).trim(),
    streetNumber: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
    validateOnChange: true,
  });

  const saveAddress = () => {
    setIsLoading(true);
    let payload = {
      data: {
        addressL7Country: formik.values.country ? { id: formik.values.country?.id } : null,
        city: formik.values.city ? { id: formik.values.city?.id } : null,
        zip: formik.values.postalCode || '',
        streetNumber: formik.values.streetNumber || '',
        street: null,
        addressL4: formik.values.buildingNumber || '',
        addressL3: formik.values.district || '',
        addressL6: getAddressL6(formik.values),
      },
    };
    api('POST', getModelUrl(MODELS.ADDRESS), payload, res => {
      if (res.data.status === 0) {
        if (res.data?.data?.length > 0) {
          setIsLoading(false);
          finshedSaveHandler(res.data.data[0]);
          closeModalHandler();
        }
      } else {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    if (onValidate) onValidate(formik.isValid);
  }, [formik.isValid]);

  useEffect(() => {
    if (isSave) saveAddress();
  }, [isSave]);

  const customDefaultSuccess = async response => {
    if (
      response?.data?.status !== 0 ||
      response?.data?.total === null ||
      response?.data?.total === undefined ||
      response?.data?.total === 0 ||
      response?.data?.data?.length === 0
    )
      return;
    let country = response.data.data[0];
    country.name = country['$t:name'];
    setFieldValue(formik, 'country', country || null);
  };

  return (
    <>
      {isLoading && (
        <div className="text-center">
          <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )}
      {!isLoading && (
        <div className="row">
          <div className="col-md-6" key="country">
            <SearchModalAxelor
              formik={formik}
              modelKey="COUNTRIES"
              mode="add"
              isRequired={true}
              defaultValueConfig={{
                payloadDomain: defaultSAPayloadDomain,
                customDefaultSuccess: customDefaultSuccess,
              }}
              onSuccess={onCountriesSuccess}
              selectCallback={() => {
                setFieldValue(formik, 'city', null);
              }}
              removeCallback={() => {
                setFieldValue(formik, 'city', null);
              }}
            />
          </div>
          <div className="col-md-6" key="city">
            <SearchModalAxelor
              formik={formik}
              modelKey="CITY"
              mode="add"
              isRequired={true}
              defaultValueConfig={formik.values.country?.id ? { payloadDomain: `self.country.id = ${formik.values.country?.id}` } : null}
              payloadDomain={`self.country.id = ${formik.values.country?.id}`}
              onSuccess={onCitiesSuccess}
            />
          </div>
          <div className="col-md-6" key="district">
            <TextInput formik={formik} label="LBL_DISTRICT" accessor="district" mode="add" isRequired={true} />
          </div>
          <div className="col-md-6" key="buildingNumber">
            <TextInput formik={formik} label="LBL_BUILDING_NUMBER" accessor="buildingNumber" mode="add" isRequired={true} />
          </div>
          <div className="col-md-6" key="streetNumber">
            <TextInput formik={formik} label="LBL_STREET_NUMBER" accessor="streetNumber" mode="add" isRequired={true} />
          </div>
          <div className="col-md-6" key="postalCode">
            <TextInput formik={formik} label="LBL_POSTAL_CODE" accessor="postalCode" mode="add" isRequired={true} />
          </div>
        </div>
      )}
    </>
  );
}
