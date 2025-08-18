import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../lib/store";

interface initialStateType{
    isShowHamburgerMenu:boolean,
    previewedJob:any,
    previewedCandidate:any,
    isShowAuthRole:boolean
}

const initialState:initialStateType = {
    isShowAuthRole:false,
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
        toggleIsShowAuthRole(state){
            state.isShowAuthRole=!state.isShowAuthRole
        }
    }
})

export default utilsSlice.reducer;
export const {toggleIsShowHamburgerMenu, setPreviewedJob, setPreviewedCandidate, toggleIsShowAuthRole} = utilsSlice.actions;
export const isShowHamburgerMenu = (state:RootState) =>state.utils.isShowHamburgerMenu;
export const previewedJob = (state:RootState)=>state.utils.previewedJob;
export const previewedCandidate = (state:RootState)=>state.utils.previewedCandidate;
export const isShowAuthRole = (state:RootState)=>state.utils.isShowAuthRole;