import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  timesheetLines: [],
};

const timesheetLines = createSlice({
  name: 'timesheetLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.timesheetLines = action.payload.timesheetLines;
    },
    deleteLine(state, action) {
      let index = state.timesheetLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      if (index >= 0) state.timesheetLines.splice(index, 1);
    },
    addLine(state, action) {
      state.timesheetLines.push(action.payload.timesheetLine);
    },
    editLine(state, action) {
      let index = state.timesheetLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      state.timesheetLines[index] = action.payload.timesheetLine;
    },
    resetTimesheetLines(state) {
      state.timesheetLines = [];
    },
  },
});

export const timesheetLinesActions = timesheetLines.actions;
export default timesheetLines.reducer;
