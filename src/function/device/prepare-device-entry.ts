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

import { NewDeviceInfo } from '../../api/schema'
import { DeviceAttributes } from '../../database/device'
import { generateVersionId } from '../../util/token'

export const prepareDeviceEntry = ({ familyId, userId, deviceAuthToken, deviceId, deviceName, newDeviceInfo }: {
  familyId: string
  userId: string
  deviceAuthToken: string
  deviceId: string
  deviceName: string
  newDeviceInfo: NewDeviceInfo
}): DeviceAttributes => ({
  familyId,
  deviceId,
  currentUserId: userId,
  installedAppsVersion: generateVersionId(),
  name: deviceName,
  model: newDeviceInfo.model,
  addedAt: Date.now().toString(10),
  deviceAuthToken,
  networkTime: 'disabled',
  nextSequenceNumber: 0,
  currentProtectionLevel: 'none',
  highestProtectionLevel: 'none',
  currentUsageStatsPermission: 'not granted',
  highestUsageStatsPermission: 'not granted',
  currentNotificationAccessPermission: 'not granted',
  highestNotificationAccessPermission: 'not granted',
  currentAppVersion: 0,
  highestAppVersion: 0,
  triedDisablingDeviceAdmin: false,
  didReboot: false,
  hadManipulation: false,
  lastConnectivity: '0',
  notSeenForLongTime: false,
  didDeviceReportUninstall: false,
  isUserKeptSignedIn: false,
  showDeviceConnected: false,
  defaultUserId: '',
  defaultUserTimeout: 0,
  considerRebootManipulation: false
})
