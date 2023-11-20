import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunk } from "app/store"
import { appActions } from "app/app-reducer"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { handleServerAppError } from "../../../common"
import { handleServerNetworkError } from "../../../common"
import { authAPI } from "../api/authApi"
import { LoginParamsType } from "../api/authApiTypes"
import { createAppAsyncThunk } from "../../../common/utils"

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
  },
})

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
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  },
)
// thunks
export const logout = createAppAsyncThunk<{ isLoggedIn: boolean }>(`${slice.name}/logut`, async (arg, thunkAPI) => {
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
})

// types

export const authReducer = slice.reducer
export const authActions = slice.actions
export const authThunk = { login, logout }
