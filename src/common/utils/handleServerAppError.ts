import { appActions } from "app/app-reducer"

import { Dispatch } from "redux"
import { BaseResponseType } from "../types"

/**
 * Обабатывает ошибки полученные от сервера
 *
 * @param data - Объект ответа от сервера, содержащий информацию об ошибке и другие данные (типизрованный)
 * @param dispatch - Функция для отправки действий в хранилище Redux
 * @param showError - Флан опрделяющий, нужно ли отображать сообщение об ошибке для пользователя (по умолчанию true)
 * @returns void - функция не возвращает значения
 */

export const handleServerAppError = <D>(data: BaseResponseType<D>, dispatch: Dispatch, showError: boolean = true) => {
  if (showError) {
    // if (data.messages.length) {
    //   dispatch(appActions.setAppError({ error: data.messages[0] }))
    // } else {
    //   dispatch(appActions.setAppError({ error: "Some error occurred" }))
    // }
    dispatch(appActions.setAppError({ error: data.messages.length ? data.messages[0] : "Some error occurred" }))
  }
  dispatch(appActions.setAppStatus({ status: "failed" }))
}
