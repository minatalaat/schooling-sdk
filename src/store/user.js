import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  username: '',
  isLoggedin: false,
};
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.username = action.payload.username;
      state.isLoggedin = true;
    },
    deleteUser(state) {
      state.username = '';
      state.isLoggedin = false;
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
