import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import InfoImg from '../../assets/images/info.svg';
import FilterIconTb from '../../assets/images/filter-icon-tb.svg';
import ImageWithSkeleton from '../../components/ui/skeletons/ImageWithSkeleton';
import EditIconTbHeader from '../../assets/images/edit-icon-tb-header.svg';
import MoreCircle from '../../assets/images/morecircle.svg';

function OpenbankingToolbar({ windosSize, showSearch = false, showMoreCircle = false, showEditTb = false, showFilter = false }) {
  const { t } = useTranslation();
  return (
    <div className="card head-page">
      <div className="row">
        <div className="filter-head d-flex justify-content-between">
          <div className="action-left">
            <h5>
              {t('LBL_TAP_MANAGE_TO_VIEW_DISCONNECT')}
              <span
                className="ob-tooltip"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title=""
                data-bs-html="true"
                data-bs-original-title="This page gives you an overview of all the accounts you have connected. <br/> You can click on the manage button to find out more. <br/> You can disconnect the account at any time if you change your mind"
              >
                <ImageWithSkeleton imgSrc={InfoImg} alt="InfoImg" isListIcon={true} />
              </span>
            </h5>
          </div>

          <div className="action-right float-end">
            <div className="right-filter-tb">
              <div id="example_filter" className="dataTables_filter m-0">
                <ul className="custom-filter">
                  {showEditTb && (
                    <li>
                      <Link>
                        <ImageWithSkeleton imgSrc={EditIconTbHeader} alt="InfoImg" height="150" />
                      </Link>
                    </li>
                  )}
                  {showFilter && (
                    <li>
                      <Link>
                        <ImageWithSkeleton imgSrc={FilterIconTb} alt="FilterIconTb" height="150" />
                      </Link>
                    </li>
                  )}
                </ul>
                {showSearch && (
                  <label>
                    <input type="search" className="form-control" placeholder={t('LBL_SEARCH')} aria-controls="example" />
                  </label>
                )}

                {showMoreCircle && (
                  <div className="btn-group">
                    <button type="button" className="btn dropdown-toggle more-popup-trigger">
                      <ImageWithSkeleton imgSrc={MoreCircle} alt="MoreCircle" height="150" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenbankingToolbar;
