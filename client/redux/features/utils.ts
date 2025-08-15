import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../lib/store";

interface initialStateType{
    isShowHamburgerMenu:boolean,
    previewedJob:any,
    previewedCandidate:any,
    translateX:number
}

const initialState:initialStateType = {
    translateX:0,
    isShowHamburgerMenu:false,
    previewedJob :null,
    previewedCandidate:null,
}

const utilsSlice = createSlice({
    name:'utils',
    initialState,
    reducers:{
        toggleIsShowHamburgerMenu(state){
            state.isShowHamburgerMenu=!state.isShowHamburgerMenu
        },
        setPreviewedJob(state, action){
            state.previewedJob=action.payload
        },
        setPreviewedCandidate(state, action){
            state.previewedCandidate=action.payload
        },
        setTranslateX(state,action){
            state.translateX=action.payload
        }
    }
})

export default utilsSlice.reducer;
export const {toggleIsShowHamburgerMenu, setPreviewedJob, setPreviewedCandidate, setTranslateX} = utilsSlice.actions;
export const isShowHamburgerMenu = (state:RootState) =>state.utils.isShowHamburgerMenu;
export const previewedJob = (state:RootState)=>state.utils.previewedJob;
export const previewedCandidate = (state:RootState)=>state.utils.previewedCandidate;
export const translateX = (state:RootState)=>state.utils.translateX;