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

export const saveJob = createAsyncThunk('job/saveJob', async(jobId:any,thunkAPI)=>{
    try {
        const response = await axios.post(`http://localhost:8080/api/job/${jobId}/save`,null,{withCredentials:true})
        console.log(response.data, 'response of save job')
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed save job' })
    }
})
export const unsaveJob = createAsyncThunk('job/unsaveJob', async(jobId:any,thunkAPI)=>{
    try {
        const response = await axios.post(`http://localhost:8080/api/job/${jobId}/unsave`,null,{withCredentials:true})
        console.log(response.data, 'response of unsave job')
        return jobId;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed unsave job' })
    }
})

export const getAllSavedJobs = createAsyncThunk('job/getAllSavedJobs', async(_, thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/job/user/saved`,{withCredentials:true})
        console.log(response.data);
        return response.data;
    } catch (error:any) {
        console.log(error, 'get all saved job error')
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching saved job' })
    }
})


export const markAsShortListed = createAsyncThunk('job/markAsShortListed', async({jobId, data}:{jobId:any, data:any},thunkAPI)=>{
    try {
        const response = await axios.post(`http://localhost:8080/api/job/${jobId}/shortlist`,data, {withCredentials:true});
        return response.data;
    } catch (error:any) {
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed marking as shortlisted' })
    }
})

export const markAsShortListedByAI = createAsyncThunk('job/markAsShortListedByAI', async({jobId, k}:{jobId:any, k:any},thunkAPI)=>{
    console.log(jobId, k, 'jobId, k')
    try {
        const response = await axios.get(`http://localhost:8080/api/resume/${ jobId }/shortlist/${ k }`, {withCredentials:true});
        return response.data;
    } catch (error:any) {
        console.log(error);
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed marking as shortlisted By AI' })
    }
})




type statusType = 'idle' | 'pending' | 'success' | 'error';
interface initialStateType {
    createJobStatus: statusType,
    fetchJobStatus: statusType,
    getAllJobsStatus: statusType,
    applyJobStatus: statusType,
    saveJobStatus: statusType,
    markShortlistedStatus: statusType,
    applyJobId:string|null,
    saveJobId:string|null,
    savedJobs:any,
    appliedJobs:any,
    exploreJobs:any,
    myJobs:any , // type will be  updated later 
    previewedShortListedCandidate:any,
    shortListedCandidate:any,
    selectedOrgId:string|null,
    selectedOrg:any,
    recruitersSelectedJob:any,
}

const initialState :initialStateType = {
    saveJobId:null,
    applyJobId:null,
    savedJobs:[], //candidate
    appliedJobs:[], //candidate
    exploreJobs:[],//candidate
    myJobs:[], // recruiter
    previewedShortListedCandidate:[],
    shortListedCandidate:[],
    markShortlistedStatus:'idle',
    createJobStatus:'idle',
    fetchJobStatus:'idle',
    getAllJobsStatus:'idle',
    applyJobStatus:'idle',
    saveJobStatus:'idle',
    selectedOrgId:null,
    selectedOrg:null,
    recruitersSelectedJob:null
}

const jobSlice = createSlice({
    name:'job',
    initialState,
    reducers:{
        setSelectedOrgId(state,action){
            state.selectedOrgId=action.payload;
        },
        setSelectedOrg(state,action){
            state.selectedOrg=action.payload;
        },
        setApplyJobStatus(state,action){
            state.applyJobStatus=action.payload;
        },
        setGetAllJobStatus(state,action){
            state.getAllJobsStatus=action.payload;
        },
        setApplyJobId(state,action){
            state.applyJobId=action.payload;
        },
        setSaveJobId(state,action){
            state.saveJobId=action.payload;
        },
        setRecruiterSelectedJob(state, action){
            state.recruitersSelectedJob=action.payload;
        },
        setCreateJobStatus(state, action){
            state.createJobStatus=action.payload;
        },
        setMarkShortListedStatus(state, action){
            state.markShortlistedStatus=action.payload;
        },
        setShortListedCandidate(state, action){
            state.shortListedCandidate=action.payload
        },
        setPreviewedShortListedCandidate(state, action){
            state.previewedShortListedCandidate=action.payload;
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
            state.applyJobId=null
        })
        .addCase(applyJob.fulfilled,(state,action)=>{
            state.appliedJobs.push(action.payload.data)
            console.log(action.payload, 'inside apply  job...'); 
            console.log(state.appliedJobs)
            state.applyJobStatus='success'
            state.applyJobId=null;
        })
        .addCase(getAllAppliedJobs.pending,(state)=>{
            state.getAllJobsStatus='pending'
        })
        .addCase(getAllAppliedJobs.rejected,(state)=>{
            state.getAllJobsStatus='error'
        })
        .addCase(getAllAppliedJobs.fulfilled,(state,action)=>{
            state.appliedJobs=action.payload.data;
            console.log(action.payload, 'inside fetch all applied  jobs...'); 
            state.getAllJobsStatus='success'
        })
        .addCase(saveJob.pending,(state)=>{
            state.saveJobStatus='pending'
        })
        .addCase(saveJob.rejected,(state)=>{
            state.saveJobStatus='error'
            state.saveJobId=null
        })
        .addCase(saveJob.fulfilled,(state,action)=>{
            state.savedJobs.push(action.payload.data);
            console.log(action.payload, 'inside save jobs...'); 
            state.saveJobStatus='success'
            state.saveJobId=null
        })
        .addCase(unsaveJob.pending,(state)=>{
            state.saveJobStatus='pending'
        })
        .addCase(unsaveJob.rejected,(state)=>{
            state.saveJobStatus='error'
            state.saveJobId=null
        })
        .addCase(unsaveJob.fulfilled,(state,action)=>{
            const newSavedJobs = state.savedJobs.filter((item:any)=>item._id!==action.payload);
            state.savedJobs=newSavedJobs;
            console.log(state.savedJobs.length, newSavedJobs.length, 'inside unsave jobs...'); 
            state.saveJobStatus='success'
            state.saveJobId=null
        })
        .addCase(getAllSavedJobs.pending,(state)=>{
            state.getAllJobsStatus='pending'
        })
        .addCase(getAllSavedJobs.rejected,(state, action)=>{
            state.getAllJobsStatus='error'
            console.log(action.payload, 'error getting saved jobs')
        })
        .addCase(getAllSavedJobs.fulfilled,(state,action)=>{
            state.savedJobs=action.payload.data;
            console.log(action.payload, 'inside fetch all saved  jobs...'); 
            state.getAllJobsStatus='success'
        })
        .addCase(markAsShortListed.pending,(state)=>{
            state.markShortlistedStatus='pending'
        })
        .addCase(markAsShortListed.rejected,(state)=>{
            state.markShortlistedStatus='error'
        })
        .addCase(markAsShortListed.fulfilled,(state,action)=>{
            // const {candidateEmail} = action.payload.data;
            // const {applications} = state.recruitersSelectedJob;
            // const shortListedCandidate = applications.find((item:any)=>item.candidateEmail===candidateEmail)
            // shortListedCandidate.status='SHORTLISTED';
            // state.shortListedCandidate.push(shortListedCandidate);

            // const newApplications = applications.filter((item:any)=>item.candidateEmail!==candidateEmail);
            // // newApplications.push(shortListedCandidate);
            // state.recruitersSelectedJob.applications=newApplications;
            state.recruitersSelectedJob=action.payload.data;

            console.log(action.payload, 'inside markShortlisted thunk'); 
            state.markShortlistedStatus='success'
        })
        .addCase(markAsShortListedByAI.pending,(state)=>{
            state.markShortlistedStatus='pending'
        })
        .addCase(markAsShortListedByAI.rejected,(state)=>{
            state.markShortlistedStatus='error'
        })
        .addCase(markAsShortListedByAI.fulfilled,(state,action)=>{
            // const {candidateEmail} = action.payload.data;
            // const {applications} = state.recruitersSelectedJob;
            // const shortListedCandidate = applications.find((item:any)=>item.candidateEmail===candidateEmail)
            // shortListedCandidate.status='SHORTLISTED';
            // state.shortListedCandidate.push(shortListedCandidate);

            // const newApplications = applications.filter((item:any)=>item.candidateEmail!==candidateEmail);
            // newApplications.push(shortListedCandidate);
            // state.recruitersSelectedJob.applications=newApplications;
            state.previewedShortListedCandidate=action.payload.data

            console.log(action.payload, 'inside markShortlisted AI thunk'); 
            state.markShortlistedStatus='success'
        })
    }
})

export default jobSlice.reducer;
export const {setPreviewedShortListedCandidate, setSelectedOrgId, setSelectedOrg, setApplyJobStatus, setGetAllJobStatus, setApplyJobId, setSaveJobId, setRecruiterSelectedJob, setCreateJobStatus,setMarkShortListedStatus, setShortListedCandidate}=jobSlice.actions;
export const exploreJobs = (state:RootState)=>state.job.exploreJobs;
export const appliedJobs = (state:RootState)=>state.job.appliedJobs;
export const savedJobs = (state:RootState)=>state.job.savedJobs;
export const myJobs = (state:RootState)=>state.job.myJobs;
export const applyJobId = (state:RootState)=>state.job.applyJobId;
export const saveJobId = (state:RootState)=>state.job.saveJobId;
export const createJobStatus = (state:RootState)=>state.job.createJobStatus;
export const getAllJobsStatus = (state:RootState)=>state.job.getAllJobsStatus;
export const fetchJobStatus = (state:RootState)=>state.job.fetchJobStatus;
export const applyJobStatus = (state:RootState)=>state.job.applyJobStatus;
export const markShortlistedStatus = (state:RootState)=>state.job.markShortlistedStatus;
export const saveJobStatus = (state:RootState)=>state.job.saveJobStatus;
export const selectedOrgId = (state:RootState)=>state.job.selectedOrgId;
export const selectedOrg = (state:RootState)=>state.job.selectedOrg;
export const recruitersSelectedJob = (state:RootState)=>state.job.recruitersSelectedJob;
export const shortListedCandidate = (state:RootState)=>state.job.shortListedCandidate;
export const previewedShortListedCandidate = (state:RootState)=>state.job.previewedShortListedCandidate;