export const getColumnLabel = columnName => {
  if (columnName.includes('Invoiced Amount')) return 'LBL_INVOICED_AMOUNT';
  if (columnName.includes('Unpaid Inv. due')) return 'LBL_UNPAID_INVOICE_DUE';
  if (columnName.includes('Invoices')) return 'LBL_INVOICES';
  if (columnName.includes('Inv. Unpaid')) return 'LBL_INVOICE_UNPAID';
  if (columnName.includes('Refunds')) return 'LBL_NOTES';
  if (columnName.includes('Charge')) return 'LBL_CHARGE';
  if (columnName.includes('Income')) return 'INCOME';
  return columnName;
};

const colors = ['#656CEE', '#996be5', '#fe8a7d', '#0984e3', '#a927f9', '#f8d62b'];

export const getDatasetColors = dataset => {
  return colors.slice(0, dataset.length);
};

export const getDatasetPositiveNegativeColors = dataset => {
  let tempColors = [];
  dataset.forEach(data => {
    if (data.includes('-')) tempColors.push('#f89696');
    else tempColors.push('#656CEE');
  });
  return tempColors;
};

export const getSlidesPerView = (windowSize, slides, isOffersAvailable) => {
  if (isOffersAvailable && windowSize[0] >= 992 && slides?.length > 2) return 2.1;
  if (isOffersAvailable && windowSize[0] >= 992 && slides?.length <= 2) return Math.min(slides?.length, 2);
  if (isOffersAvailable && windowSize[0] >= 768 && slides?.length > 1) return 1.1;
  if (isOffersAvailable && windowSize[0] >= 768 && slides?.length === 1) return 1;
  if (windowSize[0] >= 992 && slides?.length > 2) return 2.1;
  if (windowSize[0] >= 992 && slides?.length <= 2) return Math.min(slides?.length, 2);
  if (windowSize[0] >= 768 && slides?.length > 2) return 2.1;
  if (windowSize[0] >= 768 && slides?.length <= 2) return Math.min(slides?.length, 2);
  if (slides?.length > 1) return 1.1;
  return 1;
};
