import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  otherCostsLines: [],
};

const otherCostsLinesSlice = createSlice({
  name: 'otherCostsLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.otherCostsLines = action.payload.otherCostsLines;
    },
    deleteLine(state, action) {
      let index = state.otherCostsLines.findIndex(line => line.lineId === action.payload.lineId);

      if (index >= 0) {
        state.otherCostsLines.splice(index, 1);
      }
    },
    addLine(state, action) {
      state.otherCostsLines.push(action.payload.line);
    },
    updateLine(state, action) {
      let newLine = action.payload.line;
      let index = state.otherCostsLines.findIndex(line => line.lineId === newLine.lineId);
      state.otherCostsLines[index] = newLine;
    },
  },
});

export const otherCostsLinesActions = otherCostsLinesSlice.actions;
export default otherCostsLinesSlice.reducer;
