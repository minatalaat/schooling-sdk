import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import NoData from '../../components/NoData';
import Spinner from '../../components/Spinner/Spinner';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getActionUrl, getUserGroupByIdUrl, getUserGroupsUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

import NoUserGroupsImg from '../../assets/images/icons/User Roles.svg';

function UsersGroups({ feature, subFeature }) {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canAdd, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [show, setShow] = useState('table');
  const [displayedUsersGroups, setDisplayedUsersGroups] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);

  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';

  const fields = [{ accessor: 'name', Header: t('LBL_NAME'), type: 'text' }];
  const subTitles = [];
  const [actionInProgress, setActionInProgress] = useState(false);

  const deleteConfirmHandler = id => {
    if (id) {
      api('DELETE', getUserGroupByIdUrl(id), null, onUsersDeleteSuccess);
    }
  };

  const onUsersDeleteSuccess = response => {
    if (response.data.status === 'Ok') {
      setActionInProgress(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'USER_GROUP_DELETE_MESSAGE' }));
      setTimeout(() => {
        setDisplayedUsersGroups([]);
        setIsLoading(true);
        api('GET', getUserGroupsUrl(), null, onUserGroupsSearchSuccess);
      }, [3000]);
    } else {
      setActionInProgress(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const onUserGroupsSearchSuccess = response => {
    if (response.data.status === 'Ok') {
      // setIsLoading(false);

      if (response.data?.data?.returnedObj?.length === 0) {
        setDisplayedUsersGroups([]);
      } else {
        let users = [];
        let data = response.data.data?.returnedObj;
        setTotal(response.data.data?.returnedObj.length);

        if (data) {
          data.forEach((user, i) => {
            let temp = {
              id: user.id ? user.id : '',
              name: user.name ? user.name : '',
            };
            users.push(temp);
          });
        }

        setDisplayedUsersGroups(users);
      }
    } else {
      // setIsLoading(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const refreshHandler = () => {
    setDisplayedUsersGroups([]);
    setIsLoading(true);
    api('GET', getUserGroupsUrl(), null, onUserGroupsSearchSuccess);
  };

  useEffect(() => {
    api('GET', getUserGroupsUrl(), null, onUserGroupsSearchSuccess);
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
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={refreshHandler}
          canSelectAll={false}
        />
      )}

      {!isLoading && displayedUsersGroups && displayedUsersGroups.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoUserGroupsImg}
          noDataMessage={t('NO_USERS_GROUPS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_USER_GROUP')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}

      {isLoading && displayedUsersGroups && displayedUsersGroups.length === 0 && <Spinner />}

      {((!isLoading && searchValue !== '') || (displayedUsersGroups && displayedUsersGroups.length > 0)) && (
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
                  <h4>{t('LBL_USER_GROUPS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_USER_GROUP"
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
                  canSelectAll={false}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={displayedUsersGroups}
                    total={total}
                    feature={feature}
                    subFeature={subFeature}
                    hasBulkActions={false}
                    isPagination={false}
                  >
                    {displayedUsersGroups.length > 0 &&
                      displayedUsersGroups.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            refreshData={refreshHandler}
                            deleteHandler={() => deleteConfirmHandler(record.id)}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            navigationParams={{ id: record.id }}
                            isDeletable={canDelete}
                            hasBulkActions={false}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={total} isPagination={false}>
                    {displayedUsersGroups &&
                      displayedUsersGroups.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteHandler={() => deleteConfirmHandler(record.id)}
                            refreshData={refreshHandler}
                            setActionInProgress={setActionInProgress}
                            label1={{ value: 'LBL_USER_GROUP' }}
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

export default UsersGroups;
