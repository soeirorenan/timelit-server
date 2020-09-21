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

import { UserFlags } from '../model/userflags'
import { assertIdWithinFamily } from '../util/token'
import { ParentAction } from './basetypes'

export class UpdateUserFlagsAction extends ParentAction {
  readonly userId: string
  readonly modifiedBits: number
  readonly newValues: number

  constructor ({ userId, modifiedBits, newValues }: {
    userId: string
    modifiedBits: number
    newValues: number
  }) {
    super()

    assertIdWithinFamily(userId)

    if ((!Number.isSafeInteger(modifiedBits)) || (!Number.isSafeInteger(newValues))) {
      throw new Error('flags must be an integer')
    }

    if ((modifiedBits | UserFlags.ALL_FLAGS) !== UserFlags.ALL_FLAGS || (modifiedBits | newValues) !== modifiedBits) {
      throw new Error('flags are out of the valid range')
    }

    this.userId = userId
    this.modifiedBits = modifiedBits
    this.newValues = newValues
  }

  static parse = ({ userId, modified, values }: SerializedUpdateUserFlagsAction) => (
    new UpdateUserFlagsAction({
      userId,
      modifiedBits: modified,
      newValues: values
    })
  )
}

export interface SerializedUpdateUserFlagsAction {
  type: 'UPDATE_USER_FLAGS'
  userId: string
  modified: number
  values: number
}
