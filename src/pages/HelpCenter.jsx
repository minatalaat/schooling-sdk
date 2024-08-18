import { useTranslation } from 'react-i18next';
import { Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFileDownload } from 'react-icons/fa';

import BreadCrumb from '../components/ui/BreadCrumb';
import BackButton from '../components/ui/buttons/BackButton';
import Calendar from '../components/ui/Calendar';

import { getAppLang } from '../utils/helpers';

const HelpCenter = () => {
  const { t } = useTranslation();
  const QnAs = [
    { Q: 'LBL_FAQ_Q1', A: 'LBL_FAQ_A1' },
    { Q: 'LBL_FAQ_Q2', A: 'LBL_FAQ_A2' },
    { Q: 'LBL_FAQ_Q3', A: 'LBL_FAQ_A3' },
    { Q: 'LBL_FAQ_Q4', A: 'LBL_FAQ_A4' },
    { Q: 'LBL_FAQ_Q5', A: 'LBL_FAQ_A5' },
  ];

  const userGuideArPath = '/QaemaUserGuideAR.pdf';
  const userGuideEnPath = '/QaemaUserGuide.pdf';
  const userGuidePath = getAppLang() === 'ar' ? userGuideArPath : userGuideEnPath;

  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature="APP_CONFIG" modeText="HELP_CENTER" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('HELP_CENTER')}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6 ">
                    <Link to={userGuidePath} className="template-download" target="_blank" download>
                      <FaFileDownload size={35} color="primary" />
                    </Link>
                    <label className="form-label template-download-label">
                      <strong> {t('LBL_DOWNLOAD_USER_GUIDE')}</strong>
                    </label>{' '}
                  </div>
                </div>
                <div className="border-section"></div>
                <div className="row">
                  <div className="col-md-12 mb-4">
                    <div className="info-tite-page float-start">
                      <h4>{t('LBL_FAQ')}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="tab-content d-block" id="pills-tabContent">
                    {QnAs &&
                      QnAs.map((obj, index) => {
                        return (
                          <Accordion key={index} className="mt-3 mb-3">
                            <Accordion.Item eventKey={`${index}`}>
                              <Accordion.Header>
                                <div>
                                  <label className="form-check-label">{t(obj.Q)}</label>
                                </div>
                              </Accordion.Header>
                              <Accordion.Body>
                                <div>
                                  <label className="form-check-label">{t(obj.A)}</label>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpCenter;
