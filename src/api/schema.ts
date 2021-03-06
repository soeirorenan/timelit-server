/*
 * server component for the TimeLimit App
 * Copyright (C) 2019 - 2021 Jonas Lochmann
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

import { ClientDataStatus } from '../object/clientdatastatus'
import { optionalPasswordRegex, optionalSaltRegex } from '../util/password'

export interface ClientPushChangesRequest {
  deviceAuthToken: string
  actions: Array<ClientPushChangesRequestAction>
}

export interface ClientPushChangesRequestAction {
  encodedAction: string
  sequenceNumber: number
  integrity: string
  type: 'appLogic' | 'parent' | 'child'
  userId: string
}

export interface ClientPullChangesRequest {
  deviceAuthToken: string
  status: ClientDataStatus
}

export interface MailAuthTokenRequestBody {
  mailAuthToken: string
}

export interface NewDeviceInfo {
  model: string
}

export interface ParentPassword {
  hash: string
  secondHash: string
  secondSalt: string
}

export const assertParentPasswordValid = (password: ParentPassword) => {
  if (password.hash === '' || password.secondHash === '' || password.secondSalt === '') {
    throw new ParentPasswordValidationException('missing fields at parent password')
  }

  if (!(optionalPasswordRegex.test(password.hash) && optionalPasswordRegex.test(password.secondHash) && optionalSaltRegex.test(password.secondSalt))) {
    throw new ParentPasswordValidationException('invalid parent password')
  }
}

export class ParentPasswordValidationException extends Error {}

export interface CreateFamilyByMailTokenRequest {
  mailAuthToken: string
  parentPassword: ParentPassword
  parentDevice: NewDeviceInfo
  deviceName: string
  timeZone: string
  parentName: string
}

export interface SignIntoFamilyRequest {
  mailAuthToken: string
  parentDevice: NewDeviceInfo
  deviceName: string
}

export interface RecoverParentPasswordRequest {
  mailAuthToken: string
  password: ParentPassword
}

export interface RegisterChildDeviceRequest {
  registerToken: string
  childDevice: NewDeviceInfo
  deviceName: string
}

export interface CreateRegisterDeviceTokenRequest {
  deviceAuthToken: string
  parentId: string
  parentPasswordSecondHash: string
}

export interface CanDoPurchaseRequest {
  type: 'googleplay' | 'any'
  deviceAuthToken: string
}

export interface FinishPurchaseByGooglePlayRequest {
  deviceAuthToken: string
  receipt: string
  signature: string
}

export interface LinkParentMailAddressRequest {
  mailAuthToken: string
  deviceAuthToken: string
  parentUserId: string
  parentPasswordSecondHash: string
}

export interface UpdatePrimaryDeviceRequest {
  action: 'set this device' | 'unset this device'
  currentUserId: string
  authToken: string
}

export interface RemoveDeviceRequest {
  deviceAuthToken: string
  parentUserId: string
  parentPasswordSecondHash: string
  deviceId: string
}

export interface RequestWithAuthToken {
  deviceAuthToken: string
}

export interface SendMailLoginCodeRequest {
  mail: string
  locale: string
}

export interface SignInByMailCodeRequest {
  mailLoginToken: string
  receivedCode: string
}

export { SerializedParentAction, SerializedChildAction, SerializedAppLogicAction } from '../action/serialization'
export { ServerDataStatus } from '../object/serverdatastatus'
