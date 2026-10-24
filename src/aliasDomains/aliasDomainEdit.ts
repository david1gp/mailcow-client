import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AliasDomainEditOptions } from "./aliasDomainEditOptionsSchema.js"
import { aliasDomainEditOptionsSchema } from "./aliasDomainEditOptionsSchema.js"

/**
 * `POST /edit/alias-domain` (`functions.mailbox.inc.php:1852-`).
 * Raw JSON body is `{attr, items}`.
 */
export async function aliasDomainEdit(options: AliasDomainEditOptions): PromiseResult<string[]> {
  const op = "aliasDomainEdit"
  const parsed = a.safeParse(aliasDomainEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/alias-domain"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
