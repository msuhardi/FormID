import { useMemo } from 'react'

import {
  ActionRoutingType,
  ActionStep,
  ActionStepCheckboxRouting,
  ActionStepType,
  ConditionStep,
  ConditionStepRule,
  FormRouteMap,
  RouteStep,
  RouteStepAction,
  RouteStepBase,
  RouteStepParent,
  RouteStepParentType,
} from '~shared/types'
import { isActionRouteStep, isConditionRouteStep } from '~shared/utils/routeMap'

type AugmentedActionStepDto = Omit<
  ActionStep,
  'approvalStep' | 'rejectionStep'
> & {
  approvalStep?: AugmentedRouteStepDto
  rejectionStep?: AugmentedRouteStepDto
}

type AugmentedConditionStepRuleDto = Omit<ConditionStepRule, 'nextStep'> & {
  nextStep?: AugmentedRouteStepDto
}

type AugmentedConditionStepDto = Omit<ConditionStep, 'rules'> & {
  rules: AugmentedConditionStepRuleDto[]
}

type AugmentedRouteStepBaseDto = RouteStepBase & {
  parent: RouteStepParent
}

type AugmentedRouteStepActionDto = AugmentedRouteStepBaseDto & {
  actionStep: AugmentedActionStepDto
}

type AugmentedRouteStepConditionDto = AugmentedRouteStepBaseDto & {
  conditionStep: AugmentedConditionStepDto
}

type AugmentedRouteStepDto =
  | AugmentedRouteStepActionDto
  | AugmentedRouteStepConditionDto

enum ColumnType {
  Trigger = 1,
  Condition,
  Action,
  Response,
}

/**
 * Notes on terminology usage:
 *  - "Merged"-suffixed types represent cells in the associated column which
 *    have been rowspanned and thus do not need to be rendered at all.
 *  - "Blank"-suffixed types represent cells that are intentionally blank.
 */
export enum CellType {
  Trigger = 'Trigger',
  TriggerMerged = 'TriggerMerged',
  ConditionAnswer = 'ConditionAnswer',
  ConditionAnswerMerged = 'ConditionAnswerMerged',
  ConditionAnswerBlank = 'ConditionAnswerBlank',
  ConditionAnswerBlankMerged = 'ConditionAnswerBlankMerged',
  ActionApproval = 'ActionApproval',
  ActionMerged = 'ActionMerged',
  ActionTermination = 'ActionTermination',
  ActionTerminationRowBlank = 'ActionTerminationRowBlank',
  ActionBlank = 'ActionBlank',
  Response = 'Response',
  ResponseMerged = 'ResponseMerged',
  IncompleteRowBlank = 'IncompleteRowBlank',
}

export type RouteMapCell =
  | {
      type: CellType.Trigger
      rowSpan: number
    }
  | {
      type: CellType.ConditionAnswer
      rowSpan: number
      question: string
      answer: string
      parent: RouteStepParent
    }
  | {
      type: CellType.ActionApproval | CellType.ActionTermination
      rowSpan: number
      routingType: ActionRoutingType
      emails?: string[]
      emailField?: string
      checkboxField?: ActionStepCheckboxRouting
      parent: RouteStepParent
    }
  | {
      type: CellType.Response
      rowSpan: number
      approved: boolean
    }
  | {
      type: CellType.ConditionAnswerBlank
      parent: RouteStepParent
      rowSpan: number
    }
  | {
      type: CellType.ActionBlank
      parent: RouteStepParent
    }
  | {
      type: CellType.ConditionAnswerMerged
    }
  | { type: CellType.ActionMerged }
  | {
      type: CellType.ResponseMerged
      approved: boolean
    }
  | {
      type:
        | CellType.ConditionAnswerBlankMerged
        | CellType.TriggerMerged
        | CellType.IncompleteRowBlank
        | CellType.ActionTerminationRowBlank
    }

/*** UTILS ***/

type GetColumnIdPropsBase = {
  type: ColumnType
}

type GetColumnIdPropsTrigger = GetColumnIdPropsBase & {
  type: ColumnType.Trigger
}

type GetColumnIdPropsCondition = GetColumnIdPropsBase & {
  type: ColumnType.Condition
  subdepth: number
  depth: number
}

type GetColumnIdPropsActionOrResponse = GetColumnIdPropsBase & {
  type: ColumnType.Action | ColumnType.Response
  depth: number
}

type GetColumnIdProps =
  | GetColumnIdPropsTrigger
  | GetColumnIdPropsCondition
  | GetColumnIdPropsActionOrResponse

const getColumnId = (columnMeta: GetColumnIdProps) => {
  switch (columnMeta.type) {
    case ColumnType.Trigger:
      return `T`
    case ColumnType.Condition:
      return `D${columnMeta.depth}C${columnMeta.subdepth}`
    case ColumnType.Action:
      return `D${columnMeta.depth}A`
    case ColumnType.Response:
      return `D${columnMeta.depth}R`
  }
}

/*** MAIN FUNCTIONS ***/

/**
 * Helper function to compute the number of condition columns required for each
 * Checkpoint of the route map. This is done via a DFS. Whenever an action step
 * is reached or the end of the tree is reached, the depth's number is updated
 * (to the last-reached subdepth).
 * @param routeStep the route map to compute the condition columns for
 * @returns array of the number of condition columns required to represent each Checkpoint of the route map
 */
const getConditionColumnsCounts = (routeMap: FormRouteMap): number[] => {
  // Empty state - start with empty condition column
  const conditionCounts = [1]

  // depth and condition are 0-indexed
  // Always add one when setting subdepth, so that an additional condition can be added
  const getConditionColumnsCountsDfs = (
    depth: number,
    subdepth: number, // represents the condition level within the Checkpoint subtree
    routeStep?: RouteStep | null,
  ) => {
    if (!routeStep) {
      // Reached the end of the tree
      if (subdepth > 0) {
        // Previous step was a condition step, so we are "halfway through" a Checkpoint
        conditionCounts[depth] = Math.max(conditionCounts[depth], subdepth)
      }
      return
    }

    if (isConditionRouteStep(routeStep)) {
      routeStep.conditionStep.rules.forEach(({ nextStep }) =>
        // Continue DFS
        getConditionColumnsCountsDfs(depth, subdepth + 1, nextStep),
      )
    } else if (isActionRouteStep(routeStep)) {
      // Update conditionCount at this depth
      conditionCounts[depth] = Math.max(conditionCounts[depth], subdepth)
      const { type, approvalStep, rejectionStep } = routeStep.actionStep
      if (type === ActionStepType.TERMINATION) return // Don't go lower
      // If we are about to explore a new depth, add a new Checkpoint first
      if (depth + 1 === conditionCounts.length) conditionCounts.push(1)
      // Continue DFS
      getConditionColumnsCountsDfs(depth + 1, 0, approvalStep)
      getConditionColumnsCountsDfs(depth + 1, 0, rejectionStep)
    } else {
      // routeStep is never
      throw new Error('Entered unknown routeStep type')
    }
  }

  getConditionColumnsCountsDfs(0, 0, routeMap.trigger)
  return conditionCounts
}

/**
 * Helper function to compute the data for each row of the table. This is done
 * in a two-step process.
 * 1) The raw data is generated by directly adding it to each cell with known
 *    data. This is done via a DFS. Cells which should be vertically merged
 *    are also taken care of at this step.
 * 2) The raw data is cleaned by adding blank cell type computation for
 *    intermediate columns. This corresponds to segments of the tree which
 *    contain fewer conditions than segments of the same depth on other branches.
 * @param columnCounts the counts of the number of condition columns to display for each depth
 * @param routeMap the route map to compute the condition columns for
 * @returns array of the number of condition columns required to represent each Checkpoint of the route map
 */
const getData = (
  columnCounts: number[],
  routeMap: FormRouteMap,
): Record<string, RouteMapCell>[] => {
  // Ignore the actual header row. We only care about the table content here.

  // STEP 0: Augment all routeSteps with parent data.
  const augmentRouteStep = (
    parent: RouteStepParent,
    routeStep?: RouteStep | null,
  ): AugmentedRouteStepDto | undefined => {
    if (!routeStep) return
    if (isActionRouteStep(routeStep)) {
      return {
        ...routeStep,
        parent,
        actionStep: {
          ...(routeStep as unknown as RouteStepAction).actionStep,
          approvalStep: augmentRouteStep(
            {
              type: RouteStepParentType.APPROVAL,
            },
            (routeStep as unknown as RouteStepAction).actionStep.approvalStep,
          ),
          rejectionStep: augmentRouteStep(
            {
              type: RouteStepParentType.REJECTION,
            },
            (routeStep as unknown as RouteStepAction).actionStep.rejectionStep,
          ),
        },
      }
    }
    if (isConditionRouteStep(routeStep)) {
      return {
        ...routeStep,
        parent,
        conditionStep: {
          ...routeStep.conditionStep,
          rules: routeStep.conditionStep.rules.map((rule) => ({
            ...rule,
            nextStep: augmentRouteStep(
              {
                type: RouteStepParentType.CONDITION,
              },
              rule.nextStep,
            ),
          })),
        },
      }
    }
  }

  // STEP 1: Get raw data.
  // Generate the data by doing a DFS through the route map tree again,
  // assigning data to each column via the mapping to the column Id.
  // Most rows represent a branch of the DFS tree, except the header rows.
  // Every time there is branching, we fan out, then flatten back.
  const getRawDataDfs = (
    depth: number,
    subdepth: number,
    routeStep?: AugmentedRouteStepDto,
  ): Record<string, RouteMapCell>[] => {
    // End of the tree - always have one row with no data.
    if (!routeStep) return [{}]

    if (isConditionRouteStep(routeStep)) {
      const { conditionStep, parent } = routeStep

      const { rules, question } = conditionStep
      const columnId = getColumnId({
        type: ColumnType.Condition,
        depth,
        subdepth,
      })

      const data = rules
        .map(({ nextStep, answer }) => {
          // For each subtree, compute the data.
          const data = getRawDataDfs(depth, subdepth + 1, nextStep)
          // Inject the answer at this column ID for the topmost row. Remaining
          // rows are merged.
          data.forEach((_value, i) =>
            i === 0
              ? (data[0][columnId] = {
                  type: CellType.ConditionAnswer,
                  rowSpan: data.length,
                  question,
                  answer,
                  parent,
                })
              : (data[i][columnId] = {
                  type: CellType.ConditionAnswerMerged,
                }),
          )
          return data
        })
        .flat()

      //! Need to account for unfilled subdepths (1)
      return data
    } else if (isActionRouteStep(routeStep)) {
      const { actionStep, parent } = routeStep

      const {
        type: actionStepType,
        approvalStep,
        rejectionStep,
        routingType,
        emails,
        emailField,
        checkboxField,
      } = actionStep

      const responseColumnId = getColumnId({
        type: ColumnType.Response,
        depth,
      })
      let type: CellType.ActionApproval | CellType.ActionTermination
      let data: Record<string, RouteMapCell>[]
      switch (actionStepType) {
        case ActionStepType.TERMINATION:
          type = CellType.ActionTermination
          //! Need to fill the remainder of this row with ActionTerminationRowBlanks (2)
          data = [{}]
          break
        case ActionStepType.APPROVAL: {
          type = CellType.ActionApproval
          // For each subtree, compute the sub-tables, then inject the response
          // type at this column ID for the topmost row. Remaining rows are merged.
          data = [
            getRawDataDfs(depth + 1, 0, approvalStep).map((row, i, data) => {
              row[responseColumnId] =
                i === 0
                  ? {
                      type: CellType.Response,
                      rowSpan: data.length,
                      approved: true,
                    }
                  : {
                      type: CellType.ResponseMerged,
                      approved: true,
                    }
              return row
            }),
            getRawDataDfs(depth + 1, 0, rejectionStep).map((row, i, data) => {
              row[responseColumnId] =
                i === 0
                  ? {
                      type: CellType.Response,
                      rowSpan: data.length,
                      approved: false,
                    }
                  : {
                      type: CellType.ResponseMerged,
                      approved: false,
                    }
              return row
            }),
          ].flat()
        }
      }

      // Set the action column to contain the relevant action settings at the
      // topmost row, and remaining rows are merged.
      const actionColumnId = getColumnId({
        type: ColumnType.Action,
        depth,
      })
      data.forEach((_value, i) =>
        i === 0
          ? (data[0][actionColumnId] = {
              type,
              rowSpan: data.length,
              routingType,
              emails: !emails ? undefined : emails,
              emailField: !emailField ? undefined : emailField,
              checkboxField: !checkboxField ? undefined : checkboxField,
              parent,
            })
          : (data[i][actionColumnId] = {
              type: CellType.ActionMerged,
            }),
      )
      return data
    } else {
      // routeStep is never
      throw new Error('Entered unknown routeStep type')
    }
  }

  const trigger = augmentRouteStep(
    { type: RouteStepParentType.TRIGGER },
    routeMap.trigger,
  )

  const data = getRawDataDfs(0, 0, trigger)
  // Finally, add the trigger at the topmost row, and remaining rows are merged.
  const triggerColumnId = getColumnId({ type: ColumnType.Trigger })
  data.forEach((_value, i) =>
    i === 0
      ? (data[i][triggerColumnId] = {
          type: CellType.Trigger,
          rowSpan: data.length,
        })
      : (data[i][triggerColumnId] = { type: CellType.TriggerMerged }),
  )

  // At this point, each data row only contains column mappings for (1) cells
  // that contain data, and (2) cells that were rowspanned due to merging.
  // What's left is to fill columns that were not rowspanned (because of a lack
  // of data, when not all the columns are needed).

  // STEP 2: Clean rows based on computed column counts.
  data.forEach((row, i) => {
    let previousCell = data[i][triggerColumnId] // Initial column is the trigger column
    columnCounts.forEach((conditions, depth) =>
      [
        ...Array.from({ length: conditions }, (_, subdepth) => ({
          columnId: getColumnId({
            type: ColumnType.Condition,
            depth,
            subdepth,
          }),
          type: ColumnType.Condition,
        })),
        {
          columnId: getColumnId({
            type: ColumnType.Action,
            depth,
          }),
          type: ColumnType.Action,
        },
        {
          columnId: getColumnId({
            type: ColumnType.Response,
            depth,
          }),
          type: ColumnType.Response,
        },
      ].forEach(({ columnId, type }) => {
        // Once there is no more previous cell, we've reached the end of the row
        if (!previousCell) return

        // Go through each column and fill missing data.
        if (!(columnId in row)) {
          switch (previousCell.type) {
            //! (1) Fill columns that don't have data. This would be either Conditions or Actions columns
            // Unmerged variant
            case CellType.Trigger:
            case CellType.ConditionAnswer:
            case CellType.Response:
            case CellType.ConditionAnswerBlank: {
              const parent: RouteStepParent = (() => {
                switch (previousCell.type) {
                  case CellType.Trigger:
                    return { type: RouteStepParentType.TRIGGER }
                  case CellType.ConditionAnswer:
                    return {
                      type: RouteStepParentType.CONDITION,
                    }
                  case CellType.Response:
                    return {
                      type: previousCell.approved
                        ? RouteStepParentType.APPROVAL
                        : RouteStepParentType.REJECTION,
                    }
                  case CellType.ConditionAnswerBlank:
                    return previousCell.parent
                  default: {
                    const _: never = previousCell
                    throw new Error('Inexhaustive switch')
                  }
                }
              })()
              // Since it did not come from an Action cell, this column cannot
              // be a Response column
              switch (type) {
                case ColumnType.Action:
                  row[columnId] = { type: CellType.ActionBlank, parent }
                  break
                case ColumnType.Condition:
                  row[columnId] = {
                    type: CellType.ConditionAnswerBlank,
                    parent,
                    rowSpan: previousCell.rowSpan,
                  }
                  break
                default:
                  throw new Error('Unexpected column type after unmerged cell')
              }
              break
            }
            // Merged variant
            case CellType.TriggerMerged:
            case CellType.ResponseMerged:
            case CellType.ConditionAnswerMerged:
            case CellType.ConditionAnswerBlankMerged:
              // Same as above - this column cannot be a Response column
              // But also, we cannot have a merged variant before an undefined
              // action (since the action should only occupy a single row.
              if (type !== ColumnType.Condition) {
                throw new Error('Unexpected column type after merged cell')
              }
              row[columnId] = { type: CellType.ConditionAnswerBlankMerged }
              break

            //! (2) Fill termination rows with ActionTerminationRowBlanks
            case CellType.ActionTermination:
            case CellType.ActionTerminationRowBlank:
              row[columnId] = { type: CellType.ActionTerminationRowBlank }
              break
            // Otherwise, treat it as incomplete row blank
            default:
              row[columnId] = { type: CellType.IncompleteRowBlank }
              break
          }
        }

        previousCell = row[columnId]
      }),
    )
  })
  return data
}

export const useBuilderTable = (routeMap: FormRouteMap) => {
  const columnEnumerations = useMemo(
    () => getConditionColumnsCounts(routeMap),
    [routeMap],
  )
  const data = useMemo(
    () => getData(columnEnumerations, routeMap),
    [columnEnumerations, routeMap],
  )

  const columns = useMemo(() => {
    const columns = columnEnumerations.flatMap((conditions, depth) => {
      const checkpointColumns = []
      for (let subdepth = 0; subdepth < conditions; subdepth++) {
        const columnId = getColumnId({
          type: ColumnType.Condition,
          depth,
          subdepth,
        })
        checkpointColumns.push({
          columnId,
          header: subdepth === 0 ? 'Route response based on' : '',
          meta: { hasBorderRight: false },
        })
      }
      checkpointColumns.push(
        {
          columnId: getColumnId({ type: ColumnType.Action, depth }),
          header: 'Action',
          meta: { hasBorderRight: true },
        },
        {
          columnId: getColumnId({ type: ColumnType.Response, depth }),
          header: 'Response',
          meta: { hasBorderRight: false },
        },
      )
      return checkpointColumns
    })
    columns.unshift({
      columnId: getColumnId({ type: ColumnType.Trigger }),
      header: 'Start',
      meta: { hasBorderRight: true },
    })
    return columns
  }, [columnEnumerations])

  return { columns, data }
}
