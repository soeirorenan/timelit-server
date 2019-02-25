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

import { Conflict, Unauthorized } from 'http-errors'
import { Database } from '../../database'
import { WebsocketApi } from '../../websocket'

export const logoutAtPrimaryDevice = async ({ deviceAuthToken, database, websocket }: {
  deviceAuthToken: string
  database: Database
  websocket: WebsocketApi
}) => {
  await database.transaction(async (transaction) => {
    const ownDeviceEntryUnsafe = await database.device.findOne({
      where: {
        deviceAuthToken
      },
      transaction,
      attributes: ['familyId', 'currentUserId', 'deviceId']
    })

    if (!ownDeviceEntryUnsafe) {
      throw new Unauthorized()
    }

    const ownDeviceEntry = {
      familyId: ownDeviceEntryUnsafe.familyId,
      currentUserId: ownDeviceEntryUnsafe.currentUserId
    }

    const deviceUserEntryUnsafe = await database.user.findOne({
      where: {
        familyId: ownDeviceEntry.familyId,
        userId: ownDeviceEntry.currentUserId,
        type: 'child'
      },
      attributes: ['currentDevice'],
      transaction
    })

    if (!deviceUserEntryUnsafe) {
      throw new Conflict()
    }

    const deviceUserEntry = {
      currentDevice: deviceUserEntryUnsafe.currentDevice
    }

    const otherDeviceEntryUnsafe = await database.device.findOne({
      where: {
        familyId: ownDeviceEntry.familyId,
        deviceId: deviceUserEntry.currentDevice,
        currentUserId: ownDeviceEntry.currentUserId
      },
      attributes: ['deviceAuthToken'],
      transaction
    })

    if (!otherDeviceEntryUnsafe) {
      throw new Conflict()
    }

    const otherDeviceEntry = {
      deviceAuthToken: otherDeviceEntryUnsafe.deviceAuthToken
    }

    websocket.triggerLogoutByDeviceAuthToken({
      deviceAuthToken: otherDeviceEntry.deviceAuthToken
    })
  })
}
