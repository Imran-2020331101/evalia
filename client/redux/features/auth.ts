import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../lib/store";
import axios from "axios";
import { toast } from "sonner";

export const createOrganization = createAsyncThunk('auth/createOrganization',async(data:any,thunkAPI)=>{
    try {
        const response = await axios.post('http://localhost:8080/api/user/organization/new',data, {withCredentials:true})
        console.log(response.data, 'organization')
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed creating organization' })
    }
})

export const getAllOrganizations = createAsyncThunk('auth/getAllOrganization',async(_,thunkAPI)=>{
    try {
        const response = await axios.get('http://localhost:8080/api/user/organization/new',{withCredentials:true})
        console.log(response.data, 'organization')
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching organizations' })
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

type statusType = 'idle'|'pending'|'error'|'success';
interface initialStateType {
    userStatus:statusType
    user: null | object,
    isSignedIn:boolean,
    orgCreationStatus:statusType,
    orgFetchStatus:statusType,
    organizations : any[], // type will be updated
    registerFormData:{
        name:string,
        email:string,
        password:string,
        role:string | null
    }
}

const initialState :initialStateType={
    userStatus:'idle',
    user:null,
    orgCreationStatus:'idle',
    orgFetchStatus:'idle',
    organizations:[],
    isSignedIn:true,
    registerFormData:{
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
            name: keyof typeof state.registerFormData;
            value: string | null;
            };
        }){
            state.registerFormData[action.payload.name] = action.payload.value as any;
        },
        setOrgCreationStatus(state, action){
            state.orgCreationStatus=action.payload
        },
        setOrgFetchStatus(state, action){
            state.orgFetchStatus= action.payload
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
        .addCase(createOrganization.pending,(state)=>{
            state.orgCreationStatus='pending'
        })
        .addCase(createOrganization.rejected,(state)=>{
            state.orgCreationStatus='error'
        })
        .addCase(createOrganization.fulfilled,(state,action)=>{
            state.organizations.push(action.payload);
            state.orgCreationStatus='success'
        })
        .addCase(getAllOrganizations.pending,(state)=>{
            state.orgFetchStatus='pending'
        })
        .addCase(getAllOrganizations.rejected,(state)=>{
            state.orgFetchStatus='error'
        })
        .addCase(getAllOrganizations.fulfilled,(state,action)=>{
            state.organizations =action.payload;
            state.orgFetchStatus='success'
        })
    }
})

export default authSlice.reducer;
export const {setFormData, setOrgCreationStatus, setOrgFetchStatus}= authSlice.actions;
export const currentFormData = (state:RootState)=>state.auth.registerFormData
export const user = (state:RootState) => state.auth.user;
export const userStatus = (state:RootState) => state.auth.userStatus;
export const organizations = (state:RootState) => state.auth.organizations;
export const orgCreationStatus = (state:RootState) => state.auth.orgCreationStatus;
export const orgFetchStatus = (state:RootState) => state.auth.orgFetchStatus;
export const isSignedIn = (state:RootState) =>state.auth.isSignedIn;