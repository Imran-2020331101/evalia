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

export const deleteJob = createAsyncThunk('job/deleteJob', async(jobId:string, thunkAPI)=>{
    try {
        const response = await axios.delete(`http://localhost:8080/api/job/${jobId}`,{withCredentials:true})
        console.log(response, 'delete job')
        return jobId;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed deleting job' })
    }
})

export const exploreAllJobs = createAsyncThunk('job/exploreAllJobs', async(_,thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/job/active-jobs`,{withCredentials:true});
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching jobs' })
    }
})

export const applyJob = createAsyncThunk('job/applyJob', async(jobId:any,thunkAPI)=>{
    try {
        const response = await axios.post(`http://localhost:8080/api/job/${jobId}/apply`,null,{withCredentials:true})
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed apply job' })
    }
})

export const getAllAppliedJobs = createAsyncThunk('job/getAllAppliedJobs', async(_, thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/job/user/applied`,{withCredentials:true})
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching applied job' })
    }
})

type statusType = 'idle' | 'pending' | 'success' | 'error';
interface initialStateType {
    createJobStatus: statusType,
    fetchJobStatus: statusType,
    getAllJobsStatus: statusType,
    applyJobStatus: statusType,
    appliedJobs:any,
    exploreJobs:any,
    myJobs:any , // type will be  updated later 
    selectedOrgId:string|null
}

const initialState :initialStateType = {
    appliedJobs:[], //candidate
    exploreJobs:[],//candidate
    myJobs:[], // recruiter
    createJobStatus:'idle',
    fetchJobStatus:'idle',
    getAllJobsStatus:'idle',
    applyJobStatus:'idle',
    selectedOrgId:null
}

const jobSlice = createSlice({
    name:'job',
    initialState,
    reducers:{
        setSelectedOrgId(state,action){
            state.selectedOrgId=action.payload;
        },
        setApplyJobStatus(state,action){
            state.applyJobStatus=action.payload;
        },
        setGetAllJobStatus(state,action){
            state.getAllJobsStatus=action.payload;
        },
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
        .addCase(deleteJob.fulfilled,(state,action)=>{
            const newJobs = state.myJobs.filter((item:any)=>item._id!==action.payload)
            state.myJobs=newJobs;
        })
        .addCase(exploreAllJobs.pending,(state)=>{
            state.getAllJobsStatus='pending'
        })
        .addCase(exploreAllJobs.rejected,(state)=>{
            state.getAllJobsStatus='error'
        })
        .addCase(exploreAllJobs.fulfilled,(state,action)=>{
            state.exploreJobs=action.payload.data.jobs;
            console.log(action.payload, 'inside getAll  jobs...'); 
            state.getAllJobsStatus='success'
        })
        .addCase(applyJob.pending,(state)=>{
            state.applyJobStatus='pending'
        })
        .addCase(applyJob.rejected,(state)=>{
            state.applyJobStatus='error'
        })
        .addCase(applyJob.fulfilled,(state,action)=>{
            // state.myJobs=action.payload.data.jobs;
            console.log(action.payload, 'inside apply  job...'); 
            state.applyJobStatus='success'
        })
        .addCase(getAllAppliedJobs.pending,(state)=>{
            state.applyJobStatus='pending'
        })
        .addCase(getAllAppliedJobs.rejected,(state)=>{
            state.applyJobStatus='error'
        })
        .addCase(getAllAppliedJobs.fulfilled,(state,action)=>{
            // state.myJobs=action.payload.data.jobs;
            console.log(action.payload, 'inside fetch all applied  jobs...'); 
            state.applyJobStatus='success'
        })
    }
})

export default jobSlice.reducer;
export const {setSelectedOrgId, setApplyJobStatus, setGetAllJobStatus}=jobSlice.actions;
export const exploreJobs = (state:RootState)=>state.job.exploreJobs;
export const appliedJobs = (state:RootState)=>state.job.appliedJobs;
export const myJobs = (state:RootState)=>state.job.myJobs;
export const createJobStatus = (state:RootState)=>state.job.createJobStatus;
export const getAllJobsStatus = (state:RootState)=>state.job.getAllJobsStatus;
export const fetchJobStatus = (state:RootState)=>state.job.fetchJobStatus;
export const applyJobStatus = (state:RootState)=>state.job.applyJobStatus;
export const selectedOrgId = (state:RootState)=>state.job.selectedOrgId;