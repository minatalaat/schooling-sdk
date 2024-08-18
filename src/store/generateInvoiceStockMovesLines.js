import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  operationTypeSelect: '1',
  generateInvoiceStockMovesLines: [],
};

const generateInvoiceStockMovesLines = createSlice({
  name: 'generateInvoiceStockMovesLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.generateInvoiceStockMovesLines = action.payload.generateInvoiceStockMovesLines;
    },
    editLine(state, action) {
      let index = state.generateInvoiceStockMovesLines.findIndex(
        line => line.stockMoveLineId !== null && line.stockMoveLineId === action.payload.stockMoveLineId
      );
      state.generateInvoiceStockMovesLines[index] = action.payload.generateInvoiceStockMovesLine;
    },
    resetGenerateInvoiceStockMovesLines(state, action) {
      state.generateInvoiceStockMovesLines = [];
    },
    setOperationTypeSelect(state, action) {
      state.operationTypeSelect = action.payload.operationTypeSelect;
    },
  },
});

export const generateInvoiceStockMovesLinesActions = generateInvoiceStockMovesLines.actions;
export default generateInvoiceStockMovesLines.reducer;
