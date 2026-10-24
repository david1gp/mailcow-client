import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxLastLogin } from "./mailboxLastLogin.js"
import type { MailboxLastLoginGetOptions } from "./mailboxLastLoginGetOptionsSchema.js"
import { mailboxLastLoginGetOptionsSchema } from "./mailboxLastLoginGetOptionsSchema.js"

/** `GET /get/last-login/{user}[/{days}]`, days default 7 (`json_api.php:703-713`). */
export async function mailboxLastLoginGet(options: MailboxLastLoginGetOptions): PromiseResult<MailboxLastLogin> {
  const op = "mailboxLastLoginGet"
  const parsed = a.safeParse(mailboxLastLoginGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, user, days } = parsed.output
  const suffix = days === undefined ? "" : `/${days}`
  return mailcowRequest<MailboxLastLogin>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/last-login/${encodeURIComponent(user)}${suffix}`),
  })
}
