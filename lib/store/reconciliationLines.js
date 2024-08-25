import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  movelines: [],
  reconciliationLines: [],
};

const reconciliationLineSlice = createSlice({
  name: 'reconciliationLines',
  initialState,
  reducers: {
    setMovelines(state, action) {
      state.movelines = action.payload.lines;
    },
    setReconciliationLines(state, action) {
      state.reconciliationLines = action.payload.lines;
    },
    selectMoveLine(state, action) {
      state.movelines[action.payload.index].selected = !state.movelines[action.payload.index].selected;
    },
    selectManualMoveLines(state, action) {
      let selectedManualMovelines = state.reconciliationLines;
      let movelines = action.payload.lines;
      movelines.forEach(line => {
        let index = selectedManualMovelines.findIndex(selectedMoveLine => selectedMoveLine.moveline === line.id);
        if (index >= 0) {
          line.reconcileLineID = selectedManualMovelines[index].id;
          line.selected = true;
        } else line.selected = false;
      });
      state.movelines = movelines;
    },
  },
});

export const reconciliationLineActions = reconciliationLineSlice.actions;
export default reconciliationLineSlice.reducer;
