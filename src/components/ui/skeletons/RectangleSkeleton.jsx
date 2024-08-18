import ContentLoader from 'react-content-loader';

const RectangleSkeleton = props => {
  const { height, isIcon, width, ...modifiedProps } = Object.assign({}, props);

  if (isIcon)
    return (
      <ContentLoader width={width || '100%'} height={height || 400} backgroundColor="#f0f0f0" foregroundColor="#dedede" {...modifiedProps}>
        <rect width="100%" rx="6" ry="6" height={height} />
      </ContentLoader>
    );
  else
    return (
      <div className="mt-3">
        <ContentLoader width={width} height={height} backgroundColor="#f0f0f0" foregroundColor="#dedede" {...modifiedProps}>
          <rect width="100%" rx="6" ry="6" height={height} />
        </ContentLoader>
      </div>
    );
};

export default RectangleSkeleton;
