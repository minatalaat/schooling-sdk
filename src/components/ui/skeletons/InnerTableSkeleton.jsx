import ContentLoader from 'react-content-loader';

const InnerTableSkeleton = ({ ...rest }) => (
  <>
    <div className="row">
      <div className="col-md-12">
        <ContentLoader height="250" width="100%" {...rest}>
          <rect y="15" rx="6" ry="6" width="100%" height="50" />
          <rect y="80" rx="6" ry="6" width="100%" height="150" />
        </ContentLoader>
      </div>
    </div>
  </>
);

export default InnerTableSkeleton;
