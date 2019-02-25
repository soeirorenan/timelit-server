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

import { ChildSignInAction, SetDeviceUserAction } from '../../../../action'
import { Cache } from '../cache'
import { dispatchSetDeviceUser } from '../dispatch-parent-action/setdeviceuser'

export const dispatchChildSignIn = async ({ action, deviceId, childUserId, cache }: {
  action: ChildSignInAction
  deviceId: string
  childUserId: string
  cache: Cache
}) => {
  if (!cache.hasFullVersion) {
    throw new Error('action requires full version')
  }

  await dispatchSetDeviceUser({
    action: new SetDeviceUserAction({
      deviceId,
      userId: childUserId
    }),
    cache
  })

  const userEntryUnsafe = await cache.database.user.findOne({
    where: {
      familyId: cache.familyId,
      type: 'child',
      userId: childUserId
    },
    transaction: cache.transaction,
    attributes: [
      'currentDevice'
    ]
  })

  if (!userEntryUnsafe) {
    throw new Error('illegal state')
  }

  if (userEntryUnsafe.currentDevice === deviceId) {
    // unassign to prevent way aroundprimary device rule

    await cache.database.user.update({
      currentDevice: ''
    }, {
      where: {
        familyId: cache.familyId,
        type: 'child',
        userId: childUserId
      },
      transaction: cache.transaction
    })

    cache.invalidiateUserList = true
  }
}
