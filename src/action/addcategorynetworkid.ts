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

import { anonymizedNetworkIdLength } from '../database/categorynetworkid'
import { assertIsHexString } from '../util/hexstring'
import { assertIdWithinFamily } from '../util/token'
import { ParentAction } from './basetypes'

export class AddCategoryNetworkIdAction extends ParentAction {
  readonly categoryId: string
  readonly itemId: string
  readonly hashedNetworkId: string

  constructor ({ categoryId, itemId, hashedNetworkId }: {
    categoryId: string
    itemId: string
    hashedNetworkId: string
  }) {
    super()

    assertIdWithinFamily(categoryId)
    assertIdWithinFamily(itemId)
    assertIsHexString(hashedNetworkId)
    if (hashedNetworkId.length !== anonymizedNetworkIdLength) throw new Error('wrong network id length')

    this.categoryId = categoryId
    this.itemId = itemId
    this.hashedNetworkId = hashedNetworkId
  }

  serialize = (): SerializedAddCategoryNetworkIdAction => ({
    type: 'ADD_CATEGORY_NETWORK_ID',
    categoryId: this.categoryId,
    itemId: this.itemId,
    hashedNetworkId: this.hashedNetworkId
  })

  static parse = ({ categoryId, itemId, hashedNetworkId }: SerializedAddCategoryNetworkIdAction) => (
    new AddCategoryNetworkIdAction({
      categoryId,
      itemId,
      hashedNetworkId
    })
  )
}

export interface SerializedAddCategoryNetworkIdAction {
  type: 'ADD_CATEGORY_NETWORK_ID'
  categoryId: string
  itemId: string
  hashedNetworkId: string
}
