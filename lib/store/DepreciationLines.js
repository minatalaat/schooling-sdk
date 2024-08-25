import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  depreciationLines: [],
};

const depreciationLines = createSlice({
  name: 'depreciationLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.depreciationLines = action.payload.depreciationLines;
    },
    deleteLine(state, action) {
      let index = state.depreciationLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      if (index >= 0) state.depreciationLines.splice(index, 1);
    },
    addLine(state, action) {
      state.depreciationLines.push(action.payload.depreciationLine);
    },
    editLine(state, action) {
      let index = state.depreciationLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      state.depreciationLines[index] = action.payload.depreciationLine;
    },
    resetDepreciationLines(state) {
      state.depreciationLines = [];
    },
  },
});

export const depreciationLinesActions = depreciationLines.actions;
export default depreciationLines.reducer;
