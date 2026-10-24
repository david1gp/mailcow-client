import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RatelimitDomainEditOptions } from "./ratelimitDomainEditOptionsSchema.js"
import { ratelimitDomainEditOptionsSchema } from "./ratelimitDomainEditOptionsSchema.js"

/**
 * `POST /edit/rl-domain`. Raw JSON body is `{attr, items}`
 * (`ratelimit('edit', 'domain', ...)`).
 */
export async function ratelimitDomainEdit(options: RatelimitDomainEditOptions): PromiseResult<string[]> {
  const op = "ratelimitDomainEdit"
  const parsed = a.safeParse(ratelimitDomainEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/rl-domain"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
