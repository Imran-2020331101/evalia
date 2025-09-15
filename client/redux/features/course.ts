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

export const getAllSavedCourses = createAsyncThunk('course/getAllSavedCourses',async(_,thunkAPI)=>{
    try {
        const response = await axios.get(`http://localhost:8080/api/course/suggestions/saved`, {withCredentials:true});
        return response.data;
    } catch (error:any) {
        console.log(error);
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching all courses' })
    }
})

export const saveCourse = createAsyncThunk('course/saveCourse',async({data}:{data:any},thunkAPI)=>{
    try {
        const response = await axios.post(`http://localhost:8080/api/course/save`,data, {withCredentials:true});
        return response.data;
    } catch (error:any) {
        console.log(error);
        return thunkAPI.rejectWithValue(error.response? { message: error.response.data } : { message: 'Failed fetching all courses' })
    }
})




type statusType = 'idle'|'pending'|'success'|'error'

interface initialStateType{
    allCourses:any,
    savedCourses:any,
    allCourseStatus:statusType,
    saveCourseStatus:statusType,
    getAllSaveCourseStatus:statusType,
}
const initialState:initialStateType ={
    allCourses:[],
    savedCourses:[],
    allCourseStatus:'idle',
    saveCourseStatus:'idle',
    getAllSaveCourseStatus:'idle',
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
            state.allCourses=action.payload.data.courses
            console.log(action.payload, 'inside fetch all courses'); 
            state.allCourseStatus='success'
        })
        .addCase(saveCourse.pending,(state)=>{
            state.saveCourseStatus='pending'
        })
        .addCase(saveCourse.rejected,(state)=>{
            state.saveCourseStatus='error'
        })
        .addCase(saveCourse.fulfilled,(state,action)=>{
            state.savedCourses=action.payload.data
            console.log(action.payload, 'inside save course'); 
            state.saveCourseStatus='success'
        })
    }
})

export default courseSlice.reducer;
export const {}=courseSlice.actions;
export const allCourses = (state:RootState)=>state.course.allCourses;
export const savedCourses = (state:RootState)=>state.course.savedCourses;
export const allCourseStatus = (state:RootState)=>state.course.allCourseStatus;
export const saveCourseStatus = (state:RootState)=>state.course.saveCourseStatus;
export const getAllSaveCourseStatus = (state:RootState)=>state.course.getAllSaveCourseStatus;