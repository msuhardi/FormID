import { Result } from 'neverthrow'

import { ForbiddenFormError } from '../form.errors'

export enum PermissionLevel {
  Read = 'read',
  Write = 'write',
  Delete = 'delete',
}

export type FormPermissionResult = Result<true, ForbiddenFormError>
