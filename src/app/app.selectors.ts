import { AppRootStateType } from "app/store"

export const selectStatus = (state: AppRootStateType) => state.app.status
export const selectIsInitialised = (state: AppRootStateType) => state.app.isInitialized
export const selectAppError = (state: AppRootStateType) => state.app.error
