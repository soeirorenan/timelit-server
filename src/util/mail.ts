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

import { parseOneAddress } from 'email-addresses'
import * as Email from 'email-templates'
import { join } from 'path'
import { config } from '../config'
import { IllegalStateException } from '../exception'

const mailimprint = process.env.MAIL_IMPRINT || 'not defined'
const mailServerBlacklist = (process.env.MAIL_SERVER_BLACKLIST || '').split(',').filter((item) => !!item)

const email = new Email({
  message: {
    from: process.env.MAIL_SENDER || ''
  },
  transport: JSON.parse(process.env.MAIL_TRANSPORT || 'null') || undefined,
  views: {
    options: {
      extension: 'ejs'
    }
  }
})

export const sendAuthenticationMail = async ({ receiver, code, locale }: {receiver: string, code: string, locale: string}) => {
  await email.send({
    template: join(__dirname, '../../other/mail/login'),
    message: {
      to: receiver
    },
    locals: {
      subject: locale === 'de' ? 'Anmeldung bei TimeLimit' : 'Sign in at TimeLimit',
      introtext: locale === 'de' ? 'Geben Sie zum Authentifizieren folgenden Code in TimeLimit ein' : 'To authenticate, enter the following code in TimeLimit',
      code,
      outrotext: locale === 'de' ? 'Geben Sie diesen Code nicht an Dritte weiter.' : 'Do not share this code with third parties.',
      mailimprint
    }
  })
}

export const sendManipulationWarningMail = async ({ receiver, deviceName }: {
  receiver: string
  deviceName: string
}) => {
  await email.send({
    template: join(__dirname, '../../other/mail/manipulation'),
    message: {
      to: receiver
    },
    locals: {
      subject: 'TimeLimit@' + deviceName + ' - Manipulation',
      deviceName,
      mailimprint
    }
  })
}

export const sendUninstallWarningMail = async ({ receiver, deviceName }: {
  receiver: string
  deviceName: string
}) => {
  await email.send({
    template: join(__dirname, '../../other/mail/uninstall'),
    message: {
      to: receiver
    },
    locals: {
      subject: 'TimeLimit removed from ' + deviceName,
      deviceName,
      mailimprint
    }
  })
}

export const sendTaskDoneMail = async ({ receiver, child, task }: {
  receiver: string
  child: string
  task: string
}) => {
  await email.send({
    template: join(__dirname, '../../other/mail/taskdone'),
    message: {
      to: receiver
    },
    locals: { child, task, mailimprint }
  })
}

export function isMailServerBlacklisted (mail: string): boolean {
  const parts = mail.split('@')
  const domain = parts[parts.length - 1]

  return mailServerBlacklist.indexOf(domain.toLowerCase()) !== -1
}

export function isMailAddressCoveredByWhitelist (mail: string): boolean {
  if (config.mailWhitelist.length === 0) {
    return true
  }

  const mailParts = mail.split('@')
  const mailDomain = mailParts[mailParts.length - 1]

  for (let i = 0; i < config.mailWhitelist.length; i++) {
    const whtielistItem = config.mailWhitelist[i]

    const isDomain = whtielistItem.indexOf('@') === -1

    if (isDomain) {
      if (mailDomain === whtielistItem) {
        return true
      }
    } else {
      if (mail === whtielistItem) {
        return true
      }
    }
  }

  return false
}

export function sanitizeMailAddress (input: string): string | null {
  const parsed = parseOneAddress(input)

  if ((!parsed) || (parsed.type !== 'mailbox')) {
    return null
  }

  const address = (parsed as any).address

  if (typeof address !== 'string') {
    throw new IllegalStateException({ staticMessage: 'mail address is not a string' })
  }

  return address
}
