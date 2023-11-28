import React, { useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import { fetchTodolists, FilterValuesType, todolistsActions, todolistsThunks } from "./todolists-reducer"
import { tasksThunks } from "./tasks-reducer"
import { TaskStatuses } from "../../common/enums/enums"
import { Grid, Paper } from "@mui/material"
import { AddItemForm } from "common/components/AddItemForm/AddItemForm"
import { Todolist } from "./Todolist/Todolist"
import { Navigate } from "react-router-dom"
import { useAppDispatch } from "common/hooks/useAppDispatch"
import { selectIsLoggedIn } from "features/auth/model/auth.selectors"
import { selectTasks } from "features/TodolistsList/tasks.selectors"
import { selectTodolists } from "features/TodolistsList/todolists.selectors"
import { useActions } from "../../common/hooks"

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector(selectTodolists)
  const tasks = useSelector(selectTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useAppDispatch()
  const { fetchTodolists, removeTodolist, changeTodolistTitle, addTodolist } = useActions(todolistsThunks)
  const { addTask: addTaskThunk } = useActions(tasksThunks)
  const { changeTodolistFilter } = useActions(todolistsActions)

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return
    }
    fetchTodolists()
  }, [])

  const removeTask = useCallback(function (taskId: string, todolistId: string) {
    dispatch(tasksThunks.removeTask({ taskId, todolistId }))
  }, [])

  const addTask = useCallback(function (title: string, todolistId: string) {
    addTaskThunk({ title, todolistId })
  }, [])

  const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { status }, todolistId }))
  }, [])

  const changeTaskTitle = useCallback(function (taskId: string, title: string, todolistId: string) {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { title }, todolistId }))
  }, [])

  const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
    changeTodolistFilter({ id, filter })
  }, [])

  const removeTodolistCB = useCallback(function (id: string) {
    removeTodolist(id)
  }, [])

  const changeTodolistTitleCB = useCallback(function (id: string, title: string) {
    changeTodolistTitle({ id, title })
  }, [])

  const addTodolistCB = useCallback((title: string) => {
    addTodolist(title)
  }, [])

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolistCB} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id]

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTask}
                  changeFilter={changeFilter}
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolistCB}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitleCB}
                  demo={demo}
                />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
