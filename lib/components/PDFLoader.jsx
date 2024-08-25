import { useSelector } from 'react-redux';

import { getReportUrl } from '../services/getUrl';

const PDFLoader = props => {
  let { url } = props;
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  return (
    <>
      <div className="row">
        <div className="card">
          <div className="iframe_wrapper">
            <iframe src={getReportUrl(url, company.name)} height="100%" width="100%" title="pdf-loader" />
          </div>
        </div>
      </div>
    </>
  );
};

export default PDFLoader;
