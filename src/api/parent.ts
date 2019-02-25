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

import { json } from 'body-parser'
import { Router } from 'express'
import { BadRequest, Unauthorized } from 'http-errors'
import { Database } from '../database'
import { removeDevice } from '../function/device/remove-device'
import { canRecoverPassword } from '../function/parent/can-recover-password'
import { createAddDeviceToken } from '../function/parent/create-add-device-token'
import { createFamily } from '../function/parent/create-family'
import { getStatusByMailToken } from '../function/parent/get-status-by-mail-address'
import { linkMailAddress } from '../function/parent/link-mail-address'
import { recoverParentPassword } from '../function/parent/recover-parent-password'
import { signInIntoFamily } from '../function/parent/sign-in-into-family'
import { WebsocketApi } from '../websocket'
import {
  isCanRecoverPasswordRequest, isCreateFamilyByMailTokenRequest,
  isCreateRegisterDeviceTokenRequest, isLinkParentMailAddressRequest,
  isMailAuthTokenRequestBody, isRecoverParentPasswordRequest,
  isRemoveDeviceRequest, isSignIntoFamilyRequest
} from './validator'

export const createParentRouter = ({ database, websocket }: {database: Database, websocket: WebsocketApi}) => {
  const router = Router()

  router.post('/get-status-by-mail-address', json(), async (req, res, next) => {
    try {
      if (!isMailAuthTokenRequestBody(req.body)) {
        throw new BadRequest()
      }

      const { mailAuthToken } = req.body
      const { status, mail } = await getStatusByMailToken({ database, mailAuthToken })

      res.json({ status, mail })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/create-family', json(), async (req, res, next) => {
    try {
      if (!isCreateFamilyByMailTokenRequest(req.body)) {
        throw new BadRequest()
      }

      const result = await createFamily({
        database,
        firstParentDevice: req.body.parentDevice,
        mailAuthToken: req.body.mailAuthToken,
        password: req.body.parentPassword,
        deviceName: req.body.deviceName,
        parentName: req.body.parentName,
        timeZone: req.body.timeZone
      })

      res.json({
        deviceAuthToken: result.deviceAuthToken,
        ownDeviceId: result.deviceId
      })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/sign-in-into-family', json(), async (req, res, next) => {
    try {
      if (!isSignIntoFamilyRequest(req.body)) {
        throw new BadRequest()
      }

      const result = await signInIntoFamily({
        database,
        newDeviceInfo: req.body.parentDevice,
        mailAuthToken: req.body.mailAuthToken,
        deviceName: req.body.deviceName,
        websocket
      })

      res.json({
        deviceAuthToken: result.deviceAuthToken,
        ownDeviceId: result.deviceId
      })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/can-recover-password', json(), async (req, res, next) => {
    try {
      if (!isCanRecoverPasswordRequest(req.body)) {
        throw new BadRequest()
      }

      const canRecover = await canRecoverPassword({
        database,
        parentUserId: req.body.parentUserId,
        mailAuthToken: req.body.mailAuthToken
      })

      res.json({ canRecover })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/recover-parent-password', json(), async (req, res, next) => {
    try {
      if (!isRecoverParentPasswordRequest(req.body)) {
        throw new BadRequest()
      }

      await recoverParentPassword({
        database,
        websocket,
        password: req.body.password,
        mailAuthToken: req.body.mailAuthToken
      })

      res.json({ ok: true })
    } catch (ex) {
      next(ex)
    }
  })

  async function assertAuthValidAndReturnDeviceEntry ({ deviceAuthToken, parentId, secondPasswordHash }: {
    deviceAuthToken: string
    parentId: string
    secondPasswordHash: string
  }) {
    const deviceEntry = await database.device.findOne({
      where: {
        deviceAuthToken: deviceAuthToken
      }
    })

    if (!deviceEntry) {
      throw new Unauthorized()
    }

    if (secondPasswordHash === 'device') {
      if (!deviceEntry.isUserKeptSignedIn) {
        throw new Unauthorized()
      }

      const parentEntry = await database.user.findOne({
        where: {
          familyId: deviceEntry.familyId,
          type: 'parent',
          userId: deviceEntry.currentUserId
        }
      })

      if (!parentEntry) {
        throw new Unauthorized()
      }
    } else {
      const parentEntry = await database.user.findOne({
        where: {
          familyId: deviceEntry.familyId,
          type: 'parent',
          userId: parentId,
          secondPasswordHash: secondPasswordHash
        }
      })

      if (!parentEntry) {
        throw new Unauthorized()
      }
    }

    return deviceEntry
  }

  router.post('/create-add-device-token', json(), async (req, res, next) => {
    try {
      if (!isCreateRegisterDeviceTokenRequest(req.body)) {
        throw new BadRequest()
      }

      const deviceEntry = await assertAuthValidAndReturnDeviceEntry({
        deviceAuthToken: req.body.deviceAuthToken,
        parentId: req.body.parentId,
        secondPasswordHash: req.body.parentPasswordSecondHash
      })

      const { token, deviceId } = await createAddDeviceToken({ familyId: deviceEntry.familyId, database })

      res.json({ token, deviceId })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/link-mail-address', json(), async (req, res, next) => {
    try {
      if (!isLinkParentMailAddressRequest(req.body)) {
        throw new BadRequest()
      }

      await linkMailAddress({
        mailAuthToken: req.body.mailAuthToken,
        deviceAuthToken: req.body.deviceAuthToken,
        parentPasswordSecondHash: req.body.parentPasswordSecondHash,
        parentUserId: req.body.parentUserId,
        websocket,
        database
      })

      res.json({ ok: true })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/remove-device', json(), async (req, res, next) => {
    try {
      if (!isRemoveDeviceRequest(req.body)) {
        throw new BadRequest()
      }

      const deviceEntry = await assertAuthValidAndReturnDeviceEntry({
        deviceAuthToken: req.body.deviceAuthToken,
        parentId: req.body.parentUserId,
        secondPasswordHash: req.body.parentPasswordSecondHash
      })

      await removeDevice({
        database,
        familyId: deviceEntry.familyId,
        deviceId: req.body.deviceId,
        websocket
      })

      res.json({ ok: true })
    } catch (ex) {
      next(ex)
    }
  })

  return router
}
