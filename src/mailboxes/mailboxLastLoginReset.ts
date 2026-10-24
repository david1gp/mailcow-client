import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxLastLoginResetOptions } from "./mailboxLastLoginResetOptionsSchema.js"
import { mailboxLastLoginResetOptionsSchema } from "./mailboxLastLoginResetOptionsSchema.js"

/**
 * `GET /get/reset-last-login/{user}` (`json_api.php:716-722`, "Todo: move to
 * delete"). Routed under the `get` action, whose method gate enforces GET
 * (`json_api.php:358-365`), so this is a GET despite resetting state.
 */
export async function mailboxLastLoginReset(options: MailboxLastLoginResetOptions): PromiseResult<unknown> {
  const op = "mailboxLastLoginReset"
  const parsed = a.safeParse(mailboxLastLoginResetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, user } = parsed.output
  return mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/reset-last-login/${encodeURIComponent(user)}`),
  })
}
