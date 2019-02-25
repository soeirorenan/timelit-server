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
import { BadRequest } from 'http-errors'
import { Database } from '../database'
import { addChildDevice } from '../function/child/add-device'
import { logoutAtPrimaryDevice } from '../function/child/logout-at-primary-device'
import { setPrimaryDevice } from '../function/child/set-primary-device'
import { WebsocketApi } from '../websocket'
import { isRegisterChildDeviceRequest, isRequestWithAuthToken, isUpdatePrimaryDeviceRequest } from './validator'

export const createChildRouter = ({ database, websocket }: {
  database: Database,
  websocket: WebsocketApi
}) => {
  const router = Router()

  router.post('/add-device', json(), async (req, res, next) => {
    try {
      if (!isRegisterChildDeviceRequest(req.body)) {
        throw new BadRequest()
      }

      const { deviceAuthToken, deviceId } = await addChildDevice({
        request: req.body,
        database,
        websocket
      })

      res.json({
        deviceAuthToken,
        ownDeviceId: deviceId
      })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/update-primary-device', json(), async (req, res, next) => {
    try {
      if (!isUpdatePrimaryDeviceRequest(req.body)) {
        throw new BadRequest()
      }

      const response = await setPrimaryDevice({
        database,
        deviceAuthToken: req.body.authToken,
        currentUserId: req.body.currentUserId,
        websocket,
        action: req.body.action
      })

      res.json({
        status: response
      })
    } catch (ex) {
      next(ex)
    }
  })

  router.post('/logout-at-primary-device', json(), async (req, res, next) => {
    try {
      if (!isRequestWithAuthToken(req.body)) {
        throw new BadRequest()
      }

      await logoutAtPrimaryDevice({
        deviceAuthToken: req.body.deviceAuthToken,
        database,
        websocket
      })

      res.json({
        ok: true
      })
    } catch (ex) {
      next(ex)
    }
  })

  return router
}
