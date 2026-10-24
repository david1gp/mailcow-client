import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxActiveUserSieve } from "./mailboxActiveUserSieve.js"
import type { MailboxActiveUserSieveGetOptions } from "./mailboxActiveUserSieveGetOptionsSchema.js"
import { mailboxActiveUserSieveGetOptionsSchema } from "./mailboxActiveUserSieveGetOptionsSchema.js"

/**
 * `GET /get/active-user-sieve/{mailbox}` (`json_api.php:1107-1115`).
 * Empty echoes `{}` — normalized to `[]`.
 */
export async function mailboxActiveUserSieveGet(
  options: MailboxActiveUserSieveGetOptions,
): PromiseResult<MailboxActiveUserSieve[]> {
  const op = "mailboxActiveUserSieveGet"
  const parsed = a.safeParse(mailboxActiveUserSieveGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/active-user-sieve/${encodeURIComponent(mailbox)}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<MailboxActiveUserSieve>(requested.data))
}
