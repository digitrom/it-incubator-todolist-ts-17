import { createSlice } from "@reduxjs/toolkit"
import { appActions } from "app/app-reducer"
import { todolistsThunks } from "features/TodolistsList/todolists-reducer"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { createAppAsyncThunk, handleServerAppError, handleServerNetworkError, thunkTryCatch } from "../../common/utils"
import { CreateTaskArg, DeleteTaskArg, TaskType, todolistsAPI, UpdateTaskModelType } from "./todolistsApi"
import { ResultCode, TaskPriorities, TaskStatuses } from "../../common/enums/enums"

export const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasksForTodolist = state[action.payload.task.todoListId]
        tasksForTodolist.unshift(action.payload.task)
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasksForTodolist = state[action.payload.todolistId]
        const index = tasksForTodolist.findIndex((task) => task.id === action.payload.taskId)
        if (index !== -1) {
          tasksForTodolist.splice(index, 1)
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasksForTodolist = state[action.payload.todolistId]
        // tasksForTodolist.find((t) => (t.id === action.payload.taskId ? { ...t, ...action.payload.model } : t))
        const index = tasksForTodolist.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) {
          tasksForTodolist[index] = { ...tasksForTodolist[index], ...action.payload.domainModel }
        }
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach((tl: any) => {
          state[tl.id] = []
        })
      })
      .addCase(clearTasksAndTodolists, () => {
        return {}
      })
  },
})

export const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  `${slice.name}/fetchTasks`,
  async (todolistId, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await todolistsAPI.getTasks(todolistId)
      const tasks = res.data.items
      // dispatch(tasksActions.setTasks({ tasks, todolistId }))
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { tasks, todolistId }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  },
)

export const removeTask = createAppAsyncThunk<DeleteTaskArg, DeleteTaskArg>(
  `${slice.name}/removeTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await todolistsAPI.deleteTask(arg)
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return arg
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

// export const removeTaskTC =
//     (taskId: string, todolistId: string): AppThunk =>
//         (dispatch) => {
//           todolistsAPI.deleteTask(todolistId, taskId).then(() => {
//             dispatch(tasksActions.removeTask({ taskId, todolistId }))
//           })
//         }

export const addTask = createAppAsyncThunk<{ task: TaskType }, CreateTaskArg>(
  `${slice.name}/addTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    return thunkTryCatch(thunkAPI, async () => {
      const res = await todolistsAPI.createTask(arg)
      if (res.data.resultCode === 0) {
        const task = res.data.data.item
        return { task }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    })
  },
)

type UpdateTaskArg = {
  taskId: string
  domainModel: UpdateDomainTaskModelType
  todolistId: string
}
export const updateTask = createAppAsyncThunk<UpdateTaskArg, UpdateTaskArg>(
  `${slice.name}/updateTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI
    try {
      const state = getState()
      const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId)
      if (!task) {
        //throw new Error("task not found in the state");
        console.warn("task not found in the state")
        return rejectWithValue(null)
      }

      const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...arg.domainModel,
      }
      const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
      if (res.data.resultCode === 0) {
        return arg
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
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask }
