import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ConsentAccordion = ({ item, isComplete }) => {
  let { title, img, data } = item;
  const { t } = useTranslation();
  const [showData, setShowData] = useState(false);

  return (
    <>
      <div className="accordion-item">
        <h2 className={isComplete ? 'accordion-header header-accor-ob' : 'accordion-header'}>
          <button
            className={showData ? 'accordion-button' : 'accordion-button collapsed'}
            type="button"
            onClick={() => {
              setShowData(!showData);
            }}
          >
            {img && <img src={img} alt="account-details" />} {t(title)}
          </button>
        </h2>

        {showData && (
          <div id="question-3" className="accordion-collapse collapse show">
            <div className="accordion-body">
              <div className="row">
                <div className="col-md-12">
                  <div className="data-list">{data && data.map(item => <p>{t(item)}</p>)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConsentAccordion;
