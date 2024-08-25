const RedDeleteIcon = ({ onClick, className }) => {
  return (
    <svg className={className} width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick}>
      <path
        d="M4 7.19995H20M10 11.2V17.2M14 11.2V17.2M5 7.19995L6 19.2C6 19.7304 6.21071 20.2391 6.58579 20.6142C6.96086 20.9892 7.46957 21.2 8 21.2H16C16.5304 21.2 17.0391 20.9892 17.4142 20.6142C17.7893 20.2391 18 19.7304 18 19.2L19 7.19995M9 7.19995V4.19995C9 3.93473 9.10536 3.68038 9.29289 3.49284C9.48043 3.30531 9.73478 3.19995 10 3.19995H14C14.2652 3.19995 14.5196 3.30531 14.7071 3.49284C14.8946 3.68038 15 3.93473 15 4.19995V7.19995"
        stroke="#DC3545"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RedDeleteIcon;
