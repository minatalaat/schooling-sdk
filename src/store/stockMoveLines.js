import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  stockMoveLines: [],
  exTaxTotal: '0.00',
};

const stockMoveLineSlice = createSlice({
  name: 'stockMoveLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.stockMoveLines = action.payload.lines;
    },
    deleteLine(state, action) {
      let index = state.stockMoveLines.findIndex(line => line.lineId === action.payload.lineId);

      if (index >= 0) {
        state.stockMoveLines.splice(index, 1);
      }
    },
    addLine(state, action) {
      state.stockMoveLines.push(action.payload.line);
    },
    updateLine(state, action) {
      let newLine = action.payload.line;
      let index = -1;

      if (newLine.id) {
        index = state.stockMoveLines.findIndex(l => l.id === newLine.id);
      } else {
        index = state.stockMoveLines.findIndex(l => l.lineId === newLine.lineId);
      }

      state.stockMoveLines[index] = newLine;
    },
    updateExTaxTotal(state, action) {
      state.exTaxTotal = action.payload.exTaxTotal;
    },
  },
});

export const stockMoveLineActions = stockMoveLineSlice.actions;
export default stockMoveLineSlice.reducer;
