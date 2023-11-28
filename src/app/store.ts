import { tasksReducer } from "features/TodolistsList/tasks-reducer"
import { todolistsReducer } from "features/TodolistsList/todolists-reducer"
import { AnyAction, combineReducers } from "redux"
import { ThunkAction, ThunkDispatch } from "redux-thunk"
import { appReducer } from "./app-reducer"
import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from "features/auth/model/auth-reducer"

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer,
  },
})

export type AppRootStateType = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
// @ts-ignore
window.store = store
