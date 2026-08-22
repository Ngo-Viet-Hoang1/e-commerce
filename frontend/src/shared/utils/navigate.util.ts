import type { NavigateFunction } from 'react-router-dom'

let navigateFunction: NavigateFunction

export const setNavigator = (navigate: NavigateFunction) => {
  navigateFunction = navigate
}

export const navigateTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path)
  }
}
