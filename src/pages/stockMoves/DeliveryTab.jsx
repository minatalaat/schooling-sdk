import StockMoves from './StockMoves';

const DeliveryTab = ({ fetchedObject, mode, isPurchase = true }) => {
  return <div className="row d-contents">{mode !== 'add' && <StockMoves data={fetchedObject} isPurchase={isPurchase} />}</div>;
};

export default DeliveryTab;
