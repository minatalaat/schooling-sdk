import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  lines: [],
};

const movelineSlice = createSlice({
  name: 'lines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.lines = action.payload.lines;
    },
    deleteLine(state, action) {
      let index = state.lines.findIndex(line => line.lineId === action.payload.lineId);

      if (index >= 0) {
        state.lines.splice(index, 1);
      }
    },
    addLine(state, action) {
      state.lines.push(action.payload.line);
    },
    updateLine(state, action) {
      let newLine = action.payload.line;
      let index = state.lines.findIndex(line => line.lineId === newLine.lineId);
      state.lines[index] = newLine;
    },
    updateDates(state, action) {
      let tempLines = [...state.lines];
      let newDate = action.payload.newDate;
      tempLines.forEach(line => (line.date = newDate));
      state.lines = [...tempLines];
    },
  },
});

export const movelineActions = movelineSlice.actions;
export default movelineSlice.reducer;
