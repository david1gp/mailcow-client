import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { Fail2banEditOptions } from "./fail2banEditOptionsSchema.js"
import { fail2banEditOptionsSchema } from "./fail2banEditOptionsSchema.js"

/**
 * `POST /edit/fail2ban`. Items carry the network; attr carries the
 * fail2ban options (`fail2ban('edit', {network} + $attr)`).
 * Bans drop ALL traffic from an IP (netfilter INPUT) — edit with care.
 */
export async function fail2banEdit(options: Fail2banEditOptions): PromiseResult<string[]> {
  const op = "fail2banEdit"
  const parsed = a.safeParse(fail2banEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/fail2ban"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
