import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RelayhostEditOptions } from "./relayhostEditOptionsSchema.js"
import { relayhostEditOptionsSchema } from "./relayhostEditOptionsSchema.js"

/**
 * `POST /edit/relayhost` (`relayhost('edit', ['id' => $items] + $attr)`).
 * Raw JSON body is `{attr, items}`. The password travels in the request
 * body but is never logged by this client.
 */
export async function relayhostEdit(options: RelayhostEditOptions): PromiseResult<string[]> {
  const op = "relayhostEdit"
  const parsed = a.safeParse(relayhostEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/relayhost"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
