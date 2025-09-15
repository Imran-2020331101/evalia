import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../lib/store";
import axios from "axios";



export const getAllCourses = createAsyncThunk('course/getAllCourses',async(_,thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/course/suggestions`, {withCredentials:true});
        return response.data;
    } catch (error:any) {
        console.log(error);
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching all courses' })
    }
})



type statusType = 'idle'|'pending'|'success'|'error'

interface initialStateType{
    allCourses:any,
    allCourseStatus:statusType,
}
const initialState:initialStateType ={
    allCourses:[],
    allCourseStatus:'idle',
}

const courseSlice = createSlice({
    name:'course',
    initialState,
    reducers:{

    },
    extraReducers(builder){
         builder
        .addCase(getAllCourses.pending,(state)=>{
            state.allCourseStatus='pending'
        })
        .addCase(getAllCourses.rejected,(state)=>{
            state.allCourseStatus='error'
        })
        .addCase(getAllCourses.fulfilled,(state,action)=>{

            console.log(action.payload, 'inside fetch all courses'); 
            state.allCourseStatus='success'
        })
    }
})

export default courseSlice.reducer;
export const {}=courseSlice.actions;
export const allCourses = (state:RootState)=>state.course.allCourses;
export const allCourseStatus = (state:RootState)=>state.course.allCourseStatus;