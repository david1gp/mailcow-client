import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxTemplate } from "./mailboxTemplate.js"
import type { MailboxTemplateListOptions } from "./mailboxTemplateListOptionsSchema.js"
import { mailboxTemplateListOptionsSchema } from "./mailboxTemplateListOptionsSchema.js"

/** `GET /get/mailbox/template/all`. Empty lists echo `{}` — normalized to `[]`. */
export async function mailboxTemplateList(options: MailboxTemplateListOptions): PromiseResult<MailboxTemplate[]> {
  const op = "mailboxTemplateList"
  const parsed = a.safeParse(mailboxTemplateListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/mailbox/template/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<MailboxTemplate>(requested.data))
}
