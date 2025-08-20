import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../lib/store";

interface initialStateType {
    user: null | object,
    isSignedIn:boolean,
    formData:{
        name:string,
        email:string,
        password:string,
        role:string | null
    }
}

const initialState :initialStateType={
    user:null,
    isSignedIn:true,
    formData:{
        name:'',
        email:'',
        password:'',
        role:null
    }
}

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        setFormData(state, action: {
            payload: {
            name: keyof typeof state.formData;
            value: string | null;
            };
        }){
            state.formData[action.payload.name] = action.payload.value as any;
        }
    },
    extraReducers(builder){
        
    }
})

export default authSlice.reducer;
export const {setFormData}= authSlice.actions;
export const currentFormData = (state:RootState)=>state.auth.formData
export const user = (state:RootState) => state.auth.user;
export const isSignedIn = (state:RootState) =>state.auth.isSignedIn;