import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxTemplate } from "./mailboxTemplate.js"
import type { MailboxTemplateGetOptions } from "./mailboxTemplateGetOptionsSchema.js"
import { mailboxTemplateGetOptionsSchema } from "./mailboxTemplateGetOptionsSchema.js"

/** `GET /get/mailbox/template/{id}`. Empty echoes `{}` (returned as-is). */
export async function mailboxTemplateGet(options: MailboxTemplateGetOptions): PromiseResult<MailboxTemplate> {
  const op = "mailboxTemplateGet"
  const parsed = a.safeParse(mailboxTemplateGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<MailboxTemplate>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/mailbox/template/${encodeURIComponent(String(id))}`),
  })
}
