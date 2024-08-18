import { useDispatch } from 'react-redux';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { alertsActions } from '../../store/alerts';

const HRConfiguration = props => {
  let { formik } = props;

  const dispatch = useDispatch();

  const onGetPublicHolidayPlanning = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onGetWeeklyPlanning = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null)
      return dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <SearchModalAxelor formik={formik} modelKey="PUBLIC_HOLIDAYS_PLAN" mode="edit" onSuccess={onGetPublicHolidayPlanning} />
        </div>
        <div className="col-md-6">
          <SearchModalAxelor formik={formik} modelKey="WEEKLY_PLANNING" mode="edit" onSuccess={onGetWeeklyPlanning} />
        </div>
      </div>
    </div>
  );
};

export default HRConfiguration;
