import { useEffect } from "react";

const CountInput = ({  count,products,code,setProducts }) => {

  const handleDecrement = code => {
    const updatedItems = products.map(item => {
      if (item.code === code) {
        const newQuantity = item.countItems - 1;
        return { ...item, countItems: newQuantity > 0 ? newQuantity : 0 };
      }

      return item;
    });
    setProducts(updatedItems);
  };

  const handleIncrement = code => {
    const updatedItems = products.map(item =>
      item.code === code ? { ...item, countItems: item.countItems + 1 } : item
    );
    setProducts(updatedItems);
  };

  useEffect(() => {

  }, [count]);

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
        onClick={() => handleDecrement(code)}
      >
        -
      </button>
      <p className="col-4 d-flex align-items-center justify-content-center mt-3"> {count}</p>
      <button
        className="col-4 btn rounded-circle d-flex align-items-center justify-content-center p-0 m-0"
        style={{
          background: '#E3EFFF',
          width: '25px',
          height: '25px',
          color: '#0038FF',
        }}
        onClick={() => handleIncrement(code)}
      >
        +
      </button>
    </div>
  );
};

export default CountInput;
