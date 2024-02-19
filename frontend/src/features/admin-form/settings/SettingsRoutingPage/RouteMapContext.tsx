import { createContext, useContext } from 'react'

import {
  ActionRoutingType,
  ActionStepCheckboxRouting,
  FormRouteMap,
  RouteStepParent,
} from '~shared/types'

export enum EditStateType {
  Inactive,
  AddStep,
  EditCondition,
  EditApproval,
  EditTermination,
}

export type EditState =
  | { type: EditStateType.Inactive }
  | { type: EditStateType.AddStep; parent: RouteStepParent }
  | {
      type: EditStateType.EditApproval | EditStateType.EditTermination
      routingType: ActionRoutingType
      emails?: string[]
      emailField?: string
      checkboxField?: ActionStepCheckboxRouting
      parent: RouteStepParent
    }
  | {
      type: EditStateType.EditCondition
      question: string
      parent: RouteStepParent
    }

export interface RouteMapContextProps {
  routeMap: FormRouteMap
  isRouteMapValid: boolean
  formData: FormData
  isLoading: boolean
  refetch: () => void
  userIsAdmin: boolean
  userHasWritePermissions: boolean
  editState: EditState
  setEditState: (editState: EditState) => void
}

export const RouteMapContext = createContext<RouteMapContextProps | undefined>(
  undefined,
)

export const useRouteMapContext = (): RouteMapContextProps => {
  const context = useContext(RouteMapContext)
  if (!context) {
    throw new Error(
      'useRouteMapContext must be used within a RouteMapContext.Provider component',
    )
  }
  return context
}
