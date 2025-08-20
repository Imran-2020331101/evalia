import axios from 'axios'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../lib/store";
import type { jobType } from '@/types/create-job';

export const createJob = createAsyncThunk('job/createJob', async (data:jobType, thunkAPI)=>{
    try {
        const response = await axios.post(
            'http://localhost:8080/api/job/create',data,{
                withCredentials: true,
            })
        return response.data
    } catch (error:any) {
        return thunkAPI.rejectWithValue(
            error.response? { message: error.response.data } : { message: 'Job creation failed' })
    }
})

interface initialStateType {
    createJobStatus: 'idle' | 'pending' | 'success' | 'error'
    myJobs:any  // type will be  updated later 
}

const initialState :initialStateType = {
    myJobs:[],
    createJobStatus:'idle'
}

const jobSlice = createSlice({
    name:'job',
    initialState,
    reducers:{
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
            state.createJobStatus='success'
            state.myJobs.push(action.payload.data);
            console.log(action.payload.data, 'inside create fulfilled job...'); 
        })
    }
})

export default jobSlice.reducer;
export const myJobs = (state:RootState)=>state.job.myJobs;
export const createJobStatus = (state:RootState)=>state.job.createJobStatus;