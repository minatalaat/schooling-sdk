import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import NoData from '../../components/NoData';
import Spinner from '../../components/Spinner/Spinner';
import Toolbar from '../../parts/Toolbar';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import MoreAction from '../../parts/MoreAction';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getUserProfileByIdUrl, getUserProfilesUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

import NoAppConfig from '../../assets/images/icons/App Config.svg';

function Users({ feature, subFeature }) {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canAdd, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';

  const [show, setShow] = useState('table');
  const [users, setUsers] = useState();
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [checked, setChecked] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'email', Header: t('LBL_EMAIL_ADDRESS'), type: 'text' },
    { accessor: 'mobileNumber', Header: t('LBL_MOBILE_NUMBER'), type: 'text' },
    { accessor: 'fixedPhone', Header: t('LBL_PHONE'), type: 'text' },
    { accessor: 'address', Header: t('LBL_ADDRESS'), type: 'text' },
  ];

  const subTitles = [
    { label: 'LBL_EMAIL_ADDRESS', key: 'email' },
    { label: 'LBL_MOBILE_NUMBER', key: 'mobileNumber' },
    { label: 'LBL_PHONE', key: 'fixedPhone' },
  ];

  const onUserSearchSuccess = response => {
    if (response.data.status === 'Ok') {
      setIsLoading(false);

      if (response.data?.data?.returnedObj?.length === 0) {
        setUsers([]);
        setDisplayedUsers([]);
      } else {
        let users = [];
        let data = response.data.data?.returnedObj;
        let total = response.data?.returnedObj?.length;
        setTotal(total);
        setUsers(data);

        if (data) {
          data.forEach((user, i) => {
            let temp = {
              id: user.id ?? '',
              name: user.name ?? '',
              email: user.email ?? '',
              group: user.group ?? '',
              mobileNumber: user.partner?.mobilePhone ?? '',
              fixedPhone: user.partner?.fixedPhone ?? '',
              address: user.partner?.address
                ? user.partner?.address?.addressL7Country['$t:name'] +
                  ' ' +
                  user.partner?.address?.addressL4 +
                  ' ' +
                  user.partner?.address?.addressL6
                : '',
            };

            users.push(temp);
          });
        }

        setDisplayedUsers(users);
      }
    } else {
      setIsLoading(false);
    }
  };

  const deleteConfirmHandler = ({ id, name }) => {
    if (id) {
      api('DELETE', getUserProfileByIdUrl(id), null, onUsersDeleteSuccess);
    }
  };

  const onUsersDeleteSuccess = response => {
    setActionInProgress(false);

    if (response.data.status === 'Ok') {
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'USER_DELETE_MESSAGE' }));
      refreshHandler();
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const refreshHandler = () => {
    setDisplayedUsers([]);
    setIsLoading(true);
    api('GET', getUserProfilesUrl(), null, onUserSearchSuccess);
  };

  useEffect(() => {
    api('GET', getUserProfilesUrl(), null, onUserSearchSuccess);
  }, []);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {showMoreAction && (
        <MoreAction
          data={users}
          showSearch={false}
          show={show}
          setShow={setShow}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={refreshHandler}
          setActionInProgress={setActionInProgress}
          canSelectAll={false}
        />
      )}
      {!isLoading && displayedUsers && displayedUsers.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoAppConfig}
          noDataMessage={t('NO_USERS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_USER')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
      {isLoading && displayedUsers && displayedUsers.length === 0 && <Spinner />}
      {((!isLoading && searchValue !== '') || (displayedUsers && displayedUsers.length > 0)) && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={feature} subFeature={subFeature} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_USERS')}</h4>
                </div>
                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_USER"
                      onClick={() => {
                        navigate(getFeaturePath(subFeature, 'add'));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={refreshHandler}
                  showSearch={false}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  setActionInProgress={setActionInProgress}
                  data={users}
                  canSelectAll={false}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={displayedUsers}
                    total={total}
                    feature={feature}
                    subFeature={subFeature}
                    hasBulkActions={false}
                    isPagination={false}
                  >
                    {displayedUsers.length > 0 &&
                      displayedUsers.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            refreshData={refreshHandler}
                            deleteHandler={() => {
                              deleteConfirmHandler({ id: record.id });
                            }}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            navigationParams={{ id: record.id }}
                            isEditable={canEdit}
                            isDeletable={canDelete}
                            hasBulkActions={false}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={total} isPagination={false}>
                    {displayedUsers &&
                      displayedUsers.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteHandler={() => deleteConfirmHandler({ id: record.id })}
                            refreshData={refreshHandler}
                            setActionInProgress={setActionInProgress}
                            label1={{ value: 'LBL_SYSTEM_USER' }}
                            navigationParams={{ id: record.id }}
                            isDeletable={canDelete}
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
}

export default Users;
