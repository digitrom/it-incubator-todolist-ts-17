import { todolistsAPI, TodolistType } from "./todolistsApi"
import { appActions, RequestStatusType } from "app/app-reducer"
import { AppThunk } from "app/store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { handleServerAppError, handleServerNetworkError } from "../../common"
import { createAppAsyncThunk } from "../../common/utils"
import { ResultCode } from "../../common/enums/enums"

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if (index !== -1) {
        state[index].title = action.payload.title
        // втоой вариант с find
        // const todolist = state.find((td) => td.id === action.payload.id )
        // if (todolist) {
        //     todolist.title = action.payload.title
        // }
      }
    },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if (index !== -1) {
        state[index].filter = action.payload.filter
      }
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if (index !== -1) {
        state[index].entityStatus = action.payload.entityStatus
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearTasksAndTodolists, () => {
        return []
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.id)
        if (index !== -1) {
          state.splice(index, 1)
        }
      })
  },
})

// thunks

export const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, void>(
  `${slice.name}/fetchTodolists`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await todolistsAPI.getTodolists()
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { todolists: res.data }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  },
)

export const removeTodolist = createAppAsyncThunk<{ id: string }, string>(
  `${slice.name}/removeTodolist`,
  async (id, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await todolistsAPI.deleteTodolist(id)
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return { id }
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

export const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>(
  `${slice.name}/addTodolist`,
  async (title: string, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await todolistsAPI.createTodolist(title)
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return { todolist: res.data.data.item }
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

export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then(() => {
      dispatch(todolistsActions.changeTodolistTitle({ id, title }))
    })
  }
}

// types

export type InitialStateType = ReturnType<typeof slice.getInitialState>
export type FilterValuesType = "all" | "active" | "completed"

export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todolistsThunks = { fetchTodolists, removeTodolist, addTodolist }
