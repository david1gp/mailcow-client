import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxPolicyBlListOptions } from "./mailboxPolicyBlListOptionsSchema.js"
import { mailboxPolicyBlListOptionsSchema } from "./mailboxPolicyBlListOptionsSchema.js"
import type { PolicyListEntryDetails } from "./policyListEntryDetails.js"

/** `GET /get/policy_bl_mailbox/{mailbox}`. Empty echoes are normalized to `[]`. */
export async function mailboxPolicyBlList(
  options: MailboxPolicyBlListOptions,
): PromiseResult<PolicyListEntryDetails[]> {
  const op = "mailboxPolicyBlList"
  const parsed = a.safeParse(mailboxPolicyBlListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/policy_bl_mailbox/${encodeURIComponent(mailbox)}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<PolicyListEntryDetails>(requested.data))
}
