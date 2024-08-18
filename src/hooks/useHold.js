export const useHold = handleHold => {
  let time = null;
  let timeOut = 500;

  const mouseDownHandler = item => {
    time = Date.now();
  };

  const mouseUpHandler = item => {
    let diff = Date.now() - time;

    if (diff >= timeOut) {
      handleHold(item);
    }
  };

  return { mouseDownHandler, mouseUpHandler };
};
