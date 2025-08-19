import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../lib/store";

interface initialStateType {
    user: null | object,
    isSignedIn:boolean,
}

const initialState :initialStateType={
    user:null,
    isSignedIn:true,
}

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{

    },
    extraReducers(builder){
        
    }
})

export default authSlice.reducer;
export const {}= authSlice.actions;
export const user = (state:RootState) => state.auth.user;
export const isSignedIn = (state:RootState) =>state.auth.isSignedIn;