import PropTypes from 'prop-types';

export const CloseIcon = ({ color = '#348352', className, clickHandler }) => {
  return (
    <svg
      className={`icon-29 ${className}`}
      fill="none"
      height="23"
      viewBox="0 0 23 23"
      width="23"
      xmlns="http://www.w3.org/2000/svg"
      onClick={clickHandler}
    >
      <path className="path" d="M13.5 4.5L4.5 13.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path className="path" d="M4.5 4.5L13.5 13.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
};

CloseIcon.propTypes = {
  color: PropTypes.string,
};
