import { ComponentProps, Dispatch, SetStateAction, useMemo } from 'react'
import { BiFlag, BiMailSend, BiNoEntry, BiPlus, BiUser } from 'react-icons/bi'
import {
  Box,
  Flex,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { get } from 'lodash'

import { ActionRoutingType, FormRouteMap } from '~shared/types'

import Button from '~/components/Button'
import { CellType, RouteMapCell, useBuilderTable } from '~/utils/routeMap'

import { Tag } from '~components/Tag'

import { EditState, EditStateType } from '../RouteMapContext'

export type BuilderContentProps = {
  routeMap: FormRouteMap
  editState: EditState
  setEditState: Dispatch<SetStateAction<EditState>>
}

type RenderCell = {
  props?: ComponentProps<typeof Td>
  content: JSX.Element
} | null

// Temp injecting editState & setEditState here
const renderCell = (
  {
    editState,
    setEditState,
  }: {
    editState: EditState
    setEditState: Dispatch<SetStateAction<EditState>>
  },
  cell?: RouteMapCell,
) => {
  const isDisabled = editState.type !== EditStateType.Inactive

  if (!cell) return { content: <></> }

  switch (cell.type) {
    case CellType.Trigger:
      return {
        props: { rowSpan: cell.rowSpan },
        content: (
          <Flex flexDir="column" gap={4}>
            <Flex gap={2}>
              <Text>Checkpoint receives a new FormSG response</Text>
            </Flex>
            <Flex gap={2}>
              <Icon as={BiFlag} />
              <Text>Send email to respondent with status tracking link</Text>
            </Flex>
          </Flex>
        ),
      }
    case CellType.ConditionAnswer: {
      const isSelected = editState.type === EditStateType.EditCondition
      return {
        props: {
          rowSpan: cell.rowSpan,
          ...{
            onClick: () =>
              setEditState({
                type: EditStateType.EditCondition,
                question: cell.question,
                parent: cell.parent,
              }),
            _hover: { bgColor: 'interaction.main-subtle.default' },
            bgColor: isSelected ? 'interaction.main-subtle.default' : undefined,
          },
        },
        content: <>{cell.answer}</>,
      }
    }
    case CellType.ConditionAnswerBlank:
      return {
        props: {
          rowSpan: cell.rowSpan,
        },
        content: <></>,
      }
    case CellType.ActionTermination:
    case CellType.ActionApproval: {
      const { emailText, emailIcon } =
        cell.type === CellType.ActionApproval
          ? { emailText: 'Request approval from', emailIcon: BiUser }
          : { emailText: 'Send copy of email thread to', emailIcon: BiMailSend }
      const editStateType =
        cell.type === CellType.ActionApproval
          ? EditStateType.EditApproval
          : EditStateType.EditTermination
      const isSelected = editState.type === editStateType
      return {
        props: {
          rowSpan: cell.rowSpan,
          bg:
            cell.type === CellType.ActionTermination
              ? 'brand.secondary.100'
              : undefined,
          ...{
            onClick: () =>
              setEditState({
                type: editStateType,
                routingType: cell.routingType,
                emails: cell.emails,
                emailField: cell.emailField,
                checkboxField: cell.checkboxField,
                parent: cell.parent,
              }),
            _hover: { bgColor: 'interaction.main-subtle.default' },
            bgColor: isSelected ? 'interaction.main-subtle.default' : undefined,
          },
        },
        content: (
          <Flex gap={2}>
            <Flex flexDir="column" gap={4}>
              {cell.routingType === ActionRoutingType.EMAILS ? (
                cell.emails &&
                cell.emails.length > 0 && (
                  <Flex gap={2}>
                    <Icon as={emailIcon} />
                    <Flex flexDir="column" gap={1}>
                      <Text>{emailText}</Text>
                      {cell.emails?.map((email, i) => (
                        <Tag
                          key={i}
                          // Override default hover and active states, since this tag is not interactive
                          _hover={{}}
                          _active={{}}
                        >
                          {email}
                        </Tag>
                      ))}
                    </Flex>
                  </Flex>
                )
              ) : (
                <Flex gap={2}>
                  <Icon as={emailIcon} />
                  <Flex flexDir="column" gap={1}>
                    <Text>{emailText}</Text>
                    <Tag
                      colorScheme="grey"
                      // Override default hover and active states, since this tag is not interactive
                      _hover={{}}
                      _active={{}}
                    >
                      {cell.routingType === ActionRoutingType.EMAIL_FIELD
                        ? cell.emailField
                        : cell.checkboxField?.question}
                    </Tag>
                  </Flex>
                </Flex>
              )}
              {cell.type === CellType.ActionTermination && (
                <>
                  <Flex gap={2}>
                    <Icon as={BiFlag} />
                    <Text>Send completed status email to respondent</Text>
                  </Flex>
                  <Flex gap={2}>
                    <Icon as={BiNoEntry} />
                    <Text>End route</Text>
                  </Flex>
                </>
              )}
            </Flex>
          </Flex>
        ),
      }
    }
    case CellType.ActionTerminationRowBlank:
      return {
        props: { bg: 'brand.secondary.100' },
        content: <></>,
      }
    case CellType.ActionBlank: {
      const isSelected =
        editState.type === EditStateType.AddStep &&
        editState.parent === cell.parent
      return {
        props: {
          bgColor: isSelected ? 'interaction.main-subtle.default' : undefined,
        },
        content: (
          <Button
            variant="link"
            leftIcon={<BiPlus />}
            onClick={() =>
              setEditState({
                type: EditStateType.AddStep,
                parent: cell.parent,
              })
            }
            isDisabled={isDisabled}
          >
            Next step
          </Button>
        ),
      }
    }
    case CellType.Response:
      return {
        props: { rowSpan: cell.rowSpan },
        content: <>{cell.approved ? 'Approved' : 'Rejected'}</>,
      }
    case CellType.IncompleteRowBlank:
      return { content: <></> }
    case CellType.TriggerMerged:
    case CellType.ConditionAnswerMerged:
    case CellType.ConditionAnswerBlankMerged:
    case CellType.ResponseMerged:
    case CellType.ActionMerged:
      // Return null on merged cells to signify not even rendering the <Td> element
      return null
  }
}

const useRenderCells = (
  rawData: Record<string, RouteMapCell>[],
  editState: EditState,
  setEditState: Dispatch<SetStateAction<EditState>>,
): Record<string, RenderCell>[] => {
  return useMemo(
    () =>
      rawData.map((row) => {
        const newRow: Record<string, RenderCell> = {}
        Object.keys(row).forEach(
          (k) => (newRow[k] = renderCell({ editState, setEditState }, row[k])),
        )
        return newRow
      }),
    [editState, setEditState, rawData],
  )
}

const BuilderTable = ({
  routeMap,
  editState,
  setEditState,
}: BuilderContentProps) => {
  const { columns: rawColumns, data: rawData } = useBuilderTable(routeMap)

  const columnHelper = useMemo(
    () => createColumnHelper<Record<string, RenderCell>>(),
    [],
  )

  const columns = useMemo(
    () =>
      rawColumns
        .filter(
          ({ columnId }) =>
            // Remove columns where every cell is blank
            !rawData.every((row) => {
              const cell = row[columnId]
              return (
                cell.type === CellType.ConditionAnswerBlank ||
                cell.type === CellType.ConditionAnswerBlankMerged ||
                cell.type === CellType.ActionTerminationRowBlank ||
                cell.type === CellType.IncompleteRowBlank
              )
            }),
        )
        .map(({ columnId, header, meta }) =>
          columnHelper.accessor(columnId, {
            header,
            meta,
          }),
        ),
    [columnHelper, rawColumns, rawData],
  )

  const data = useRenderCells(rawData, editState, setEditState)

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table colorScheme="secondary" borderBottom="1px" borderColor="neutral.300">
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const hasBorderRight = get(
                header.column.columnDef.meta,
                'hasBorderRight',
              ) as boolean

              return (
                <Th
                  position="sticky"
                  top="0"
                  zIndex={1}
                  minW={250}
                  key={header.id}
                  {...(hasBorderRight ? { borderRight: '1px' } : {})}
                  borderRightColor="neutral.300"
                  borderBottomColor="neutral.300"
                  bg="primary.100"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Th>
              )
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const renderOptions = cell.getValue() as RenderCell
              if (!renderOptions) return null
              const { props, content } = renderOptions

              const hasBorderRight = get(
                cell.column.columnDef.meta,
                'hasBorderRight',
              ) as boolean

              return (
                <Td
                  key={cell.id}
                  borderBottom="none"
                  borderTop="1px"
                  verticalAlign="top"
                  {...(hasBorderRight ? { borderRight: '1px' } : {})}
                  borderRightColor="neutral.300"
                  borderTopColor="neutral.300"
                  {...props}
                >
                  {content}
                </Td>
              )
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

export const BuilderContent = (props: BuilderContentProps) => {
  return (
    <Box h="calc(100vh - 64px)" display="block" overflow="auto">
      <BuilderTable {...props} />
    </Box>
  )
}
