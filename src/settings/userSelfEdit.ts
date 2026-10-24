import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { UserSelfEditOptions } from "./userSelfEditOptionsSchema.js"
import { userSelfEditOptionsSchema } from "./userSelfEditOptionsSchema.js"

/**
 * `POST /edit/self` as mailbox user (`edit_user_account($attr)`,
 * `json_api.php:2044-2051`). Session-only: the router branches on the
 * session role and an API key always assumes `role=admin`, so this op only
 * takes effect with a user cookie session. Distinct from
 * {@link domainAdminSelfEdit} (Batch B), which hits the same router path but
 * takes the domainadmin branch — hence the separate user-named op and the
 * separate `settings self-edit` CLI route.
 */
export async function userSelfEdit(options: UserSelfEditOptions): PromiseResult<string[]> {
  const op = "userSelfEdit"
  const parsed = a.safeParse(userSelfEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/self"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
