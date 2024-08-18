import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  integrators: [],
  connectedIntegrators: [],
};
const integrators = createSlice({
  name: 'integrators',
  initialState,
  reducers: {
    setIntegrators(state, action) {
      state.integrators = action.payload;
    },
    resetIntegrators(state) {
      state.integrators = [];
    },
  },
});

export const integratorsActions = integrators.actions;
export default integrators.reducer;
