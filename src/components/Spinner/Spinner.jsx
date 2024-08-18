import { SpinnerCircular } from 'spinners-react';

const Spinner = () => {
  return (
    <div className="loading-page">
      <SpinnerCircular size={71} thickness={138} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
    </div>
  );
};

export default Spinner;
