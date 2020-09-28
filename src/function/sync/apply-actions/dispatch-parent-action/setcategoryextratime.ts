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

import { SetCategoryExtraTimeAction } from '../../../../action'
import { Cache } from '../cache'
import { MissingCategoryException } from '../exception/missing-item'
import { PremiumVersionMissingException } from '../exception/premium'

export async function dispatchSetCategoryExtraTime ({ action, cache }: {
  action: SetCategoryExtraTimeAction
  cache: Cache
}) {
  if (!cache.hasFullVersion) {
    throw new PremiumVersionMissingException()
  }

  const oldItem = await cache.database.category.findOne({
    where: {
      familyId: cache.familyId,
      categoryId: action.categoryId
    },
    transaction: cache.transaction
  })

  if (!oldItem) {
    throw new MissingCategoryException()
  }

  await cache.database.category.update({
    extraTimeInMillis: action.newExtraTime,
    extraTimeDay: action.day
  }, {
    where: {
      familyId: cache.familyId,
      categoryId: action.categoryId
    },
    transaction: cache.transaction
  })

  cache.categoriesWithModifiedBaseData.push(action.categoryId)
  cache.areChangesImportant = true
}
