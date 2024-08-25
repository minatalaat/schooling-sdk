import ContentLoader from 'react-content-loader';

const CircleSkeleton = props => {
  const height = props.height || 400;
  const isNoData = props.isNoData || false;
  return (
    <>
      {isNoData && (
        <div className="row">
          <div className="col-md-12 justify-content-center align-items-center">
            <ContentLoader width="100%" height={height} backgroundColor="#f0f0f0" foregroundColor="#dedede" {...props}>
              <circle cx="50%" cy="50%" r={height / 2} />
            </ContentLoader>
          </div>
        </div>
      )}
      {!isNoData && (
        <ContentLoader width="100%" height={height} backgroundColor="#f0f0f0" foregroundColor="#dedede" {...props}>
          <circle cx="50%" cy="50%" r={height / 2} />
        </ContentLoader>
      )}
    </>
  );
};

export default CircleSkeleton;
