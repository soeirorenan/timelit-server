/*
 * server component for the TimeLimit App
 * Copyright (C) 2019 - 2020 Jonas Lochmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { assertIdWithinFamily } from '../util/token'
import { ParentAction } from './basetypes'

export class ResetParentBlockedTimesAction extends ParentAction {
  readonly parentId: string

  constructor ({ parentId }: {
    parentId: string
  }) {
    super()

    assertIdWithinFamily(parentId)

    this.parentId = parentId
  }

  static parse = ({ parentId }: SerializedResetParentBlockedTimesAction) => (
    new ResetParentBlockedTimesAction({
      parentId
    })
  )
}

export interface SerializedResetParentBlockedTimesAction {
  type: 'RESET_PARENT_BLOCKED_TIMES'
  parentId: string
}
