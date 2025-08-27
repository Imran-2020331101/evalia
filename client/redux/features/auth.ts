import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../lib/store";
import axios from "axios";
import { toast } from "sonner";

export const createOrganization = createAsyncThunk('auth/createOrganization',async(data:any,thunkAPI)=>{
    try {
        const response = await axios.post('http://localhost:8080/api/organization/new',data, {withCredentials:true})
        console.log(response.data, 'organization')
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed creating organization' })
    }
})

export const getAllOrganizations = createAsyncThunk('auth/getAllOrganization',async(_,thunkAPI)=>{
    try {
        const response = await axios.get('http://localhost:8080/api/organization/all',{withCredentials:true})
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching organizations' })
    }
})

export const deleteOrganization = createAsyncThunk('auth/deleteOrganization', async(organizationId:string,thunkAPI)=>{
    try {
        const response = await axios.delete(`http://localhost:8080/api/organization/${organizationId}`,{withCredentials:true})
        return organizationId;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed deleting organizations' })
    }
})

export const updateOrganization = createAsyncThunk('auth/updateOrganization', async({organizationId, data}:{organizationId:string, data:any},thunkAPI)=>{
    try {
        const response = await axios.patch(`http://localhost:8080/api/organization/${organizationId}`,data,{withCredentials:true})
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed Editing organizations' })
    }
})

export const fetchUserData = createAsyncThunk('auth/fetchUserData', async(_,thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/user/profile`,{withCredentials:true})
        return response.data;
    } catch (error:any) {
        // toast.error(error.response?error.response.data:'Failed fetching user data')
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching user data' })
    }
})
export const updateUserCoverPhoto = createAsyncThunk('auth/updateUserCoverPhoto',async(formData:any,thunkAPI)=>{
    try {
        const response = await axios.post('http://localhost:8080/api/user/update/profile-photo',formData,{withCredentials:true})
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed updating user cover photo' })
    }
})

type statusType = 'idle'|'pending'|'error'|'success';
interface initialStateType {
    userStatus:statusType
    user: null | object,
    isSignedIn:boolean,
    orgCreationStatus:statusType,
    orgFetchStatus:statusType,
    orgDeleteStatus:statusType,
    orgUpdateStatus:statusType,
    userCoverPhotoUpdateStatus:statusType,
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
    orgDeleteStatus:'idle',
    orgUpdateStatus:'idle',
    userCoverPhotoUpdateStatus:'idle',
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
        },
        setOrgDeleteStatus(state, action){
            state.orgDeleteStatus=action.payload
        },
        setOrgUpdateStatus(state, action){
            state.orgUpdateStatus=action.payload
        },
        setUserCoverPhotoStatus(state, action){
            state.orgUpdateStatus=action.payload
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
            console.log(action.payload.data, 'all organizations')
            state.organizations =action.payload.data;
            state.orgFetchStatus='success'
        })
        .addCase(deleteOrganization.pending,(state)=>{
            state.orgDeleteStatus='pending'
        })
        .addCase(deleteOrganization.rejected,(state)=>{
            state.orgDeleteStatus='error'
        })
        .addCase(deleteOrganization.fulfilled,(state,action)=>{
            const newOrganizations = state.organizations.filter((item)=>item.id!==action.payload);
            state.organizations = newOrganizations;
            state.orgDeleteStatus='success'
        })
        .addCase(updateOrganization.pending,(state)=>{
            state.orgUpdateStatus='pending'
        })
        .addCase(updateOrganization.rejected,(state)=>{
            state.orgUpdateStatus='error'
        })
        .addCase(updateOrganization.fulfilled,(state,action)=>{
            console.log(action.payload,'updated org')
            state.organizations.map((item)=>{
                if(item.id===action.payload.id) item=action.payload
            })
            state.orgUpdateStatus='success'
        })
        .addCase(updateUserCoverPhoto.pending,(state)=>{
            state.userCoverPhotoUpdateStatus='pending'
        })
        .addCase(updateUserCoverPhoto.rejected,(state)=>{
            state.userCoverPhotoUpdateStatus='error'
        })
        .addCase(updateUserCoverPhoto.fulfilled,(state,action)=>{
            console.log(action.payload,'updated cover photo')
            
        })
    }
})

export default authSlice.reducer;
export const {setFormData, setOrgCreationStatus, setOrgFetchStatus,setOrgUpdateStatus}= authSlice.actions;
export const currentFormData = (state:RootState)=>state.auth.registerFormData
export const user = (state:RootState) => state.auth.user;
export const userStatus = (state:RootState) => state.auth.userStatus;
export const organizations = (state:RootState) => state.auth.organizations;
export const orgCreationStatus = (state:RootState) => state.auth.orgCreationStatus;
export const orgFetchStatus = (state:RootState) => state.auth.orgFetchStatus;
export const orgUpdateStatus = (state:RootState) => state.auth.orgUpdateStatus;
export const orgDeleteStatus = (state:RootState) => state.auth.orgDeleteStatus;
export const userCoverPhotoUpdateStatus = (state:RootState) => state.auth.userCoverPhotoUpdateStatus;
export const isSignedIn = (state:RootState) =>state.auth.isSignedIn;