import { createSlice } from "@reduxjs/toolkit"
import { appActions } from "app/app-reducer"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { handleServerAppError, handleServerNetworkError } from "../../../common"
import { authAPI } from "../api/authApi"
import { LoginParamsType } from "../api/authApiTypes"
import { createAppAsyncThunk, thunkTryCatch } from "../../../common/utils"
import { BaseResponseType } from "../../../common/types"

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
  },
})

export const initializeApp = createAppAsyncThunk<
  {
    isLoggedIn: boolean
  },
  undefined
>(`${slice.name}/initializeApp`, async (_, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  return thunkTryCatch(thunkAPI, async () => {
    const res = await authAPI.me()
    if (res.data.resultCode === 0) {
      return { isLoggedIn: true }
    } else {
      // handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  }).finally(() => {
    dispatch(appActions.setAppInitialized({ isInitialized: true }))
  })
})
// finally {
//   dispatch(appActions.setAppInitialized({ isInitialized: true }))
// }

const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>(
  `${slice.name}/login`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await authAPI.login(arg)
      if (res.data.resultCode === 0) {
        dispatch(clearTasksAndTodolists())
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return { isLoggedIn: true }
      } else {
        const isShowAppError = !res.data.fieldsErrors.length
        handleServerAppError(res.data, dispatch, false)
        return rejectWithValue(res.data)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  },
)
// thunks
export const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
  `${slice.name}/logout`,
  async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await authAPI.logout()
      if (res.data.resultCode === 0) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return { isLoggedIn: false }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  },
)

// types

export const authReducer = slice.reducer
export const authThunk = { login, logout, initializeApp }
