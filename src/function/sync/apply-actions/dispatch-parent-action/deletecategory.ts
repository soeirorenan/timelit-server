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

import { DeleteCategoryAction } from '../../../../action'
import { Cache } from '../cache'

export async function dispatchDeleteCategory ({ action, cache }: {
  action: DeleteCategoryAction
  cache: Cache
}) {
  // no version number needs to be updated
  const { familyId, transaction } = cache
  const { categoryId } = action

  await cache.database.timelimitRule.destroy({
    where: {
      familyId,
      categoryId
    },
    transaction
  })

  await cache.database.usedTime.destroy({
    where: {
      familyId,
      categoryId
    },
    transaction
  })

  await cache.database.categoryApp.destroy({
    where: {
      familyId,
      categoryId
    },
    transaction
  })

  const [affectedUserRows] = await cache.database.user.update({
    categoryForNotAssignedApps: ''
  }, {
    where: {
      familyId,
      categoryForNotAssignedApps: categoryId
    },
    transaction
  })

  await cache.database.category.destroy({
    where: {
      familyId,
      categoryId
    },
    transaction
  })

  // update the cache
  cache.doesCategoryExist.cache.set(action.categoryId, false)
  cache.areChangesImportant = true

  if (affectedUserRows !== 0) {
    cache.invalidiateUserList = true
  }
}
