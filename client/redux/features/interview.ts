import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../lib/store";
import axios from "axios";


export const getallInterviews = createAsyncThunk('interview/getallInterviews',async(_,thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/interviews/`, {withCredentials:true});
        return response.data;
    } catch (error:any) {
        console.log(error);
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching all interviews' })
    }
})



type statusType = 'idle' | 'pending' | 'success' | 'error';

interface initialStateType{
    allInterviews:any,
    pendingInterviews:any,
    expiredInterviews:any,
    completedInterview:any,
    getAllInterviewStatus:statusType,
    getAllPendingInterviewStatus?:statusType,
    getAllCompletedInterviewStatus?:statusType,
    getAllExpiredInterviewStatus?:statusType
}

const initialState:initialStateType={
    allInterviews:[],
    pendingInterviews:[],
    expiredInterviews:[],
    completedInterview:[],
    getAllInterviewStatus:'idle'
}

const interviewSlice = createSlice({
    name:'interview',
    initialState,
    reducers:{

    },
    extraReducers(builder){
        builder
        .addCase(getallInterviews.pending,(state)=>{
            state.getAllInterviewStatus='pending'
        })
        .addCase(getallInterviews.rejected,(state)=>{
            state.getAllInterviewStatus='error'
        })
        .addCase(getallInterviews.fulfilled,(state,action)=>{
            state.allInterviews=action.payload.data;
            console.log(action.payload, 'inside fetch all interviews'); 
            state.getAllInterviewStatus='success'
        })
    }
})

export default interviewSlice.reducer;
export const {}=interviewSlice.reducer;
export const allInterviews =(state:RootState)=>state.interview.allInterviews;
export const pendingInterviews =(state:RootState)=>state.interview.pendingInterviews;
export const completedInterview =(state:RootState)=>state.interview.completedInterview;
export const expiredInterviews =(state:RootState)=>state.interview.expiredInterviews;
export const getAllInterviewStatus =(state:RootState)=>state.interview.getAllInterviewStatus;