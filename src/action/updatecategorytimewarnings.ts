/*
 * server component for the TimeLimit App
 * Copyright (C) 2019 Jonas Lochmann
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

import { allowedTimeWarningFlags } from '../database/category'
import { assertIdWithinFamily } from '../util/token'
import { ParentAction } from './basetypes'

export class UpdateCategoryTimeWarningsAction extends ParentAction {
  readonly categoryId: string
  readonly enable: boolean
  readonly flags: number

  constructor ({ categoryId, enable, flags }: {
    categoryId: string
    enable: boolean
    flags: number
  }) {
    super()

    assertIdWithinFamily(categoryId)

    if ((flags & allowedTimeWarningFlags) !== flags) {
      throw new Error('illegal flags')
    }

    this.categoryId = categoryId
    this.enable = enable
    this.flags = flags
  }

  serialize = (): SerializedUpdateCategoryTimeWarningsAction => ({
    type: 'UPDATE_CATEGORY_TIME_WARNINGS',
    categoryId: this.categoryId,
    enable: this.enable,
    flags: this.flags
  })

  static parse = ({ categoryId, enable, flags }: SerializedUpdateCategoryTimeWarningsAction) => (
    new UpdateCategoryTimeWarningsAction({ categoryId, enable, flags })
  )
}

export interface SerializedUpdateCategoryTimeWarningsAction {
  type: 'UPDATE_CATEGORY_TIME_WARNINGS'
  categoryId: string
  enable: boolean
  flags: number
}