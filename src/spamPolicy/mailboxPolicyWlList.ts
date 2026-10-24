import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxPolicyWlListOptions } from "./mailboxPolicyWlListOptionsSchema.js"
import { mailboxPolicyWlListOptionsSchema } from "./mailboxPolicyWlListOptionsSchema.js"
import type { PolicyListEntryDetails } from "./policyListEntryDetails.js"

/** `GET /get/policy_wl_mailbox/{mailbox}`. Empty echoes are normalized to `[]`. */
export async function mailboxPolicyWlList(
  options: MailboxPolicyWlListOptions,
): PromiseResult<PolicyListEntryDetails[]> {
  const op = "mailboxPolicyWlList"
  const parsed = a.safeParse(mailboxPolicyWlListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/policy_wl_mailbox/${encodeURIComponent(mailbox)}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<PolicyListEntryDetails>(requested.data))
}
