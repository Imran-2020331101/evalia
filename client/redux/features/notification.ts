import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../lib/store";
import axios from "axios";


export const getAllNotifications = createAsyncThunk('notifications/getAllNotifications',async(_,thunkAPI)=>{
  try {
        const response = await axios.get(`http://localhost:8080/api/notifications/`,{
                withCredentials: true,
            })
        return response.data
    } catch (error:any) {
      console.log(error)
        return thunkAPI.rejectWithValue(
            error.response? { message: error.response.data } : { message: 'failed fetching notifications' })
    }
})

export const markAsRead = createAsyncThunk('notifications/markAsRead', async(notificationId,thunkAPI)=>{
  try {
    const response = await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`,null,{
                withCredentials: true,
            })
        console.log(response.data, 'mark as read notification');
        return notificationId;
  } catch (error:any) {
    console.log(error)
        return thunkAPI.rejectWithValue(
            error.response? { message: error.response.data } : { message: 'failed marked as read notification' })
  }
})

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

type statusType = 'idle' | 'pending' | 'success' | 'error';
interface initialStateType {
  allNotifications:any,
  getAllNotificationStatus:statusType,
  unreadNOtifications:null|number,
}

const initialState:initialStateType ={
  allNotifications:[],
  getAllNotificationStatus:'idle',
  unreadNOtifications:null
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state,action){
      state.allNotifications.push(action.payload)
    }
  },
  extraReducers(builder){
    builder
    .addCase(getAllNotifications.pending,(state)=>{
        state.getAllNotificationStatus='pending'
    })
    .addCase(getAllNotifications.rejected,(state)=>{
        state.getAllNotificationStatus='error'
    })
    .addCase(getAllNotifications.fulfilled,(state,action)=>{
        console.log(action.payload, 'all notifications')
        state.allNotifications=action.payload.data;
        state.getAllNotificationStatus='success'
    })
    .addCase(markAsRead.fulfilled,(state,action)=>{
      const notification = state.allNotifications.find((item:any)=>item.id===action.payload);
      notification.isRead=true;
      const newNotifications = state.allNotifications.filter((item:any)=>item.id!==action.payload);
      newNotifications.push(notification);
      state.allNotifications=newNotifications;
    })
  }
});

export default notificationsSlice.reducer;
export const {addNotification} = notificationsSlice.actions;
export const  allNotifications = (state: RootState) => state.notifications.allNotifications;
export const  unreadNOtifications = (state: RootState) => state.notifications.unreadNOtifications;
 