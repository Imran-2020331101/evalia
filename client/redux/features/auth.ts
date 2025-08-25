import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../lib/store";
import axios from "axios";
import { toast } from "sonner";

export const createOrganization = createAsyncThunk('auth/createOrganization',async(data,thunkAPI)=>{
    try {
        const response = await axios.post('http://localhost:8080/api/user/organization/new',data, {withCredentials:true})
        console.log(response.data, 'organization')
    } catch (error) {
        
    }
})

export const fetchUserData = createAsyncThunk('auth/fetchUserData', async(_,thunkAPI)=>{
    try {
        const response = await axios.get('',{withCredentials:true})
        return response.data;
    } catch (error:any) {
        // toast.error(error.response?error.response.data:'Failed fetching user data')
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching user data' })
    }
})
interface initialStateType {
    userStatus:'idle'|'pending'|'error'|'success'
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
    userStatus:'idle',
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
        builder
        .addCase(fetchUserData.pending,(state)=>{
            state.userStatus='pending'
        })
        .addCase(fetchUserData.rejected,(state)=>{
            state.userStatus='error'
        })
        .addCase(fetchUserData.fulfilled,(state,action)=>{
            state.user=action.payload;
            state.userStatus='success'
        })
    }
})

export default authSlice.reducer;
export const {setFormData}= authSlice.actions;
export const currentFormData = (state:RootState)=>state.auth.formData
export const user = (state:RootState) => state.auth.user;
export const userStatus = (state:RootState) => state.auth.userStatus;
export const isSignedIn = (state:RootState) =>state.auth.isSignedIn;