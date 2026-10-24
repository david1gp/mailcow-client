import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { OAuth2ClientEditOptions } from "./oauth2ClientEditOptionsSchema.js"
import { oauth2ClientEditOptionsSchema } from "./oauth2ClientEditOptionsSchema.js"

/**
 * `POST /edit/oauth2-client`. Raw JSON body is `{attr, items}`
 * (`json_api.php:1891-1893`).
 */
export async function oauth2ClientEdit(options: OAuth2ClientEditOptions): PromiseResult<string[]> {
  const op = "oauth2ClientEdit"
  const parsed = a.safeParse(oauth2ClientEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/oauth2-client"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
