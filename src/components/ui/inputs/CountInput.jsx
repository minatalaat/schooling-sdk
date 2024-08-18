import React from 'react';

const CountInput = ({ setCount, index, count }) => {
  const handleDecrement = index => {
    let newCountList = count;
    newCountList[index] = newCountList[index] <= 1 ? 1 : Number(newCountList[index] - 1);
    setCount(prev => [...newCountList]);
  };

  const handleIncrement = index => {
    let newCountList = count;
    newCountList[index] = Number(newCountList[index] + 1);
    setCount(prev => [...newCountList]);
  };

  console.log(count);
  return (
    <div className="row align-items-center justify-content-center ">
      <button
        className="col-4 btn rounded-circle d-flex align-items-center justify-content-center p-0 m-0"
        style={{
          background: '#E3EFFF',
          width: '25px',
          height: '25px',
          color: '#0038FF',
        }}
        onClick={() => handleDecrement(index)}
      >
        -
      </button>
      <p className="col-4 d-flex align-items-center justify-content-center mt-3"> {count[`${index}`]}</p>
      <button
        className="col-4 btn rounded-circle d-flex align-items-center justify-content-center p-0 m-0"
        style={{
          background: '#E3EFFF',
          width: '25px',
          height: '25px',
          color: '#0038FF',
        }}
        onClick={() => handleIncrement(index)}
      >
        +
      </button>
    </div>
  );
};

export default CountInput;
