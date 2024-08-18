import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  inventoryLines: [],
};

const inventoryLines = createSlice({
  name: 'inventoryLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.inventoryLines = action.payload.inventoryLines;
    },
    deleteLine(state, action) {
      let index = state.inventoryLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      if (index >= 0) state.inventoryLines.splice(index, 1);
    },
    addLine(state, action) {
      state.inventoryLines.push(action.payload.inventoryLine);
    },
    editLine(state, action) {
      let index = state.inventoryLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      state.inventoryLines[index] = action.payload.inventoryLine;
    },
    resetInventoryLines(state) {
      state.inventoryLines = [];
    },
  },
});

export const inventoryLinesActions = inventoryLines.actions;
export default inventoryLines.reducer;
