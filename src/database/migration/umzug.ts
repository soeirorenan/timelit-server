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

import { resolve } from 'path'
import { Sequelize } from 'sequelize'
import * as Umzug from 'umzug'

export const createUmzug = (sequelize: Sequelize) => (
  new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize
    },
    migrations: {
      params: [sequelize.getQueryInterface(), sequelize],
      path: resolve(__dirname, '../../../build/database/migration/migrations'),
      pattern: /^\d+[\w-]+\.js$/
    }
  })
)
