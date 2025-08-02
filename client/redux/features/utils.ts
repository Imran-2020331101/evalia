import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../lib/store";

interface initialStateType{
    isShowHamburgerMenu:boolean,
    previewedJob:any
}

const initialState:initialStateType = {
    isShowHamburgerMenu:false,
    previewedJob :null,
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
        }
    }
})

export default utilsSlice.reducer;
export const {toggleIsShowHamburgerMenu, setPreviewedJob} = utilsSlice.actions;
export const isShowHamburgerMenu = (state:RootState) =>state.utils.isShowHamburgerMenu;
export const previewedJob = (state:RootState)=>state.utils.previewedJob;