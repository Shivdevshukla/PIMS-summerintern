import { configureStore, createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  },
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;

      localStorage.setItem('token', action.payload.token);
      localStorage.setItem(
        'user',
        JSON.stringify(action.payload.user)
      );
    },

    logout(state) {
      state.token = null;
      state.user = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { login, logout } = authSlice.actions;

export default configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});