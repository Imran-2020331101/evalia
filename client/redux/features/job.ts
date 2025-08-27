import axios from 'axios'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../lib/store";
import type { jobType } from '@/types/create-job';

export const createJob = createAsyncThunk('job/createJob', async ({organizationId,data}:{organizationId:string,data:any}, thunkAPI)=>{
    try {
        const response = await axios.post(
            `http://localhost:8080/api/job/organization/${organizationId}`,data,{
                withCredentials: true,
            })
        return response.data
    } catch (error:any) {
        return thunkAPI.rejectWithValue(
            error.response? { message: error.response.data } : { message: 'Job creation failed' })
    }
})

export const getJobsByOrganization  = createAsyncThunk('job/getJobsByOrganization', async (OrganizationId:any,thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/job/organization/${OrganizationId}`,{withCredentials:true})
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching jobs' })
    }
})

type statusType = 'idle' | 'pending' | 'success' | 'error';
interface initialStateType {
    createJobStatus: statusType,
    fetchJobStatus: statusType,
    myJobs:any , // type will be  updated later 
    selectedOrgId:string|null
}

const initialState :initialStateType = {
    myJobs:[],
    createJobStatus:'idle',
    fetchJobStatus:'idle',
    selectedOrgId:null
}

const jobSlice = createSlice({
    name:'job',
    initialState,
    reducers:{
        setSelectedOrgId(state,action){
            state.selectedOrgId=action.payload;
        }
    },
    extraReducers(builder){
        builder
        .addCase(createJob.pending,(state)=>{
            state.createJobStatus='pending'
        })
        .addCase(createJob.rejected,(state)=>{
            state.createJobStatus='error'
        })
        .addCase(createJob.fulfilled,(state,action)=>{
            state.myJobs.push(action.payload.data);
            console.log(action.payload.data, 'inside create fulfilled job...'); 
            state.createJobStatus='success'
        })
        .addCase(getJobsByOrganization.pending,(state)=>{
            state.fetchJobStatus='pending'
        })
        .addCase(getJobsByOrganization.rejected,(state)=>{
            state.fetchJobStatus='error'
        })
        .addCase(getJobsByOrganization.fulfilled,(state,action)=>{
            state.myJobs=action.payload.data.jobs;
            console.log(action.payload.data, 'inside fetch  job...'); 
            state.fetchJobStatus='success'
        })
    }
})

export default jobSlice.reducer;
export const {setSelectedOrgId}=jobSlice.actions;
export const myJobs = (state:RootState)=>state.job.myJobs;
export const createJobStatus = (state:RootState)=>state.job.createJobStatus;
export const fetchJobStatus = (state:RootState)=>state.job.fetchJobStatus;
export const selectedOrgId = (state:RootState)=>state.job.selectedOrgId;