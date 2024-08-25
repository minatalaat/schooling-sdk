import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  weekDays: [],
};

const weekDays = createSlice({
  name: 'weekDays',
  initialState,
  reducers: {
    setLines(state, action) {
      state.weekDays = action.payload.weekDays;
    },
    deleteLine(state, action) {
      let index = state.weekDays.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      if (index >= 0) state.weekDays.splice(index, 1);
    },
    addLine(state, action) {
      state.weekDays.push(action.payload.weekDay);
    },
    editLine(state, action) {
      let index = state.weekDays.findIndex(line => line.lineId !== null && line.lineId === action.payload.lineId);
      state.weekDays[index] = action.payload.weekDay;
    },

    resetWeekDays(state, action) {
      state.weekDays = [];
    },
  },
});

export const weekDaysActions = weekDays.actions;
export default weekDays.reducer;
