import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./lib/store";

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  [key: string]: any;
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [] as Notification[],
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => action.payload,
    addNotification: (state, action: PayloadAction<Notification>) => [action.payload, ...state],
    markRead: (state, action: PayloadAction<string>) =>
      state.map((n) =>
        n.id === action.payload ? { ...n, isRead: true } : n
      ),
  },
});

export const { setNotifications, addNotification, markRead } = notificationsSlice.actions;
export const selectNotifications = (state: RootState) => state.notifications;
export default notificationsSlice.reducer;
 