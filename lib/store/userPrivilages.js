import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  features: [],
};
const userPriviladgesSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    setFeatures(state, action) {
      state.features = action.payload;
    },
  },
});

export const userPriviladgesActions = userPriviladgesSlice.actions;
export default userPriviladgesSlice.reducer;
